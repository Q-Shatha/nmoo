import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { UpdateStoreUsernameDto } from "./dto/update-store-username.dto";

const safeUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  storeUsername: true,
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
});

const userWithPasswordSelect = Prisma.validator<Prisma.UserSelect>()({
  ...safeUserSelect,
  passwordHash: true,
});

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
export type UserWithPassword = Prisma.UserGetPayload<{ select: typeof userWithPasswordSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: safeUserSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: userWithPasswordSelect,
    });
  }

  findSafeById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async findPublicVendor(id: string) {
    const vendor = await this.prisma.user.findFirst({
      where: {
        id,
        role: {
          in: [UserRole.VENDOR, UserRole.ADMIN],
        },
      },
      select: safeUserSelect,
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return vendor;
  }

  async findPublicVendorByUsername(storeUsername: string) {
    const vendor = await this.prisma.user.findFirst({
      where: {
        storeUsername: normalizeStoreUsername(storeUsername),
        role: {
          in: [UserRole.VENDOR, UserRole.ADMIN],
        },
      },
      select: safeUserSelect,
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return vendor;
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

    return this.prisma.user.update({
      where: { id },
      data: { storeUsername: availability.storeUsername },
      select: safeUserSelect,
    });
  }

  updateAddress(id: string, data: UpdateAddressDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  }

  toSafeUser(user: SafeUser | UserWithPassword): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      storeUsername: user.storeUsername,
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
    };
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

function validateReservedUsername(value: string) {
  if (reservedUsernames.has(value)) {
    throw new ConflictException("Store username is reserved");
  }
}
