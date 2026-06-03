import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: "تجربة ممتازة والتغليف كان جميل.", maxLength: 700 })
  @IsOptional()
  @IsString()
  @MaxLength(700)
  comment?: string;
}
