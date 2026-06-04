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

  @ApiPropertyOptional({ example: "2 - 5 أيام عمل" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  eta?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  cashOnDeliveryEnabled?: boolean;

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
