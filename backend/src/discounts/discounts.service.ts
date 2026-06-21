import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { DiscountType, Prisma, ProductStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDiscountCodeDto } from "./dto/create-discount-code.dto";
import { DiscountItemDto } from "./dto/discount-item.dto";
import { UpdateDiscountCodeDto } from "./dto/update-discount-code.dto";

type CheckoutProduct = {
  id: string;
  vendorId: string;
  price: Prisma.Decimal;
  discountType?: DiscountType | null;
  discountValue?: Prisma.Decimal | null;
  stock: number;
};

export type AppliedDiscount = {
  discountCodeId: string;
  code: string;
  vendorId: string;
  type: DiscountType;
  value: Prisma.Decimal;
  amount: Prisma.Decimal;
  description: string | null;
};

@Injectable()
export class DiscountsService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(user: AuthenticatedUser) {
    return this.prisma.discountCode.findMany({
      where: { vendorId: user.id },
      orderBy: [{ enabled: "desc" }, { createdAt: "desc" }],
      include: {
        products: { include: { product: { select: { id: true, title: true } } } },
        _count: { select: { redemptions: true } },
      },
    });
  }

  async create(dto: CreateDiscountCodeDto, user: AuthenticatedUser) {
    this.ensurePercentageValue(dto.type, dto.value);

    try {
      return await this.prisma.discountCode.create({
        data: {
          vendorId: user.id,
          code: this.normalizeCode(dto.code),
          description: this.optionalText(dto.description),
          type: dto.type,
          value: new Prisma.Decimal(dto.value),
          enabled: dto.enabled ?? true,
          maxUses: dto.maxUses,
          maxUsesPerUser: dto.maxUsesPerUser,
          startsAt: this.optionalDate(dto.startsAt),
          expiresAt: this.optionalDate(dto.expiresAt),
          products: dto.productIds?.length
            ? { create: dto.productIds.map((productId) => ({ productId })) }
            : undefined,
        },
        include: {
          products: { include: { product: { select: { id: true, title: true } } } },
          _count: { select: { redemptions: true } },
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Discount code is already used by this vendor");
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateDiscountCodeDto, user: AuthenticatedUser) {
    const discountCode = await this.ensureDiscountExists(id);
    this.ensureCanManage(discountCode.vendorId, user);

    const nextType = dto.type ?? discountCode.type;
    const nextValue = dto.value ?? Number(discountCode.value);
    this.ensurePercentageValue(nextType, nextValue);

    const data: Prisma.DiscountCodeUpdateInput = {};

    if (dto.code !== undefined) data.code = this.normalizeCode(dto.code);
    if (dto.description !== undefined) data.description = this.optionalText(dto.description);
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.value !== undefined) data.value = new Prisma.Decimal(dto.value);
    if (dto.enabled !== undefined) data.enabled = dto.enabled;
    if (dto.maxUses !== undefined) data.maxUses = dto.maxUses;
    if (dto.maxUsesPerUser !== undefined) data.maxUsesPerUser = dto.maxUsesPerUser;
    if (dto.startsAt !== undefined) data.startsAt = this.optionalDate(dto.startsAt);
    if (dto.expiresAt !== undefined) data.expiresAt = this.optionalDate(dto.expiresAt);

    if (dto.productIds !== undefined) {
      data.products = {
        deleteMany: {},
        create: (dto.productIds ?? []).map((productId) => ({ productId })),
      };
    }

    try {
      return await this.prisma.discountCode.update({
        where: { id },
        data,
        include: {
          products: { include: { product: { select: { id: true, title: true } } } },
          _count: { select: { redemptions: true } },
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Discount code is already used by this vendor");
      }

      throw error;
    }
  }

  async remove(id: string, user: AuthenticatedUser) {
    const discountCode = await this.ensureDiscountExists(id);
    this.ensureCanManage(discountCode.vendorId, user);

    return this.prisma.discountCode.delete({
      where: { id },
    });
  }

  async validateForCheckout(code: string, items: DiscountItemDto[], user: AuthenticatedUser, products?: CheckoutProduct[]) {
    const normalizedCode = this.normalizeCode(code);
    const checkoutProducts = products ?? (await this.getActiveProductsForItems(items));
    const productsById = new Map(checkoutProducts.map((product) => [product.id, product]));
    const vendorIds = [...new Set(checkoutProducts.map((product) => product.vendorId))];

    const discountCode = await this.prisma.discountCode.findFirst({
      where: { code: normalizedCode, vendorId: { in: vendorIds } },
      include: { products: { select: { productId: true } } },
    });

    if (!discountCode) {
      throw new BadRequestException("Discount code is invalid for the products in your cart");
    }

    this.ensureDiscountIsUsable(discountCode);
    await this.ensureUsageLimits(discountCode.id, discountCode.maxUses, discountCode.maxUsesPerUser, user.id);

    const vendorSubtotal = items.reduce((sum, item) => {
      const product = productsById.get(item.productId);

      if (!product || product.vendorId !== discountCode.vendorId) {
        return sum;
      }

      // If the coupon is tied to specific products, only count those
      if (discountCode.products.length > 0 && !discountCode.products.some((p) => p.productId === product.id)) {
        return sum;
      }

      return sum.add(this.calculateSalePrice(product.price, product.discountType, product.discountValue).mul(item.quantity));
    }, new Prisma.Decimal(0));

    if (vendorSubtotal.lte(0)) {
      throw new BadRequestException("Discount code is invalid for the products in your cart");
    }

    const amount = this.calculateDiscountAmount(discountCode.type, discountCode.value, vendorSubtotal);

    if (amount.lte(0)) {
      throw new BadRequestException("Discount code does not reduce this order");
    }

    return {
      discountCodeId: discountCode.id,
      code: discountCode.code,
      vendorId: discountCode.vendorId,
      type: discountCode.type,
      value: discountCode.value,
      amount,
      description: discountCode.description,
    };
  }

  async createRedemption(tx: Prisma.TransactionClient, discount: AppliedDiscount, orderId: string, userId: string) {
    const discountCode = await tx.discountCode.findUnique({
      where: { id: discount.discountCodeId },
      select: {
        maxUses: true,
        maxUsesPerUser: true,
      },
    });

    if (!discountCode) {
      throw new BadRequestException("Discount code is invalid");
    }

    await this.ensureUsageLimits(discount.discountCodeId, discountCode.maxUses, discountCode.maxUsesPerUser, userId, tx);

    return tx.discountRedemption.create({
      data: {
        discountCodeId: discount.discountCodeId,
        orderId,
        userId,
        amount: discount.amount,
      },
    });
  }

  toCheckoutResponse(discount: AppliedDiscount) {
    return {
      code: discount.code,
      vendorId: discount.vendorId,
      type: discount.type,
      value: discount.value.toFixed(2),
      amount: discount.amount.toFixed(2),
      description: discount.description,
    };
  }

  private async getActiveProductsForItems(items: DiscountItemDto[]) {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
        vendorId: true,
        price: true,
        discountType: true,
        discountValue: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products are unavailable");
    }

    return products;
  }

  private ensureDiscountIsUsable(discountCode: { enabled: boolean; startsAt: Date | null; expiresAt: Date | null }) {
    const now = new Date();

    if (!discountCode.enabled) {
      throw new BadRequestException("Discount code is not active");
    }

    if (discountCode.startsAt && discountCode.startsAt > now) {
      throw new BadRequestException("Discount code is not active yet");
    }

    if (discountCode.expiresAt && discountCode.expiresAt < now) {
      throw new BadRequestException("Discount code has expired");
    }
  }

  private async ensureUsageLimits(discountCodeId: string, maxUses?: number | null, maxUsesPerUser?: number | null, userId?: string, tx: Prisma.TransactionClient | PrismaService = this.prisma) {
    const [totalUses, userUses] = await Promise.all([
      maxUses === undefined ? Promise.resolve(0) : tx.discountRedemption.count({ where: { discountCodeId } }),
      maxUsesPerUser === undefined || !userId ? Promise.resolve(0) : tx.discountRedemption.count({ where: { discountCodeId, userId } }),
    ]);

    if (maxUses !== undefined && maxUses !== null && totalUses >= maxUses) {
      throw new BadRequestException("Discount code reached its total usage limit");
    }

    if (maxUsesPerUser !== undefined && maxUsesPerUser !== null && userUses >= maxUsesPerUser) {
      throw new BadRequestException("You have reached your usage limit for this discount code");
    }
  }

  private calculateDiscountAmount(type: DiscountType, value: Prisma.Decimal, subtotal: Prisma.Decimal) {
    const amount = type === DiscountType.PERCENTAGE ? subtotal.mul(value).div(100) : value;
    return amount.gt(subtotal) ? subtotal : amount;
  }

  private calculateSalePrice(price: Prisma.Decimal, discountType?: DiscountType | null, discountValue?: Prisma.Decimal | null) {
    if (!discountType || !discountValue || discountValue.lessThanOrEqualTo(0)) {
      return price;
    }

    const discounted =
      discountType === DiscountType.PERCENTAGE ? price.minus(price.mul(discountValue).div(100)) : price.minus(discountValue);

    return discounted.lessThan(0) ? new Prisma.Decimal(0) : discounted;
  }

  private async ensureDiscountExists(id: string) {
    const discountCode = await this.prisma.discountCode.findUnique({ where: { id } });

    if (!discountCode) {
      throw new NotFoundException("Discount code not found");
    }

    return discountCode;
  }

  private ensureCanManage(vendorId: string, user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN && vendorId !== user.id) {
      throw new ForbiddenException("You cannot manage this discount code");
    }
  }

  private ensurePercentageValue(type: DiscountType, value: number) {
    if (type === DiscountType.PERCENTAGE && value > 100) {
      throw new BadRequestException("Percentage discount cannot exceed 100");
    }
  }

  private normalizeCode(value: string) {
    const code = value.trim().toUpperCase().replace(/\s+/g, "");

    if (!code) {
      throw new BadRequestException("Discount code is required");
    }

    return code;
  }

  private optionalText(value?: string) {
    const text = value?.trim();
    return text || null;
  }

  private optionalDate(value?: string) {
    return value ? new Date(value) : null;
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
