import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "ahmed@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "StrongPassword123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: [UserRole.BUYER, UserRole.VENDOR], required: false })
  @IsOptional()
  @IsIn([UserRole.BUYER, UserRole.VENDOR])
  expectedRole?: UserRole;
}
