import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus, UserRole } from "@prisma/client";
import { ProductAssetsService } from "../products/product-assets.service";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateStoreUsernameDto } from "./dto/update-store-username.dto";
import { UpdateStoreStatusDto } from "./dto/update-store-status.dto";

const safeUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  storeUsername: true,
  avatarUrl: true,
  role: true,
  country: true,
  phoneNumber: true,
  region: true,
  city: true,
  district: true,
  street: true,
  buildingNumber: true,
  postalCode: true,
  nationalAddress: true,
  createdAt: true,
  updatedAt: true,
  theme: {
    select: {
      storeName: true,
      storeNameAr: true,
      storeNameEn: true,
      primaryColor: true,
      secondaryColor: true,
      textColor: true,
      logoUrl: true,
      storeStatus: true,
    },
  },
});

const userWithPasswordSelect = Prisma.validator<Prisma.UserSelect>()({
  ...safeUserSelect,
  passwordHash: true,
});

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
export type UserWithPassword = Prisma.UserGetPayload<{ select: typeof userWithPasswordSelect }>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productAssetsService: ProductAssetsService,
  ) {}

  async create(data: Prisma.UserCreateInput) {
    const user = await this.prisma.user.create({
      data,
      select: safeUserSelect,
    });

    return this.toSafeUser(user);
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: userWithPasswordSelect,
    });
  }

  async findSafeById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });

    return user ? this.toSafeUser(user) : null;
  }

  async findPublicVendor(id: string) {
    const vendor = await this.prisma.user.findFirst({
      where: {
        id,
        role: {
          in: [UserRole.VENDOR, UserRole.ADMIN],
        },
        OR: [{ theme: null }, { theme: { storeStatus: "ACTIVE" } }],
      },
      select: safeUserSelect,
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return this.toSafeUser(vendor);
  }

  async findPublicVendorByUsername(storeUsername: string) {
    const vendor = await this.prisma.user.findFirst({
      where: {
        storeUsername: normalizeStoreUsername(storeUsername),
        role: {
          in: [UserRole.VENDOR, UserRole.ADMIN],
        },
        OR: [{ theme: null }, { theme: { storeStatus: "ACTIVE" } }],
      },
      select: safeUserSelect,
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return this.toSafeUser(vendor);
  }

  async checkStoreUsernameAvailability(storeUsername: string, currentUserId?: string) {
    const normalizedUsername = normalizeStoreUsername(storeUsername);
    validateReservedUsername(normalizedUsername);

    const existingUser = await this.prisma.user.findUnique({
      where: { storeUsername: normalizedUsername },
      select: { id: true },
    });

    return {
      storeUsername: normalizedUsername,
      available: !existingUser || existingUser.id === currentUserId,
    };
  }

  async updateStoreUsername(id: string, data: UpdateStoreUsernameDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== UserRole.VENDOR && user.role !== UserRole.ADMIN)) {
      throw new ForbiddenException("Only vendors can set a store username");
    }

    const availability = await this.checkStoreUsernameAvailability(data.storeUsername, id);

    if (!availability.available) {
      throw new ConflictException("Store username is already taken");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { storeUsername: availability.storeUsername },
      select: safeUserSelect,
    });

    return this.toSafeUser(updatedUser);
  }

  async updateStoreStatus(id: string, data: UpdateStoreStatusDto) {
    await this.ensureVendorCanManageStore(id);

    return this.prisma.vendorTheme.upsert({
      where: { vendorId: id },
      update: {
        storeStatus: data.status,
        storeDeletedAt: null,
      },
      create: {
        vendorId: id,
        storeStatus: data.status,
      },
    });
  }

  async deleteStore(id: string) {
    await this.ensureVendorCanManageStore(id);

    await this.prisma.$transaction([
      this.prisma.product.updateMany({
        where: { vendorId: id },
        data: { status: ProductStatus.ARCHIVED },
      }),
      this.prisma.vendorShippingMethod.updateMany({
        where: { vendorId: id },
        data: { enabled: false },
      }),
      this.prisma.discountCode.updateMany({
        where: { vendorId: id },
        data: { enabled: false },
      }),
      this.prisma.storePage.updateMany({
        where: { vendorId: id },
        data: { published: false },
      }),
      this.prisma.vendorTheme.upsert({
        where: { vendorId: id },
        update: {
          storeStatus: "DELETED",
          storeDeletedAt: new Date(),
        },
        create: {
          vendorId: id,
          storeStatus: "DELETED",
          storeDeletedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id },
        data: {
          role: UserRole.BUYER,
          storeUsername: null,
        },
      }),
    ]);

    return { deleted: true };
  }

  async updateAddress(id: string, data: UpdateAddressDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });

    return this.toSafeUser(user);
  }

  async updateProfile(id: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name === undefined ? {} : { name: data.name.trim() }),
      },
      select: safeUserSelect,
    });

    return this.toSafeUser(user);
  }

  async updateAvatar(id: string, file: Express.Multer.File) {
    const uploaded = await this.productAssetsService.uploadUserAvatar(file, id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        avatarUrl: uploaded.url,
      },
      select: safeUserSelect,
    });

    return this.toSafeUser(user);
  }

  toSafeUser(user: SafeUser | UserWithPassword): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      storeUsername: user.storeUsername,
      avatarUrl: normalizeAssetUrl(user.avatarUrl),
      role: user.role,
      country: user.country,
      phoneNumber: user.phoneNumber,
      region: user.region,
      city: user.city,
      district: user.district,
      street: user.street,
      buildingNumber: user.buildingNumber,
      postalCode: user.postalCode,
      nationalAddress: user.nationalAddress,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      theme: user.theme ?? null,
    };
  }

  private async ensureVendorCanManageStore(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, theme: { select: { storeStatus: true } } },
    });

    if (!user || (user.role !== UserRole.VENDOR && user.role !== UserRole.ADMIN)) {
      throw new ForbiddenException("Only vendors can manage a store");
    }

    if (user.theme?.storeStatus === "DELETED") {
      throw new ForbiddenException("Store has been deleted");
    }
  }
}

const reservedUsernames = new Set([
  "account",
  "api",
  "cart",
  "checkout",
  "dashboard",
  "login",
  "orders",
  "payment",
  "register",
  "store",
  "store-pages",
  "vendors",
]);

function normalizeStoreUsername(value: string) {
  return value.trim().toLowerCase();
}

function normalizeAssetUrl(value: string | null) {
  if (!value) {
    return value;
  }

  const marker = "/api/assets/";
  const markerIndex = value.indexOf(marker);
  return markerIndex === -1 ? value : value.slice(markerIndex);
}

function validateReservedUsername(value: string) {
  if (reservedUsernames.has(value)) {
    throw new ConflictException("Store username is reserved");
  }
}
