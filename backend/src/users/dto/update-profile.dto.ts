import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "سارة أحمد" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;
}
