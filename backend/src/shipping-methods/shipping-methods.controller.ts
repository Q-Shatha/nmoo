import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CheckoutShippingOptionsDto } from "./dto/checkout-shipping-options.dto";
import { CreateShippingMethodDto } from "./dto/create-shipping-method.dto";
import { UpdateShippingMethodDto } from "./dto/update-shipping-method.dto";
import { ShippingMethodsService } from "./shipping-methods.service";

@ApiTags("Shipping Methods")
@Controller("shipping-methods")
export class ShippingMethodsController {
  constructor(private readonly shippingMethodsService: ShippingMethodsService) {}

  @Post("checkout-options")
  @ApiOperation({ summary: "List shipping options available for the checkout items" })
  findCheckoutOptions(@Body() dto: CheckoutShippingOptionsDto) {
    return this.shippingMethodsService.findCheckoutOptions(dto.items, {
      country: dto.destinationCountry,
      region: dto.destinationRegion,
      city: dto.destinationCity,
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List shipping methods owned by the authenticated vendor" })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.shippingMethodsService.findMine(user);
  }

  @Get("vendor/:vendorId/coverage")
  @ApiOperation({ summary: "Check whether a vendor supports shipping to a destination" })
  checkVendorCoverage(
    @Param("vendorId", ParseUUIDPipe) vendorId: string,
    @Query("country") country?: string,
    @Query("region") region?: string,
    @Query("city") city?: string,
  ) {
    return this.shippingMethodsService.checkVendorCoverage(vendorId, { country, region, city });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a shipping method as a vendor" })
  create(@Body() dto: CreateShippingMethodDto, @CurrentUser() user: AuthenticatedUser) {
    return this.shippingMethodsService.create(dto, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a shipping method as a vendor" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateShippingMethodDto, @CurrentUser() user: AuthenticatedUser) {
    return this.shippingMethodsService.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a shipping method as a vendor" })
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.shippingMethodsService.remove(id, user);
  }
}
