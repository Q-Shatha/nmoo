import { BadRequestException, ForbiddenException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@prisma/client";
import Stripe = require("stripe");
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";

const SHIPPING_LABELS: Record<string, string> = {
  spl: "سبل",
  smsa: "سمسا",
  aramex: "أرامكس",
  pickup: "استلام من المتجر",
};

@Injectable()
export class PaymentsService {
  private readonly stripe?: Stripe.Stripe;
  private readonly frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    this.frontendUrl = this.configService.get<string>("FRONTEND_URL") ?? "http://localhost:3000";

    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto, user: AuthenticatedUser) {
    if (!this.stripe) {
      throw new ServiceUnavailableException("Stripe payments are not configured");
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ServiceUnavailableException("Order is not available for payment");
    }

    if (user.role !== UserRole.ADMIN && order.buyerId !== user.id) {
      throw new ForbiddenException("You cannot pay for this order");
    }

    const currency = this.configService.get<string>("STRIPE_CURRENCY") ?? "sar";
    const lineItems = [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(Number(order.total) * 100),
          product_data: {
            name: `طلب nmoo #${order.id.slice(0, 8)}`,
            description: this.buildOrderPaymentDescription(order),
          },
        },
      },
    ];

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      customer_email: user.email,
      success_url: `${this.frontendUrl}/payment/${order.id}?payment=success`,
      cancel_url: `${this.frontendUrl}/payment/${order.id}?payment=cancelled`,
      metadata: {
        orderId: order.id,
        buyerId: user.id,
      },
      line_items: lineItems,
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async handleStripeWebhook(rawBody?: Buffer, signature?: string) {
    if (!this.stripe) {
      throw new ServiceUnavailableException("Stripe payments are not configured");
    }

    const webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      throw new ServiceUnavailableException("Stripe webhook is not configured");
    }

    if (!rawBody || !signature) {
      throw new BadRequestException("Missing Stripe webhook signature");
    }

    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { metadata?: Record<string, string> };
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
          },
        });
      }
    }

    return {
      received: true,
    };
  }

  private buildOrderPaymentDescription(order: {
    items: Array<{ quantity: number; product?: { title: string } | null }>;
    shippingCarrier: string | null;
    shippingFee: unknown;
    discountCode: string | null;
    discountAmount: unknown;
  }) {
    const itemsText = order.items.map((item) => `${item.quantity}x ${item.product?.title ?? "nmoo product"}`).join(", ");
    const shippingText = Number(order.shippingFee) > 0 ? ` | الشحن: ${SHIPPING_LABELS[order.shippingCarrier ?? ""] ?? "شركة الشحن"}` : "";
    const discountText = Number(order.discountAmount) > 0 ? ` | الخصم: ${order.discountCode ?? "كود خصم"}` : "";

    return `${itemsText}${shippingText}${discountText}`.slice(0, 500);
  }
}
