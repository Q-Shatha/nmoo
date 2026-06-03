import { Module } from "@nestjs/common";
import { ProductsModule } from "../products/products.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [ProductsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
