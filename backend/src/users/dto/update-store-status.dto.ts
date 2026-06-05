import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class UpdateStoreStatusDto {
  @ApiProperty({ example: "PAUSED", enum: ["ACTIVE", "PAUSED"] })
  @IsIn(["ACTIVE", "PAUSED"])
  status!: "ACTIVE" | "PAUSED";
}
