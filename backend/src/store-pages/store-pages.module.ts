import { Module } from "@nestjs/common";
import { StorePagesController } from "./store-pages.controller";
import { StorePagesService } from "./store-pages.service";

@Module({
  controllers: [StorePagesController],
  providers: [StorePagesService],
})
export class StorePagesModule {}
