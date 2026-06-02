import { Body, Controller, Headers, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { PaymentsService } from "./payments.service";

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("checkout-session")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a Stripe Checkout session for an order" })
  createCheckoutSession(@Body() dto: CreateCheckoutSessionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.createCheckoutSession(dto, user);
  }

  @Post("stripe/webhook")
  @ApiOperation({ summary: "Handle Stripe payment webhooks" })
  handleStripeWebhook(@Req() request: RawBodyRequest, @Headers("stripe-signature") signature?: string) {
    return this.paymentsService.handleStripeWebhook(request.rawBody, signature);
  }
}
