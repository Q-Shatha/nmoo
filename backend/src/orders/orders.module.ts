import { Module } from "@nestjs/common";
import { DiscountsModule } from "../discounts/discounts.module";
import { ShippingMethodsModule } from "../shipping-methods/shipping-methods.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [DiscountsModule, ShippingMethodsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
