import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CreateStorePageDto } from "./dto/create-store-page.dto";
import { UpdateStorePageDto } from "./dto/update-store-page.dto";
import { StorePagesService } from "./store-pages.service";

@ApiTags("Store Pages")
@Controller("store-pages")
export class StorePagesController {
  constructor(private readonly storePagesService: StorePagesService) {}

  @Get()
  @ApiOperation({ summary: "List published store pages" })
  findPublished() {
    return this.storePagesService.findPublished();
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List pages owned by the authenticated vendor" })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.storePagesService.findMine(user);
  }

  @Get("vendor/:vendorId")
  @ApiOperation({ summary: "List published store pages for a vendor" })
  findPublishedByVendor(@Param("vendorId", ParseUUIDPipe) vendorId: string) {
    return this.storePagesService.findPublishedByVendor(vendorId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one published store page" })
  findOnePublished(@Param("id", ParseUUIDPipe) id: string) {
    return this.storePagesService.findOnePublished(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a vendor store page" })
  create(@Body() dto: CreateStorePageDto, @CurrentUser() user: AuthenticatedUser) {
    return this.storePagesService.create(dto, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a vendor store page" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateStorePageDto, @CurrentUser() user: AuthenticatedUser) {
    return this.storePagesService.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a vendor store page" })
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.storePagesService.remove(id, user);
  }
}
