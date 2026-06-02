import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { ShippingMethodItemDto } from "./shipping-method-item.dto";

export class CheckoutShippingOptionsDto {
  @ApiProperty({ type: [ShippingMethodItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShippingMethodItemDto)
  items!: ShippingMethodItemDto[];
}
