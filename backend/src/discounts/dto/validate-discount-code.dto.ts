import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsString, ValidateNested } from "class-validator";
import { DiscountItemDto } from "./discount-item.dto";

export class ValidateDiscountCodeDto {
  @ApiProperty({ example: "WELCOME10" })
  @IsString()
  code!: string;

  @ApiProperty({ type: [DiscountItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DiscountItemDto)
  items!: DiscountItemDto[];
}
