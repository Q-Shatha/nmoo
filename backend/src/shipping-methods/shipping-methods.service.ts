import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { ShippingMethodItemDto } from "./dto/shipping-method-item.dto";
import { CreateShippingMethodDto } from "./dto/create-shipping-method.dto";
import { UpdateShippingMethodDto } from "./dto/update-shipping-method.dto";

type VendorShippingChoice = {
  vendorId: string;
  code: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  eta: string | null;
  etaAr: string | null;
  etaEn: string | null;
  fee: Prisma.Decimal;
  freeShippingEnabled: boolean;
  freeShippingMinimum: Prisma.Decimal | null;
  cashOnDeliveryEnabled: boolean;
  isPickup: boolean;
  pickupAddress: string | null;
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
          nameAr: this.optionalText(dto.nameAr),
          nameEn: this.optionalText(dto.nameEn),
          fee: new Prisma.Decimal(dto.fee),
          description: this.optionalText(dto.description),
          descriptionAr: this.optionalText(dto.descriptionAr),
          descriptionEn: this.optionalText(dto.descriptionEn),
          eta: this.optionalText(dto.eta),
          etaAr: this.optionalText(dto.etaAr),
          etaEn: this.optionalText(dto.etaEn),
          enabled: dto.enabled ?? true,
          cashOnDeliveryEnabled: dto.cashOnDeliveryEnabled ?? false,
          freeShippingEnabled: dto.freeShippingEnabled ?? false,
          freeShippingMinimum: dto.freeShippingMinimum != null ? new Prisma.Decimal(dto.freeShippingMinimum) : null,
          isPickup: dto.isPickup ?? false,
          pickupAddress: dto.pickupAddress?.trim() || null,
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

    if (dto.nameAr !== undefined) {
      data.nameAr = this.optionalText(dto.nameAr);
    }

    if (dto.nameEn !== undefined) {
      data.nameEn = this.optionalText(dto.nameEn);
    }

    if (dto.fee !== undefined) {
      data.fee = new Prisma.Decimal(dto.fee);
    }

    if (dto.description !== undefined) {
      data.description = this.optionalText(dto.description);
    }

    if (dto.descriptionAr !== undefined) {
      data.descriptionAr = this.optionalText(dto.descriptionAr);
    }

    if (dto.descriptionEn !== undefined) {
      data.descriptionEn = this.optionalText(dto.descriptionEn);
    }

    if (dto.eta !== undefined) {
      data.eta = this.optionalText(dto.eta);
    }

    if (dto.etaAr !== undefined) {
      data.etaAr = this.optionalText(dto.etaAr);
    }

    if (dto.etaEn !== undefined) {
      data.etaEn = this.optionalText(dto.etaEn);
    }

    if (dto.enabled !== undefined) {
      data.enabled = dto.enabled;
    }

    if (dto.cashOnDeliveryEnabled !== undefined) {
      data.cashOnDeliveryEnabled = dto.cashOnDeliveryEnabled;
    }

    if (dto.freeShippingEnabled !== undefined) {
      data.freeShippingEnabled = dto.freeShippingEnabled;
    }

    if (dto.freeShippingMinimum !== undefined) {
      data.freeShippingMinimum = dto.freeShippingMinimum != null ? new Prisma.Decimal(dto.freeShippingMinimum) : null;
    }

    if (dto.isPickup !== undefined) {
      data.isPickup = dto.isPickup;
    }

    if (dto.pickupAddress !== undefined) {
      data.pickupAddress = dto.pickupAddress?.trim() || null;
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

    const vendorSubtotals = this.calculateVendorSubtotals(items, products);
    const options = this.buildSharedOptions(vendorIds, methods, destination, vendorSubtotals);

    return options.map((option) => ({
      code: option.code,
      name: option.name,
      description: option.description,
      eta: option.eta,
      fee: option.fee.toFixed(2),
      cashOnDeliveryEnabled: option.cashOnDeliveryEnabled,
      isPickup: option.isPickup,
      pickupAddress: option.pickupAddress,
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

    const vendorSubtotals = this.calculateVendorSubtotals(items, products);

    return {
      code,
      fee: availableMethods.reduce((sum, method) => {
        const subtotal = vendorSubtotals.get(method.vendorId) ?? new Prisma.Decimal(0);
        if (method.freeShippingMinimum && subtotal.gte(method.freeShippingMinimum)) {
          return sum;
        }
        return sum.add(method.fee);
      }, new Prisma.Decimal(0)),
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

  private buildSharedOptions(vendorIds: string[], methods: VendorShippingChoice[], destination: ShippingDestination, vendorSubtotals: Map<string, Prisma.Decimal> = new Map()) {
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
        nameAr: group[0].nameAr,
        nameEn: group[0].nameEn,
        description: group[0].description,
        descriptionAr: group[0].descriptionAr,
        descriptionEn: group[0].descriptionEn,
        eta: group[0].eta,
        etaAr: group[0].etaAr,
        etaEn: group[0].etaEn,
        fee: group.reduce((sum, method) => {
          const subtotal = vendorSubtotals.get(method.vendorId) ?? new Prisma.Decimal(0);
          if (method.freeShippingEnabled && method.freeShippingMinimum && subtotal.gte(method.freeShippingMinimum)) {
            return sum;
          }
          return sum.add(method.fee);
        }, new Prisma.Decimal(0)),
        cashOnDeliveryEnabled: group.every((method) => method.cashOnDeliveryEnabled),
        isPickup: group[0].isPickup,
        pickupAddress: group[0].pickupAddress,
      }))
      .sort((first, second) => Number(first.fee) - Number(second.fee));
  }

  private calculateVendorSubtotals(items: ShippingMethodItemDto[], products: Array<{ id: string; vendorId: string; price: Prisma.Decimal }>) {
    const priceById = new Map(products.map((p) => [p.id, p]));
    const subtotals = new Map<string, Prisma.Decimal>();
    for (const item of items) {
      const product = priceById.get(item.productId);
      if (!product) continue;
      const current = subtotals.get(product.vendorId) ?? new Prisma.Decimal(0);
      subtotals.set(product.vendorId, current.add(product.price.mul(item.quantity)));
    }
    return subtotals;
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

  private isAvailableForDestination(method: Pick<VendorShippingChoice, "isPickup" | "excludedRegions" | "unavailableLocations" | "deliveryLocations">, destination: ShippingDestination) {
    if (method.isPickup) return true;
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
