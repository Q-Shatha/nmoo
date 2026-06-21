import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReviewStatus } from "@prisma/client";
import { IsEnum } from "class-validator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

class UpdateReviewStatusDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get("vendor/:vendorId")
  @ApiOperation({ summary: "List approved public reviews for one vendor store" })
  findByVendor(@Param("vendorId", ParseUUIDPipe) vendorId: string) {
    return this.reviewsService.findByVendor(vendorId);
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "List approved public reviews for one product" })
  findByProduct(@Param("productId", ParseUUIDPipe) productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get("vendor/:vendorId/reviewable-products")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List purchased products that the current customer can review for one vendor" })
  findReviewableProducts(@Param("vendorId", ParseUUIDPipe) vendorId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.findReviewableProducts(vendorId, user);
  }

  @Get("dashboard/mine")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Vendor: list all reviews on their products for moderation" })
  findDashboardReviews(@CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.findDashboardReviews(user);
  }

  @Patch(":reviewId/status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Vendor: approve or reject a review on their product" })
  updateStatus(
    @Param("reviewId", ParseUUIDPipe) reviewId: string,
    @Body() dto: UpdateReviewStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviewsService.updateStatus(reviewId, dto.status, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create or update a customer product review" })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.create(dto, user);
  }
}
