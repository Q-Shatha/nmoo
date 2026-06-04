import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { ShippingMethodItemDto } from "./shipping-method-item.dto";

export class CheckoutShippingOptionsDto {
  @ApiProperty({ type: [ShippingMethodItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShippingMethodItemDto)
  items!: ShippingMethodItemDto[];

  @ApiProperty({ example: "منطقة الرياض", required: false })
  @IsOptional()
  @IsString()
  destinationRegion?: string;

  @ApiProperty({ example: "SA", required: false })
  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @ApiProperty({ example: "الرياض", required: false })
  @IsOptional()
  @IsString()
  destinationCity?: string;
}
