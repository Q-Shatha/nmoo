import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { DiscountType, Prisma, ProductStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductAssetsService } from "./product-assets.service";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productAssetsService: ProductAssetsService,
  ) {}

  async findAll(query: ProductQueryDto) {
    if (!query.vendorId) {
      throw new BadRequestException("vendorId is required. Products can only be listed inside a store.");
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const where = this.buildListWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: this.productIncludes(),
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: await Promise.all(products.map((product) => this.serializeProduct(product))),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        status: {
          not: ProductStatus.ARCHIVED,
        },
        vendor: {
          OR: [{ theme: null }, { theme: { storeStatus: "ACTIVE" } }],
        },
      },
      include: this.productIncludes(),
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return this.serializeProduct(product);
  }

  async findMine(user: AuthenticatedUser) {
    await this.deleteExpiredArchivedProducts(user);

    const products = await this.prisma.product.findMany({
      where: user.role === UserRole.ADMIN ? {} : { vendorId: user.id },
      orderBy: {
        createdAt: "desc",
      },
      include: this.productIncludes(),
    });

    return Promise.all(products.map((product) => this.serializeProduct(product)));
  }

  async create(createProductDto: CreateProductDto, user: AuthenticatedUser) {
    if (createProductDto.categoryId) {
      await this.ensureCategoryExists(createProductDto.categoryId, user);
    }

    const discountData = this.buildDiscountData(createProductDto.price, createProductDto.discountType, createProductDto.discountValue);
    const optionCreates = this.buildOptionsCreate(createProductDto.options ?? [], createProductDto.price);
    const stock = optionCreates.length > 0 ? this.calculateOptionsStock(optionCreates) : (createProductDto.stock ?? 0);

    const product = await this.prisma.product.create({
      data: {
        title: createProductDto.title,
        slug: await this.createUniqueSlug(createProductDto.title),
        description: createProductDto.description,
        badgeLabel: this.normalizeOptionalText(createProductDto.badgeLabel),
        price: new Prisma.Decimal(createProductDto.price),
        discountType: discountData.discountType,
        discountValue: discountData.discountValue,
        stock,
        categoryId: createProductDto.categoryId,
        imageUrl: createProductDto.imageUrl,
        status: createProductDto.status ?? ProductStatus.DRAFT,
        vendorId: user.id,
        images: {
          create: this.buildImagesCreate(createProductDto.imageUrls ?? (createProductDto.imageUrl ? [createProductDto.imageUrl] : []), createProductDto.title),
        },
        options: {
          create: optionCreates,
        },
      },
      include: this.productIncludes(),
    });

    return this.serializeProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: AuthenticatedUser) {
    const product = await this.findEditableProduct(id, user);

    if (updateProductDto.categoryId) {
      await this.ensureCategoryExists(updateProductDto.categoryId, user);
    }

    const data: Prisma.ProductUpdateInput = {
      title: updateProductDto.title,
      description: updateProductDto.description,
      badgeLabel: this.normalizeOptionalText(updateProductDto.badgeLabel),
      stock: updateProductDto.stock,
      imageUrl: updateProductDto.imageUrl,
      status: updateProductDto.status,
    };
    const discountTouched = updateProductDto.discountType || typeof updateProductDto.discountValue === "number";

    if (typeof updateProductDto.price === "number") {
      if (!discountTouched && product.discountType && product.discountValue) {
        this.validateDiscountInput(updateProductDto.price, product.discountType, Number(product.discountValue));
      }

      data.price = new Prisma.Decimal(updateProductDto.price);
    }

    if (discountTouched) {
      const nextPrice = typeof updateProductDto.price === "number" ? updateProductDto.price : Number(product.price);
      const discountData = this.buildDiscountData(nextPrice, updateProductDto.discountType, updateProductDto.discountValue);

      if (!discountData.discountType) {
        data.discountType = null;
        data.discountValue = null;
      } else {
        data.discountType = discountData.discountType;
        data.discountValue = discountData.discountValue;
      }
    }

    if (updateProductDto.categoryId) {
      data.category = { connect: { id: updateProductDto.categoryId } };
    }

    if (updateProductDto.title && updateProductDto.title !== product.title) {
      data.slug = await this.createUniqueSlug(updateProductDto.title, id);
    }

    const optionCreates = updateProductDto.options ? this.buildOptionsCreate(updateProductDto.options, typeof updateProductDto.price === "number" ? updateProductDto.price : Number(product.price)) : undefined;

    if (optionCreates) {
      data.stock = optionCreates.length > 0 ? this.calculateOptionsStock(optionCreates) : updateProductDto.stock;
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(updateProductDto.imageUrls
          ? {
              images: {
                deleteMany: {},
                create: this.buildImagesCreate(updateProductDto.imageUrls, updateProductDto.title ?? product.title),
              },
            }
          : {}),
        ...(updateProductDto.options
          ? {
              options: {
                deleteMany: {},
                create: optionCreates,
              },
            }
          : {}),
      },
      include: this.productIncludes(),
    });

    return this.serializeProduct(updatedProduct);
  }

  async remove(id: string, user: AuthenticatedUser) {
    await this.findEditableProduct(id, user);

    const removedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.ARCHIVED,
        archivedAt: new Date(),
      },
      include: this.productIncludes(),
    });

    return this.serializeProduct(removedProduct);
  }

  async restore(id: string, user: AuthenticatedUser) {
    const product = await this.findOwnedProduct(id, user);

    if (product.status !== ProductStatus.ARCHIVED) {
      return this.serializeProduct(
        await this.prisma.product.findUniqueOrThrow({
          where: { id },
          include: this.productIncludes(),
        }),
      );
    }

    const restoredProduct = await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.DRAFT,
        archivedAt: null,
      },
      include: this.productIncludes(),
    });

    return this.serializeProduct(restoredProduct);
  }

  private buildListWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const andFilters: Prisma.ProductWhereInput[] = [];
    const where: Prisma.ProductWhereInput = {
      status: {
        not: ProductStatus.ARCHIVED,
      },
      vendor: {
        OR: [{ theme: null }, { theme: { storeStatus: "ACTIVE" } }],
      },
    };

    if (query.q) {
      andFilters.push({
        OR: [
          { title: { contains: query.q, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: query.q, mode: Prisma.QueryMode.insensitive } },
        ],
      });
    }

    if (query.category) {
      andFilters.push({
        OR: [{ categoryId: query.category }, { category: { slug: query.category } }],
      });
    }

    if (query.filter === "discounts") {
      andFilters.push({
        discountType: {
          not: null,
        },
        discountValue: {
          gt: new Prisma.Decimal(0),
        },
      });
    }

    where.vendorId = query.vendorId;

    if (typeof query.minPrice === "number" || typeof query.maxPrice === "number") {
      where.price = {
        gte: typeof query.minPrice === "number" ? new Prisma.Decimal(query.minPrice) : undefined,
        lte: typeof query.maxPrice === "number" ? new Prisma.Decimal(query.maxPrice) : undefined,
      };
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    return where;
  }

  private buildOrderBy(sort: ProductQueryDto["sort"]): Prisma.ProductOrderByWithRelationInput {
    if (sort === "price_asc") {
      return { price: "asc" };
    }

    if (sort === "price_desc") {
      return { price: "desc" };
    }

    return { createdAt: "desc" };
  }

  private async findEditableProduct(id: string, user: AuthenticatedUser) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product || product.status === ProductStatus.ARCHIVED) {
      throw new NotFoundException("Product not found");
    }

    if (user.role !== UserRole.ADMIN && product.vendorId !== user.id) {
      throw new ForbiddenException("You cannot edit this product");
    }

    return product;
  }

  private async findOwnedProduct(id: string, user: AuthenticatedUser) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (user.role !== UserRole.ADMIN && product.vendorId !== user.id) {
      throw new ForbiddenException("You cannot edit this product");
    }

    return product;
  }

  private async deleteExpiredArchivedProducts(user: AuthenticatedUser) {
    const expiresBefore = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await this.prisma.product.deleteMany({
      where: {
        ...(user.role === UserRole.ADMIN ? {} : { vendorId: user.id }),
        status: ProductStatus.ARCHIVED,
        archivedAt: {
          lt: expiresBefore,
        },
        orderItems: {
          none: {},
        },
      },
    });
  }

  private async ensureCategoryExists(categoryId: string, user: AuthenticatedUser) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (user.role !== UserRole.ADMIN && category.vendorId && category.vendorId !== user.id) {
      throw new ForbiddenException("You cannot use this category");
    }
  }

  private async createUniqueSlug(title: string, excludeProductId?: string) {
    const baseSlug = this.slugify(title);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const existingProduct = await this.prisma.product.findUnique({ where: { slug } });

      if (!existingProduct || existingProduct.id === excludeProductId) {
        return slug;
      }
    }

    return `${baseSlug}-${Date.now().toString(36)}`;
  }

  private slugify(title: string) {
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "product";
  }

  private buildImagesCreate(imageUrls: string[], title: string): Prisma.ProductImageCreateWithoutProductInput[] {
    return imageUrls
      .filter(Boolean)
      .map((url, index) => ({
        url,
        alt: title,
        sortOrder: index,
      }));
  }

  private validateDiscountInput(price: number, discountType?: DiscountType, discountValue?: number) {
    if (!discountType && !discountValue) {
      return;
    }

    if (!discountType || !discountValue) {
      if (discountValue === 0 || discountValue === undefined) {
        return;
      }

      throw new BadRequestException("discountType and discountValue must be provided together");
    }

    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      throw new BadRequestException("Percentage discount cannot be more than 100");
    }

    if (discountType === DiscountType.FIXED && discountValue > price) {
      throw new BadRequestException("Fixed discount cannot be more than the product price");
    }
  }

  private buildDiscountData(price: number, discountType?: DiscountType, discountValue?: number) {
    this.validateDiscountInput(price, discountType, discountValue);

    if (!discountType || !discountValue || discountValue <= 0) {
      return {
        discountType: undefined,
        discountValue: undefined,
      };
    }

    return {
      discountType,
      discountValue: new Prisma.Decimal(discountValue),
    };
  }

  private buildOptionsCreate(options: CreateProductDto["options"], fallbackPrice: number): Prisma.ProductOptionCreateWithoutProductInput[] {
    return (options ?? [])
      .map((option, index) => ({
        name: option.name.trim(),
        values: Array.from(new Set(option.values.map((value) => value.trim()).filter(Boolean))),
        valueQuantities: this.normalizeOptionQuantities(option.values, option.valueQuantities),
        valuePrices: this.normalizeOptionPrices(option.values, option.valuePrices, fallbackPrice),
        sortOrder: index,
      }))
      .filter((option) => option.name && option.values.length > 0);
  }

  private normalizeOptionalText(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private normalizeOptionQuantities(values: string[], quantities: Record<string, number> | undefined) {
    const normalized: Record<string, number> = {};

    for (const value of values) {
      const key = value.trim();
      const quantity = Number(quantities?.[key] ?? 0);
      normalized[key] = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
    }

    return normalized;
  }

  private normalizeOptionPrices(values: string[], prices: Record<string, number> | undefined, fallbackPrice: number) {
    const normalized: Record<string, number> = {};
    const defaultPrice = Number.isFinite(fallbackPrice) && fallbackPrice >= 0 ? Number(fallbackPrice.toFixed(2)) : 0;

    for (const value of values) {
      const key = value.trim();
      const price = Number(prices?.[key]);
      normalized[key] = Number.isFinite(price) && price >= 0 ? Number(price.toFixed(2)) : defaultPrice;
    }

    return normalized;
  }

  private calculateOptionsStock(options: Prisma.ProductOptionCreateWithoutProductInput[]) {
    return options.reduce((total, option) => {
      const quantities = option.valueQuantities;

      if (!quantities || typeof quantities !== "object" || Array.isArray(quantities)) {
        return total;
      }

      return (
        total +
        Object.values(quantities).reduce((optionTotal, quantity) => {
          const value = Number(quantity);
          return optionTotal + (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);
        }, 0)
      );
    }, 0);
  }

  private productIncludes() {
    return {
      category: true,
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          storeUsername: true,
          role: true,
          theme: {
            select: {
              id: true,
              vendorId: true,
              primaryColor: true,
              secondaryColor: true,
              textColor: true,
              storeName: true,
              logoUrl: true,
              bannerUrl: true,
              storefrontImageUrl: true,
              storefrontTitle: true,
              storefrontDescription: true,
              templateId: true,
              storeStatus: true,
              storeDeletedAt: true,
            },
          },
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc" as const,
        },
      },
      options: {
        orderBy: {
          sortOrder: "asc" as const,
        },
      },
    };
  }

  private async serializeProduct(product: Prisma.ProductGetPayload<{ include: ReturnType<ProductsService["productIncludes"]> }>) {
    const [imageUrl, images, theme] = await Promise.all([
      this.productAssetsService.resolveAssetUrl(product.imageUrl),
      Promise.all(
        product.images.map(async (image) => ({
          ...image,
          url: await this.productAssetsService.resolveAssetUrl(image.url),
        })),
      ),
      product.vendor.theme ? this.serializeThemeAssets(product.vendor.theme) : Promise.resolve(null),
    ]);

    return {
      ...product,
      imageUrl,
      images,
      salePrice: this.calculateSalePrice(product.price, product.discountType, product.discountValue).toFixed(2),
      hasDiscount: Boolean(product.discountType && product.discountValue && product.discountValue.greaterThan(0)),
      vendor: {
        ...product.vendor,
        theme,
      },
    };
  }

  private calculateSalePrice(price: Prisma.Decimal, discountType: DiscountType | null, discountValue: Prisma.Decimal | null) {
    if (!discountType || !discountValue || discountValue.lessThanOrEqualTo(0)) {
      return price;
    }

    if (discountType === DiscountType.PERCENTAGE) {
      const discounted = price.minus(price.mul(discountValue).div(100));
      return discounted.lessThan(0) ? new Prisma.Decimal(0) : discounted;
    }

    const discounted = price.minus(discountValue);
    return discounted.lessThan(0) ? new Prisma.Decimal(0) : discounted;
  }

  private async serializeThemeAssets(theme: NonNullable<Prisma.ProductGetPayload<{ include: ReturnType<ProductsService["productIncludes"]> }>["vendor"]["theme"]>) {
    const [logoUrl, bannerUrl, storefrontImageUrl] = await Promise.all([
      this.productAssetsService.resolveAssetUrl(theme.logoUrl),
      this.productAssetsService.resolveAssetUrl(theme.bannerUrl),
      this.productAssetsService.resolveAssetUrl(theme.storefrontImageUrl),
    ]);

    return {
      ...theme,
      logoUrl,
      bannerUrl,
      storefrontImageUrl,
    };
  }
}
