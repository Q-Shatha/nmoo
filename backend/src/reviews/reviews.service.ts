import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, Prisma, ProductStatus, ReviewStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findReviewableProducts(vendorId: string, user: AuthenticatedUser) {
    if (user.role === UserRole.VENDOR) {
      throw new ForbiddenException("Vendors cannot review products as customers");
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          buyerId: user.id,
          status: { in: this.reviewableOrderStatuses() },
        },
        product: { vendorId, status: ProductStatus.ACTIVE },
      },
      distinct: ["productId"],
      orderBy: { product: { createdAt: "desc" } },
      include: {
        product: { select: { id: true, title: true, vendorId: true } },
      },
    });

    return orderItems.map((item) => item.product);
  }

  async findByVendor(vendorId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        status: ReviewStatus.APPROVED,
        product: { vendorId, status: ProductStatus.ACTIVE },
      },
      orderBy: { updatedAt: "desc" },
      take: 24,
      include: this.reviewIncludes(),
    });

    return reviews.map((r) => this.serializeReview(r));
  }

  async findByProduct(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        status: ReviewStatus.APPROVED,
        product: { id: productId, status: ProductStatus.ACTIVE },
      },
      orderBy: { updatedAt: "desc" },
      take: 48,
      include: this.reviewIncludes(),
    });

    return reviews.map((r) => this.serializeReview(r));
  }

  /** Dashboard: all reviews belonging to the vendor's products, grouped by status */
  async findDashboardReviews(user: AuthenticatedUser) {
    if (user.role !== UserRole.VENDOR) {
      throw new ForbiddenException("Only vendors can access this endpoint");
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        product: { vendorId: user.id },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: this.reviewIncludes(),
    });

    return reviews.map((r) => this.serializeReview(r));
  }

  /** Dashboard: vendor approves or rejects a review on their product */
  async updateStatus(reviewId: string, status: ReviewStatus, user: AuthenticatedUser) {
    if (user.role !== UserRole.VENDOR) {
      throw new ForbiddenException("Only vendors can moderate reviews");
    }

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { vendorId: true } } },
    });

    if (!review) throw new NotFoundException("Review not found");
    if (review.product.vendorId !== user.id) throw new ForbiddenException("Not your product");

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { status },
      include: this.reviewIncludes(),
    });

    return this.serializeReview(updated);
  }

  async create(dto: CreateReviewDto, user: AuthenticatedUser) {
    if (user.role === UserRole.VENDOR) {
      throw new ForbiddenException("Vendors cannot review products as customers");
    }

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: ProductStatus.ACTIVE },
      select: { id: true },
    });

    if (!product) throw new NotFoundException("Product not found");

    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        productId: dto.productId,
        order: { buyerId: user.id, status: { in: this.reviewableOrderStatuses() } },
      },
      select: { id: true },
    });

    if (!purchased) throw new ForbiddenException("You can only review products you purchased");

    const review = await this.prisma.review.upsert({
      where: { productId_userId: { productId: dto.productId, userId: user.id } },
      create: {
        productId: dto.productId,
        userId: user.id,
        rating: dto.rating,
        comment: this.normalizeOptionalText(dto.comment),
        status: ReviewStatus.PENDING,
      },
      update: {
        rating: dto.rating,
        comment: this.normalizeOptionalText(dto.comment),
        status: ReviewStatus.PENDING,
      },
      include: this.reviewIncludes(),
    });

    return this.serializeReview(review);
  }

  private reviewIncludes() {
    return {
      user: { select: { id: true, name: true, avatarUrl: true, city: true } },
      product: { select: { id: true, title: true, vendorId: true } },
    };
  }

  private reviewableOrderStatuses() {
    return [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.COMPLETED];
  }

  private serializeReview(review: Prisma.ReviewGetPayload<{ include: ReturnType<ReviewsService["reviewIncludes"]> }>) {
    return {
      ...review,
      user: review.user
        ? { ...review.user, avatarUrl: normalizeAssetUrl(review.user.avatarUrl) }
        : review.user,
    };
  }

  private normalizeOptionalText(value: string | undefined) {
    if (value === undefined) return undefined;
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }
}

function normalizeAssetUrl(value: string | null) {
  if (!value) return value;
  const marker = "/api/assets/";
  const markerIndex = value.indexOf(marker);
  return markerIndex === -1 ? value : value.slice(markerIndex);
}
