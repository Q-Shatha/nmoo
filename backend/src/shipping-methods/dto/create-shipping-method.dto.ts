import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";

export class ShippingUnavailableLocationDto {
  @ApiProperty({ example: "SA" })
  @IsString()
  @MaxLength(2)
  country!: string;

  @ApiPropertyOptional({ example: "منطقة الرياض" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiPropertyOptional({ example: "الرياض" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;
}

export class CreateShippingMethodDto {
  @ApiProperty({ example: "spl" })
  @IsString()
  @MaxLength(40)
  code!: string;

  @ApiProperty({ example: "سبل" })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameEn?: string;

  @ApiProperty({ example: 20, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fee!: number;

  @ApiPropertyOptional({ example: "خيار اقتصادي مناسب لمعظم المدن." })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  descriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  descriptionEn?: string;

  @ApiPropertyOptional({ example: "2 - 5 أيام عمل" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  etaAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  etaEn?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  cashOnDeliveryEnabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  freeShippingEnabled?: boolean;

  @ApiPropertyOptional({ example: 200, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  freeShippingMinimum?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPickup?: boolean;

  @ApiPropertyOptional({ example: "الرياض، حي العليا، شارع العروبة" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pickupAddress?: string;

  @ApiPropertyOptional({ example: ["منطقة الرياض", "منطقة مكة المكرمة"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedRegions?: string[];

  @ApiPropertyOptional({ type: [ShippingUnavailableLocationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingUnavailableLocationDto)
  unavailableLocations?: ShippingUnavailableLocationDto[];

  @ApiPropertyOptional({ type: [ShippingUnavailableLocationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingUnavailableLocationDto)
  deliveryLocations?: ShippingUnavailableLocationDto[];
}
