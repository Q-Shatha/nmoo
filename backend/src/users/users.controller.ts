import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateStoreStatusDto } from "./dto/update-store-status.dto";
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

  @Patch("me/store-status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Pause or reactivate the authenticated vendor store" })
  updateMyStoreStatus(@Body() updateStoreStatusDto: UpdateStoreStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updateStoreStatus(user.id, updateStoreStatusDto);
  }

  @Delete("me/store")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Permanently delete the authenticated vendor store" })
  deleteMyStore(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteStore(user.id);
  }

  @Patch("me/address")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated user's address" })
  updateMyAddress(@Body() updateAddressDto: UpdateAddressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updateAddress(user.id, updateAddressDto);
  }

  @Patch("me/profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  updateMyProfile(@Body() updateProfileDto: UpdateProfileDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Post("me/avatar")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_request, file, callback) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
          callback(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload the authenticated user's avatar" })
  updateMyAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updateAvatar(user.id, file);
  }
}
