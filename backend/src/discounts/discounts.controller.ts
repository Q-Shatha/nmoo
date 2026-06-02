import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CreateDiscountCodeDto } from "./dto/create-discount-code.dto";
import { UpdateDiscountCodeDto } from "./dto/update-discount-code.dto";
import { ValidateDiscountCodeDto } from "./dto/validate-discount-code.dto";
import { DiscountsService } from "./discounts.service";

@ApiTags("Discount Codes")
@Controller("discounts")
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List discount codes owned by the authenticated vendor" })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.discountsService.findMine(user);
  }

  @Post("validate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Validate a discount code for checkout items" })
  async validate(@Body() dto: ValidateDiscountCodeDto, @CurrentUser() user: AuthenticatedUser) {
    const discount = await this.discountsService.validateForCheckout(dto.code, dto.items, user);
    return this.discountsService.toCheckoutResponse(discount);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a discount code as a vendor" })
  create(@Body() dto: CreateDiscountCodeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.discountsService.create(dto, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a discount code as a vendor" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateDiscountCodeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.discountsService.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a discount code as a vendor" })
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.discountsService.remove(id, user);
  }
}
