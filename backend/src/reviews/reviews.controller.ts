import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get("vendor/:vendorId")
  @ApiOperation({ summary: "List public reviews for one vendor store" })
  findByVendor(@Param("vendorId", ParseUUIDPipe) vendorId: string) {
    return this.reviewsService.findByVendor(vendorId);
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "List public reviews for one product" })
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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create or update a customer product review" })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.create(dto, user);
  }
}
