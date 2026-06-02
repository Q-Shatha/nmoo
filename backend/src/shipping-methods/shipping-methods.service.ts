import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { ShippingMethodItemDto } from "./dto/shipping-method-item.dto";
import { CreateShippingMethodDto } from "./dto/create-shipping-method.dto";
import { UpdateShippingMethodDto } from "./dto/update-shipping-method.dto";

type VendorShippingChoice = {
  code: string;
  name: string;
  description: string | null;
  eta: string | null;
  fee: Prisma.Decimal;
};

@Injectable()
export class ShippingMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(user: AuthenticatedUser) {
    return this.prisma.vendorShippingMethod.findMany({
      where: {
        vendorId: user.id,
      },
      orderBy: [{ enabled: "desc" }, { name: "asc" }],
    });
  }

  async create(dto: CreateShippingMethodDto, user: AuthenticatedUser) {
    const code = this.normalizeCode(dto.code);

    try {
      return await this.prisma.vendorShippingMethod.create({
        data: {
          vendorId: user.id,
          code,
          name: dto.name.trim(),
          fee: new Prisma.Decimal(dto.fee),
          description: this.optionalText(dto.description),
          eta: this.optionalText(dto.eta),
          enabled: dto.enabled ?? true,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Shipping method code is already used by this vendor");
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateShippingMethodDto, user: AuthenticatedUser) {
    const method = await this.ensureMethodExists(id);
    this.ensureCanManage(method.vendorId, user);

    const data: Prisma.VendorShippingMethodUpdateInput = {};

    if (dto.code !== undefined) {
      data.code = this.normalizeCode(dto.code);
    }

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.fee !== undefined) {
      data.fee = new Prisma.Decimal(dto.fee);
    }

    if (dto.description !== undefined) {
      data.description = this.optionalText(dto.description);
    }

    if (dto.eta !== undefined) {
      data.eta = this.optionalText(dto.eta);
    }

    if (dto.enabled !== undefined) {
      data.enabled = dto.enabled;
    }

    try {
      return await this.prisma.vendorShippingMethod.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Shipping method code is already used by this vendor");
      }

      throw error;
    }
  }

  async remove(id: string, user: AuthenticatedUser) {
    const method = await this.ensureMethodExists(id);
    this.ensureCanManage(method.vendorId, user);

    return this.prisma.vendorShippingMethod.delete({
      where: { id },
    });
  }

  async findCheckoutOptions(items: ShippingMethodItemDto[]) {
    const products = await this.getActiveProductsForItems(items);
    const vendorIds = this.getVendorIds(products);

    if (vendorIds.length === 0) {
      return [];
    }

    const methods = await this.prisma.vendorShippingMethod.findMany({
      where: {
        vendorId: {
          in: vendorIds,
        },
        enabled: true,
      },
      orderBy: [{ name: "asc" }],
    });

    const options = this.buildSharedOptions(vendorIds, methods);

    return options.map((option) => ({
      code: option.code,
      name: option.name,
      description: option.description,
      eta: option.eta,
      fee: option.fee.toFixed(2),
      vendorCount: vendorIds.length,
    }));
  }

  async resolveCheckoutShipping(items: ShippingMethodItemDto[], shippingCarrier: string) {
    const products = await this.getActiveProductsForItems(items);
    const vendorIds = this.getVendorIds(products);
    const code = this.normalizeCode(shippingCarrier);

    if (vendorIds.length === 0) {
      throw new BadRequestException("No vendors found for checkout items");
    }

    const methods = await this.prisma.vendorShippingMethod.findMany({
      where: {
        vendorId: {
          in: vendorIds,
        },
        code,
        enabled: true,
      },
    });

    if (methods.length !== vendorIds.length) {
      throw new BadRequestException("Selected shipping method is not available for all vendors in this order");
    }

    return {
      code,
      fee: methods.reduce((sum, method) => sum.add(method.fee), new Prisma.Decimal(0)),
      products,
    };
  }

  private async getActiveProductsForItems(items: ShippingMethodItemDto[]) {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        status: ProductStatus.ACTIVE,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products are unavailable");
    }

    return products;
  }

  private buildSharedOptions(vendorIds: string[], methods: VendorShippingChoice[]) {
    const methodsByCode = new Map<string, VendorShippingChoice[]>();

    for (const method of methods) {
      const group = methodsByCode.get(method.code) ?? [];
      group.push(method);
      methodsByCode.set(method.code, group);
    }

    return Array.from(methodsByCode.entries())
      .filter(([, group]) => group.length === vendorIds.length)
      .map(([code, group]) => ({
        code,
        name: group[0].name,
        description: group[0].description,
        eta: group[0].eta,
        fee: group.reduce((sum, method) => sum.add(method.fee), new Prisma.Decimal(0)),
      }))
      .sort((first, second) => Number(first.fee) - Number(second.fee));
  }

  private getVendorIds(products: Array<{ vendorId: string }>) {
    return [...new Set(products.map((product) => product.vendorId))];
  }

  private async ensureMethodExists(id: string) {
    const method = await this.prisma.vendorShippingMethod.findUnique({ where: { id } });

    if (!method) {
      throw new NotFoundException("Shipping method not found");
    }

    return method;
  }

  private ensureCanManage(vendorId: string, user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN && vendorId !== user.id) {
      throw new ForbiddenException("You cannot manage this shipping method");
    }
  }

  private normalizeCode(value: string) {
    const code = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!code) {
      throw new BadRequestException("Shipping method code is required");
    }

    return code;
  }

  private optionalText(value?: string) {
    const text = value?.trim();
    return text || null;
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
