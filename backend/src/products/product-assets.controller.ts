import { Controller, Get, Param, Res, StreamableFile } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ProductAssetsService } from "./product-assets.service";

@ApiTags("Assets")
@Controller("assets")
export class ProductAssetsController {
  constructor(private readonly productAssetsService: ProductAssetsService) {}

  @Get(":encodedKey")
  @ApiOperation({ summary: "Stream an uploaded S3 asset through the API" })
  async getAsset(@Param("encodedKey") encodedKey: string, @Res({ passthrough: true }) response: Response) {
    const asset = await this.productAssetsService.getUploadedAsset(encodedKey);

    response.set({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": asset.contentType,
    });

    return new StreamableFile(asset.body);
  }
}
