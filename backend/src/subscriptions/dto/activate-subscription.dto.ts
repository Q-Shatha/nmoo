import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class ActivateSubscriptionDto {
  @ApiPropertyOptional({ example: "pro", default: "pro" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  plan?: string;

  @ApiPropertyOptional({ enum: ["active", "trialing"], default: "active" })
  @IsOptional()
  @IsIn(["active", "trialing"])
  status?: "active" | "trialing";

  @ApiPropertyOptional({ example: 30, minimum: 1, maximum: 365, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  durationDays?: number;
}
