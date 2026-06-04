import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from "class-validator";

export class CreateOrderItemDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: "spl" })
  @IsString()
  shippingCarrier!: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({ example: "WELCOME10" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  discountCode?: string;

  @ApiPropertyOptional({ example: "ONLINE", enum: ["ONLINE", "CASH_ON_DELIVERY"] })
  @IsOptional()
  @IsString()
  @IsIn(["ONLINE", "CASH_ON_DELIVERY"])
  paymentMethod?: "ONLINE" | "CASH_ON_DELIVERY";
}
