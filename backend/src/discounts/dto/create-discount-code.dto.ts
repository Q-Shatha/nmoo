import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DiscountType } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateDiscountCodeDto {
  @ApiProperty({ example: "WELCOME10" })
  @IsString()
  @MaxLength(40)
  code!: string;

  @ApiPropertyOptional({ example: "خصم ترحيبي للعملاء الجدد" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  type!: DiscountType;

  @ApiProperty({ example: 10, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100000)
  value!: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 100, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiPropertyOptional({ example: "2026-06-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: ["uuid-1", "uuid-2"], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  productIds?: string[];
}
