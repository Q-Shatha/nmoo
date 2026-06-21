import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsString, IsInt, IsOptional, Min } from "class-validator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CartService } from "./cart.service";

class TrackCartDto {
  @IsString() productId: string;
  @IsString() vendorId: string;
  @IsOptional() @IsInt() @Min(1) quantity?: number;
}

@ApiTags("Cart")
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("track")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Track a cart add event for the logged-in buyer" })
  track(@Body() dto: TrackCartDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cartService.track(dto.productId, dto.vendorId, dto.quantity ?? 1, user.id);
  }

  @Get("abandoned")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List buyers who added vendor products to cart but never ordered" })
  abandoned(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getAbandoned(user.id);
  }
}
