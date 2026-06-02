import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ example: "pro" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  plan?: string;

  @ApiPropertyOptional({ enum: ["none", "active", "trialing", "past_due", "cancelled", "expired"] })
  @IsOptional()
  @IsIn(["none", "active", "trialing", "past_due", "cancelled", "expired"])
  status?: string;

  @ApiPropertyOptional({ example: "2026-05-26T18:00:00.000Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startedAt?: Date;

  @ApiPropertyOptional({ example: "2026-06-25T18:00:00.000Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}
