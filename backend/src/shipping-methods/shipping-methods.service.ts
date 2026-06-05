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
  cashOnDeliveryEnabled: boolean;
  excludedRegions: string[];
  unavailableLocations: Prisma.JsonValue;
  deliveryLocations: Prisma.JsonValue;
};

type ShippingDestination = {
  country?: string | null;
  region?: string | null;
  city?: string | null;
};

type ShippingUnavailableLocation = {
  country: string;
  region?: string;
  city?: string;
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
          cashOnDeliveryEnabled: dto.cashOnDeliveryEnabled ?? false,
          excludedRegions: this.normalizeExcludedRegions(dto.excludedRegions),
          unavailableLocations: this.normalizeUnavailableLocations(dto.unavailableLocations),
          deliveryLocations: this.normalizeUnavailableLocations(dto.deliveryLocations),
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

    if (dto.cashOnDeliveryEnabled !== undefined) {
      data.cashOnDeliveryEnabled = dto.cashOnDeliveryEnabled;
    }

    if (dto.excludedRegions !== undefined) {
      data.excludedRegions = this.normalizeExcludedRegions(dto.excludedRegions);
    }

    if (dto.unavailableLocations !== undefined) {
      data.unavailableLocations = this.normalizeUnavailableLocations(dto.unavailableLocations);
    }

    if (dto.deliveryLocations !== undefined) {
      data.deliveryLocations = this.normalizeUnavailableLocations(dto.deliveryLocations);
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

  async findCheckoutOptions(items: ShippingMethodItemDto[], destination: ShippingDestination = {}) {
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

    const options = this.buildSharedOptions(vendorIds, methods, destination);

    return options.map((option) => ({
      code: option.code,
      name: option.name,
      description: option.description,
      eta: option.eta,
      fee: option.fee.toFixed(2),
      cashOnDeliveryEnabled: option.cashOnDeliveryEnabled,
      vendorCount: vendorIds.length,
    }));
  }

  async resolveCheckoutShipping(items: ShippingMethodItemDto[], shippingCarrier: string, destination: ShippingDestination = {}) {
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

    const availableMethods = methods.filter((method) => this.isAvailableForDestination(method, destination));

    if (availableMethods.length !== vendorIds.length) {
      throw new BadRequestException("Selected shipping method is not available for all vendors in this order");
    }

    return {
      code,
      fee: availableMethods.reduce((sum, method) => sum.add(method.fee), new Prisma.Decimal(0)),
      cashOnDeliveryEnabled: availableMethods.every((method) => method.cashOnDeliveryEnabled),
      products,
    };
  }

  async checkVendorCoverage(vendorId: string, destination: ShippingDestination = {}) {
    const activeVendor = await this.prisma.user.findFirst({
      where: {
        id: vendorId,
        OR: [{ theme: null }, { theme: { storeStatus: "ACTIVE" } }],
      },
      select: { id: true },
    });

    if (!activeVendor) {
      return { supported: false };
    }

    const methods = await this.prisma.vendorShippingMethod.findMany({
      where: {
        vendorId,
        enabled: true,
      },
    });

    return {
      supported: methods.some((method) => this.isAvailableForDestination(method, destination)),
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
        vendor: {
          OR: [{ theme: null }, { theme: { storeStatus: "ACTIVE" } }],
        },
      },
      include: {
        addons: {
          where: {
            enabled: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products are unavailable");
    }

    return products;
  }

  private buildSharedOptions(vendorIds: string[], methods: VendorShippingChoice[], destination: ShippingDestination) {
    const methodsByCode = new Map<string, VendorShippingChoice[]>();

    for (const method of methods) {
      const group = methodsByCode.get(method.code) ?? [];
      group.push(method);
      methodsByCode.set(method.code, group);
    }

    return Array.from(methodsByCode.entries())
      .map(([code, group]) => [code, group.filter((method) => this.isAvailableForDestination(method, destination))] as const)
      .filter(([, group]) => group.length === vendorIds.length)
      .map(([code, group]) => ({
        code,
        name: group[0].name,
        description: group[0].description,
        eta: group[0].eta,
        fee: group.reduce((sum, method) => sum.add(method.fee), new Prisma.Decimal(0)),
        cashOnDeliveryEnabled: group.every((method) => method.cashOnDeliveryEnabled),
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

  private normalizeExcludedRegions(value?: string[]) {
    return [...new Set((value ?? []).map((region) => region.trim()).filter(Boolean))];
  }

  private normalizeUnavailableLocations(value?: ShippingUnavailableLocation[]) {
    const unique = new Map<string, ShippingUnavailableLocation>();

    for (const location of value ?? []) {
      const country = location.country?.trim().toUpperCase();
      const region = this.optionalText(location.region) ?? undefined;
      const city = this.optionalText(location.city) ?? undefined;

      if (!country) {
        continue;
      }

      unique.set([country, region ?? "", city ?? ""].join("|"), { country, region, city });
    }

    return Array.from(unique.values());
  }

  private isAvailableForDestination(method: Pick<VendorShippingChoice, "excludedRegions" | "unavailableLocations" | "deliveryLocations">, destination: ShippingDestination) {
    const normalizedCountry = destination.country?.trim().toUpperCase();
    const normalizedRegion = destination.region?.trim();
    const normalizedCity = destination.city?.trim();

    const deliveryLocations = this.parseUnavailableLocations(method.deliveryLocations);
    if (deliveryLocations.length > 0) {
      return deliveryLocations.some((location) => this.locationMatchesDestination(location, normalizedCountry, normalizedRegion, normalizedCity));
    }

    if (normalizedRegion && (method.excludedRegions ?? []).includes(normalizedRegion)) {
      return false;
    }

    const locations = this.parseUnavailableLocations(method.unavailableLocations);

    return !locations.some((location) => this.locationMatchesDestination(location, normalizedCountry, normalizedRegion, normalizedCity));
  }

  private locationMatchesDestination(location: ShippingUnavailableLocation, country?: string, region?: string, city?: string) {
    if (!country || location.country !== country) {
      return false;
    }

    if (!location.region) {
      return true;
    }

    if (location.region !== region) {
      return false;
    }

    if (!location.city) {
      return true;
    }

    return location.city === city;
  }

  private parseUnavailableLocations(value: Prisma.JsonValue): ShippingUnavailableLocation[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const locations: ShippingUnavailableLocation[] = [];

    for (const item of value) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        continue;
      }

      const location = item as Record<string, unknown>;
      const country = typeof location.country === "string" ? location.country.trim().toUpperCase() : "";
      const region = typeof location.region === "string" ? location.region.trim() : undefined;
      const city = typeof location.city === "string" ? location.city.trim() : undefined;

      if (country) {
        locations.push({ country, region: region || undefined, city: city || undefined });
      }
    }

    return locations;
  }

  private isAvailableForRegion(excludedRegions: string[] | null | undefined, destinationRegion?: string) {
    const normalizedRegion = destinationRegion?.trim();
    if (!normalizedRegion) {
      return true;
    }

    return !(excludedRegions ?? []).includes(normalizedRegion);
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
