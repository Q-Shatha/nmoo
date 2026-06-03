import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DiscountType, ProductStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsEnum,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class ProductOptionDto {
  @ApiProperty({ example: "اللون", minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ type: [String], example: ["أحمر", "أزرق"] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(80, { each: true })
  values!: string[];
}

export class CreateProductDto {
  @ApiProperty({ example: "حقيبة يومية", minLength: 2, maxLength: 140 })
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  title!: string;

  @ApiPropertyOptional({ example: "حقيبة أنيقة مناسبة للاستخدام اليومي.", maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: "وصل حديثاً", maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  badgeLabel?: string;

  @ApiProperty({ example: 149.99, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 15, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ example: 25, minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: "https://example.com/product.jpg" })
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ["https://example.com/product-1.jpg"] })
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ type: [ProductOptionDto], example: [{ name: "اللون", values: ["أحمر", "أزرق"] }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options?: ProductOptionDto[];

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
