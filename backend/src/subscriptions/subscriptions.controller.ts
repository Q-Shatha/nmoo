import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ActivateSubscriptionDto } from "./dto/activate-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("Subscriptions")
@Controller("subscriptions")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("me")
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Get the current vendor subscription" })
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findMe(user);
  }

  @Post("activate")
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Activate the current vendor subscription manually for development" })
  activate(@Body() activateSubscriptionDto: ActivateSubscriptionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.activate(activateSubscriptionDto, user);
  }

  @Patch(":vendorId")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update a vendor subscription as an admin" })
  update(@Param("vendorId", ParseUUIDPipe) vendorId: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(vendorId, updateSubscriptionDto);
  }
}
