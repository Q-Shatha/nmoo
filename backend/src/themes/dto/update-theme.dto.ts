import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

export class UpdateThemeDto {
  @ApiProperty({ example: "#884a70" })
  @Matches(hexColorPattern, { message: "primaryColor must be a valid hex color like #884a70" })
  primaryColor!: string;

  @ApiProperty({ example: "#1e293b" })
  @Matches(hexColorPattern, { message: "secondaryColor must be a valid hex color like #1e293b" })
  secondaryColor!: string;

  @ApiProperty({ example: "https://cdn.example.com/store-logo.png", required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ example: "https://cdn.example.com/store-banner.png", required: false })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({ example: "https://cdn.example.com/storefront.png", required: false })
  @IsOptional()
  @IsString()
  storefrontImageUrl?: string;

  @ApiProperty({ example: "منتجات مختارة بعناية", required: false })
  @IsOptional()
  @IsString()
  storefrontTitle?: string;

  @ApiProperty({ example: "اكتب وصف واجهة المتجر الذي يظهر للعملاء.", required: false })
  @IsOptional()
  @IsString()
  storefrontDescription?: string;
}
