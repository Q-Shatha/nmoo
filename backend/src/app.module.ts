import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { DiscountsModule } from "./discounts/discounts.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { ShippingMethodsModule } from "./shipping-methods/shipping-methods.module";
import { StorePagesModule } from "./store-pages/store-pages.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { ThemesModule } from "./themes/themes.module";
import { UsersModule } from "./users/users.module";
import { validateEnvironment } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_SECONDS ?? 60) * 1000,
        limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120),
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    ReviewsModule,
    CategoriesModule,
    DiscountsModule,
    OrdersModule,
    PaymentsModule,
    ShippingMethodsModule,
    StorePagesModule,
    ThemesModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
