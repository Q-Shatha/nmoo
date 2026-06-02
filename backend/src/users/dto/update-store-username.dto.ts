import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateStoreUsernameDto {
  @ApiProperty({ example: "mystore", minLength: 3, maxLength: 32 })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: "storeUsername can contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen",
  })
  storeUsername!: string;
}
