import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class ProductQueryDto {
  @ApiPropertyOptional({ example: "حذاء" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "Category slug or category id", example: "shoes" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Required store owner/vendor id. Public product lists are always scoped to one store.", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ["latest", "price_asc", "price_desc"], default: "latest" })
  @IsOptional()
  @IsIn(["latest", "price_asc", "price_desc"])
  sort?: "latest" | "price_asc" | "price_desc";

  @ApiPropertyOptional({ enum: ["discounts", "recent"] })
  @IsOptional()
  @IsIn(["discounts", "recent"])
  filter?: "discounts" | "recent";

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 12, minimum: 1, maximum: 100, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
