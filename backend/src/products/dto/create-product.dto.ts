import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DiscountType, ProductStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsBoolean,
  IsEnum,
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
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

  @ApiPropertyOptional({ example: "اللون", maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameAr?: string;

  @ApiPropertyOptional({ example: "Color", maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameEn?: string;

  @ApiProperty({ type: [String], example: ["أحمر", "أزرق"] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(80, { each: true })
  values!: string[];

  @ApiPropertyOptional({ type: [String], example: ["أحمر", "أزرق"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  valuesAr?: string[];

  @ApiPropertyOptional({ type: [String], example: ["Red", "Blue"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  valuesEn?: string[];

  @ApiPropertyOptional({ example: { "أحمر": 8, "أزرق": 5 } })
  @IsOptional()
  @IsObject()
  valueQuantities?: Record<string, number>;

  @ApiPropertyOptional({ example: { "ط£ط­ظ…ط±": 149.99, "ط£ط²ط±ظ‚": 159.99 } })
  @IsOptional()
  @IsObject()
  valuePrices?: Record<string, number>;
}

export class ProductAddonDto {
  @ApiProperty({ example: "تغليف هدية", minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: "تغليف هدية", maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameAr?: string;

  @ApiPropertyOptional({ example: "Gift wrapping", maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameEn?: string;

  @ApiProperty({ example: 15, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: "حقيبة يومية", minLength: 2, maxLength: 140 })
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  title!: string;

  @ApiPropertyOptional({ example: "حقيبة يومية", maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  titleAr?: string;

  @ApiPropertyOptional({ example: "Daily Bag", maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  titleEn?: string;

  @ApiPropertyOptional({ example: "حقيبة أنيقة مناسبة للاستخدام اليومي.", maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: "حقيبة أنيقة مناسبة للاستخدام اليومي.", maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionAr?: string;

  @ApiPropertyOptional({ example: "An elegant bag for everyday use.", maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionEn?: string;

  @ApiPropertyOptional({ example: "وصل حديثاً", maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  badgeLabel?: string;

  @ApiPropertyOptional({ example: "وصل حديثاً", maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  badgeLabelAr?: string;

  @ApiPropertyOptional({ example: "New Arrival", maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  badgeLabelEn?: string;

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
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ["https://example.com/product-1.jpg"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ type: [ProductOptionDto], example: [{ name: "اللون", values: ["أحمر", "أزرق"] }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options?: ProductOptionDto[];

  @ApiPropertyOptional({ type: [ProductAddonDto], example: [{ name: "تغليف هدية", price: 15 }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAddonDto)
  addons?: ProductAddonDto[];

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
