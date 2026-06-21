import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { DiscountType, OrderStatus, Prisma, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { DiscountsService } from "../discounts/discounts.service";
import { PrismaService } from "../prisma/prisma.service";
import { ShippingMethodsService } from "../shipping-methods/shipping-methods.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discountsService: DiscountsService,
    private readonly shippingMethodsService: ShippingMethodsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: AuthenticatedUser) {
    const items = this.mergeDuplicateItems(createOrderDto.items);
    const buyer = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { country: true, region: true, city: true },
    });
    const shipping = await this.shippingMethodsService.resolveCheckoutShipping(items, createOrderDto.shippingCarrier, {
      country: buyer?.country,
      region: buyer?.region,
      city: buyer?.city,
    });
    const productsById = new Map(shipping.products.map((product) => [product.id, product]));
    const vendorIds = new Set(shipping.products.map((product) => product.vendorId));

    if (vendorIds.size > 1) {
      throw new BadRequestException("Orders can only include products from one store");
    }

    const paymentMethod = createOrderDto.paymentMethod ?? "ONLINE";

    if (paymentMethod === "CASH_ON_DELIVERY" && !shipping.cashOnDeliveryEnabled) {
      throw new BadRequestException("Cash on delivery is not available for this shipping method");
    }

    const shippingFee = shipping.fee;
    let subtotal = new Prisma.Decimal(0);

    for (const item of items) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new BadRequestException("One or more products are unavailable");
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.id}`);
      }

      const addonTotal = this.getSelectedAddons(product, item.addOnIds).reduce((sum, addon) => sum.add(addon.price), new Prisma.Decimal(0));
      subtotal = subtotal.add(this.calculateSalePrice(product.price, product.discountType, product.discountValue).add(addonTotal).mul(item.quantity));
    }

    const discount = createOrderDto.discountCode
      ? await this.discountsService.validateForCheckout(createOrderDto.discountCode, items, user, shipping.products)
      : null;
    const discountAmount = discount?.amount ?? new Prisma.Decimal(0);
    const total = subtotal.sub(discountAmount).add(shippingFee);

    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            status: "ACTIVE",
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count !== 1) {
          throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
        }
      }

      const order = await tx.order.create({
        data: {
          buyerId: user.id,
          total,
          status: paymentMethod === "CASH_ON_DELIVERY" ? OrderStatus.PROCESSING : OrderStatus.PENDING,
          shippingCarrier: shipping.code,
          shippingFee,
          paymentMethod,
          discountCode: discount?.code,
          discountAmount,
          items: {
            create: items.map((item) => {
              const product = productsById.get(item.productId);

              if (!product) {
                throw new BadRequestException("One or more products are unavailable");
              }

              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: this.calculateSalePrice(product.price, product.discountType, product.discountValue).add(
                  this.getSelectedAddons(product, item.addOnIds).reduce((sum, addon) => sum.add(addon.price), new Prisma.Decimal(0)),
                ),
                selectedAddons: this.getSelectedAddons(product, item.addOnIds).map((addon) => ({
                  id: addon.id,
                  name: addon.name,
                  price: addon.price.toFixed(2),
                })),
              };
            }),
          },
        },
        include: this.orderIncludes(),
      });

      if (discount) {
        await this.discountsService.createRedemption(tx, discount, order.id, user.id);
      }

      return order;
    });
  }

  findAll(user: AuthenticatedUser) {
    return this.prisma.order.findMany({
      where: this.visibleOrderWhere(user),
      orderBy: {
        createdAt: "desc",
      },
      include: this.orderIncludes(),
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        ...this.visibleOrderWhere(user),
      },
      include: this.orderIncludes(),
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, user: AuthenticatedUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                vendorId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (user.role !== UserRole.ADMIN && !order.items.some((item) => item.product.vendorId === user.id)) {
      throw new ForbiddenException("You cannot update this order");
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException("Finalized orders cannot be updated");
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: updateOrderStatusDto.status,
      },
      include: this.orderIncludes(),
    });
  }

  private visibleOrderWhere(user: AuthenticatedUser): Prisma.OrderWhereInput {
    if (user.role === UserRole.ADMIN) {
      return {};
    }

    if (user.role === UserRole.VENDOR) {
      return {
        items: {
          some: {
            product: {
              vendorId: user.id,
            },
          },
        },
      };
    }

    return {
      buyerId: user.id,
    };
  }

  private mergeDuplicateItems(items: CreateOrderDto["items"]) {
    const mergedItems = new Map<string, { productId: string; quantity: number; addOnIds: string[] }>();

    for (const item of items) {
      const addOnIds = [...new Set(item.addOnIds ?? [])].sort();
      const key = `${item.productId}::${addOnIds.join("|")}`;
      const existing = mergedItems.get(key);
      mergedItems.set(key, {
        productId: item.productId,
        addOnIds,
        quantity: (existing?.quantity ?? 0) + item.quantity,
      });
    }

    return Array.from(mergedItems.values());
  }

  private getSelectedAddons(product: { id: string; addons?: Array<{ id: string; name: string; price: Prisma.Decimal; enabled: boolean }> }, addOnIds?: string[]) {
    const uniqueIds = [...new Set(addOnIds ?? [])];

    if (uniqueIds.length === 0) {
      return [];
    }

    const addons = product.addons ?? [];
    const selectedAddons = uniqueIds.map((id) => addons.find((addon) => addon.id === id && addon.enabled));

    if (selectedAddons.some((addon) => !addon)) {
      throw new BadRequestException(`Invalid add-on selected for product ${product.id}`);
    }

    return selectedAddons as Array<{ id: string; name: string; price: Prisma.Decimal; enabled: boolean }>;
  }

  private calculateSalePrice(price: Prisma.Decimal, discountType?: DiscountType | null, discountValue?: Prisma.Decimal | null) {
    if (!discountType || !discountValue || discountValue.lessThanOrEqualTo(0)) {
      return price;
    }

    const discounted =
      discountType === DiscountType.PERCENTAGE ? price.minus(price.mul(discountValue).div(100)) : price.minus(discountValue);

    return discounted.lessThan(0) ? new Prisma.Decimal(0) : discounted;
  }

  private orderIncludes() {
    return {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phoneNumber: true,
          country: true,
          region: true,
          city: true,
          district: true,
          street: true,
          buildingNumber: true,
          postalCode: true,
          nationalAddress: true,
        },
      },
      items: {
        include: {
          product: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  storeUsername: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      },
    };
  }
}
