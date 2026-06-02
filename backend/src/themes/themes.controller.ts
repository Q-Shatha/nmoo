import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { UpdateThemeDto } from "./dto/update-theme.dto";
import { ThemesService } from "./themes.service";

@ApiTags("Themes")
@Controller("themes")
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get("active")
  @ApiOperation({ summary: "Get the active public storefront theme" })
  findActive() {
    return this.themesService.findActive();
  }

  @Get("vendor/:vendorId")
  @ApiOperation({ summary: "Get a public vendor storefront theme" })
  findVendorTheme(@Param("vendorId", ParseUUIDPipe) vendorId: string) {
    return this.themesService.findVendorTheme(vendorId);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated vendor theme" })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.themesService.findMine(user);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated vendor theme" })
  updateMine(@Body() dto: UpdateThemeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.themesService.updateMine(dto, user);
  }
}
