import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { UpdateStoreUsernameDto } from "./dto/update-store-username.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("vendors/:id")
  @ApiOperation({ summary: "Get a public vendor profile" })
  findPublicVendor(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findPublicVendor(id);
  }

  @Get("vendors/by-username/:username")
  @ApiOperation({ summary: "Get a public vendor profile by store username" })
  findPublicVendorByUsername(@Param("username") username: string) {
    return this.usersService.findPublicVendorByUsername(username);
  }

  @Get("store-username/availability")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Check if a store username is available" })
  checkStoreUsernameAvailability(@Query("username") username: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.checkStoreUsernameAvailability(username, user.id);
  }

  @Patch("me/store-username")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated vendor store username" })
  updateMyStoreUsername(@Body() updateStoreUsernameDto: UpdateStoreUsernameDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updateStoreUsername(user.id, updateStoreUsernameDto);
  }

  @Patch("me/address")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated user's address" })
  updateMyAddress(@Body() updateAddressDto: UpdateAddressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updateAddress(user.id, updateAddressDto);
  }
}
