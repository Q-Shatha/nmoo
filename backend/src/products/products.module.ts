import { Module } from "@nestjs/common";
import { ProductAssetsController } from "./product-assets.controller";
import { ProductAssetsService } from "./product-assets.service";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  controllers: [ProductAssetsController, ProductsController],
  providers: [ProductAssetsService, ProductsService],
  exports: [ProductAssetsService],
})
export class ProductsModule {}
