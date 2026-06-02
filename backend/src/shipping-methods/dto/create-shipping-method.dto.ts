import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

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
}
