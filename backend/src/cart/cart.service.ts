import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async track(productId: string, vendorId: string, quantity: number, buyerId: string) {
    await this.prisma.cartEvent.upsert({
      where: { buyerId_productId: { buyerId, productId } },
      create: { buyerId, productId, vendorId, quantity },
      update: { quantity, updatedAt: new Date() },
    });
    return { ok: true };
  }

  async getAbandoned(vendorId: string) {
    // Buyers who have cart events for this vendor's products but never placed an order with them
    const cartEvents = await this.prisma.cartEvent.findMany({
      where: { vendorId },
      include: {
        buyer: { select: { id: true, name: true, email: true, phoneNumber: true, country: true, city: true } },
        product: { select: { id: true, title: true, price: true, imageUrl: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Group by buyer
    const byBuyer = new Map<string, {
      buyer: typeof cartEvents[0]["buyer"];
      items: Array<{ product: typeof cartEvents[0]["product"]; quantity: number; addedAt: Date }>;
      lastActive: Date;
    }>();

    for (const event of cartEvents) {
      const existing = byBuyer.get(event.buyerId);
      const item = { product: event.product, quantity: event.quantity, addedAt: event.addedAt };
      if (existing) {
        existing.items.push(item);
        if (event.updatedAt > existing.lastActive) existing.lastActive = event.updatedAt;
      } else {
        byBuyer.set(event.buyerId, { buyer: event.buyer, items: [item], lastActive: event.updatedAt });
      }
    }

    // Filter out buyers who already placed an order with this vendor
    const buyerIds = [...byBuyer.keys()];
    if (buyerIds.length === 0) return [];

    const orderedBuyerIds = await this.prisma.order.findMany({
      where: {
        buyerId: { in: buyerIds },
        items: { some: { product: { vendorId } } },
        status: { notIn: ["CANCELLED"] },
      },
      select: { buyerId: true },
      distinct: ["buyerId"],
    });

    const orderedSet = new Set(orderedBuyerIds.map((o) => o.buyerId));

    return [...byBuyer.entries()]
      .filter(([buyerId]) => !orderedSet.has(buyerId))
      .map(([, data]) => data)
      .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
  }
}
