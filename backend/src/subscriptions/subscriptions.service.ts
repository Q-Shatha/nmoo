import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { ActivateSubscriptionDto } from "./dto/activate-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(user: AuthenticatedUser) {
    this.ensureVendorLike(user);

    return this.prisma.vendorSubscription.upsert({
      where: {
        vendorId: user.id,
      },
      update: {},
      create: {
        vendorId: user.id,
        plan: "free",
        status: "none",
      },
      include: this.subscriptionIncludes(),
    });
  }

  async activate(activateSubscriptionDto: ActivateSubscriptionDto, user: AuthenticatedUser) {
    this.ensureVendorLike(user);

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (activateSubscriptionDto.durationDays ?? 30));

    return this.prisma.vendorSubscription.upsert({
      where: {
        vendorId: user.id,
      },
      update: {
        plan: activateSubscriptionDto.plan ?? "pro",
        status: activateSubscriptionDto.status ?? "active",
        startedAt: now,
        expiresAt,
      },
      create: {
        vendorId: user.id,
        plan: activateSubscriptionDto.plan ?? "pro",
        status: activateSubscriptionDto.status ?? "active",
        startedAt: now,
        expiresAt,
      },
      include: this.subscriptionIncludes(),
    });
  }

  async update(vendorId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!vendor || vendor.role !== UserRole.VENDOR) {
      throw new NotFoundException("Vendor not found");
    }

    return this.prisma.vendorSubscription.upsert({
      where: {
        vendorId,
      },
      update: updateSubscriptionDto,
      create: {
        vendorId,
        plan: updateSubscriptionDto.plan ?? "free",
        status: updateSubscriptionDto.status ?? "none",
        startedAt: updateSubscriptionDto.startedAt,
        expiresAt: updateSubscriptionDto.expiresAt,
      },
      include: this.subscriptionIncludes(),
    });
  }

  private ensureVendorLike(user: AuthenticatedUser) {
    if (user.role !== UserRole.VENDOR && user.role !== UserRole.ADMIN) {
      throw new BadRequestException("Only vendors can use subscriptions");
    }
  }

  private subscriptionIncludes() {
    return {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    };
  }
}
