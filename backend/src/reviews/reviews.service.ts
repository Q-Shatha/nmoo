import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, Prisma, ProductStatus, UserRole } from "@prisma/client";
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
          status: {
            in: this.reviewableOrderStatuses(),
          },
        },
        product: {
          vendorId,
          status: ProductStatus.ACTIVE,
        },
      },
      distinct: ["productId"],
      orderBy: {
        product: {
          createdAt: "desc",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            vendorId: true,
          },
        },
      },
    });

    return orderItems.map((item) => item.product);
  }

  async findByVendor(vendorId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        product: {
          vendorId,
          status: ProductStatus.ACTIVE,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 24,
      include: this.reviewIncludes(),
    });

    return reviews.map((review) => this.serializeReview(review));
  }

  async findByProduct(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        product: {
          id: productId,
          status: ProductStatus.ACTIVE,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 48,
      include: this.reviewIncludes(),
    });

    return reviews.map((review) => this.serializeReview(review));
  }

  async create(dto: CreateReviewDto, user: AuthenticatedUser) {
    if (user.role === UserRole.VENDOR) {
      throw new ForbiddenException("Vendors cannot review products as customers");
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        productId: dto.productId,
        order: {
          buyerId: user.id,
          status: {
            in: this.reviewableOrderStatuses(),
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!purchased) {
      throw new ForbiddenException("You can only review products you purchased");
    }

    const review = await this.prisma.review.upsert({
      where: {
        productId_userId: {
          productId: dto.productId,
          userId: user.id,
        },
      },
      create: {
        productId: dto.productId,
        userId: user.id,
        rating: dto.rating,
        comment: this.normalizeOptionalText(dto.comment),
      },
      update: {
        rating: dto.rating,
        comment: this.normalizeOptionalText(dto.comment),
      },
      include: this.reviewIncludes(),
    });

    return this.serializeReview(review);
  }

  private reviewIncludes() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          vendorId: true,
        },
      },
    };
  }

  private reviewableOrderStatuses() {
    return [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.COMPLETED];
  }

  private serializeReview(review: Prisma.ReviewGetPayload<{ include: ReturnType<ReviewsService["reviewIncludes"]> }>) {
    return review;
  }

  private normalizeOptionalText(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }
}
