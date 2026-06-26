import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional, IsString, Matches } from "class-validator";

const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

export class UpdateThemeDto {
  @ApiProperty({ example: "#884a70" })
  @Matches(hexColorPattern, { message: "primaryColor must be a valid hex color like #884a70" })
  primaryColor!: string;

  @ApiProperty({ example: "#1e293b" })
  @Matches(hexColorPattern, { message: "secondaryColor must be a valid hex color like #1e293b" })
  secondaryColor!: string;

  @ApiProperty({ example: "#1e293b" })
  @Matches(hexColorPattern, { message: "textColor must be a valid hex color like #1e293b" })
  textColor!: string;

  @ApiProperty({ example: "متجر نمو", required: false })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storeNameAr?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storeNameEn?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storefrontTitleAr?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storefrontTitleEn?: string;

  @ApiProperty({ example: "اكتب وصف واجهة المتجر الذي يظهر للعملاء.", required: false })
  @IsOptional()
  @IsString()
  storefrontDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storefrontDescriptionAr?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storefrontDescriptionEn?: string;

  @ApiProperty({ example: "classic", enum: ["classic", "boutique", "gallery", "minimal", "market"], required: false })
  @IsOptional()
  @IsString()
  @IsIn(["classic", "boutique", "gallery", "minimal", "market"])
  templateId?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  cashOnDeliveryEnabled?: boolean;

  @ApiProperty({ example: "https://wa.me/966500000000", required: false })
  @IsOptional()
  @IsString()
  whatsappUrl?: string;

  @ApiProperty({ example: "https://instagram.com/nmoo", required: false })
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @ApiProperty({ example: "https://tiktok.com/@nmoo", required: false })
  @IsOptional()
  @IsString()
  tiktokUrl?: string;

  @ApiProperty({ example: "https://line.me/R/ti/p/@nmoo", required: false })
  @IsOptional()
  @IsString()
  lineUrl?: string;

  @ApiProperty({ example: "https://t.me/nmoo", required: false })
  @IsOptional()
  @IsString()
  telegramUrl?: string;

  @ApiProperty({ example: "https://x.com/nmoo", required: false })
  @IsOptional()
  @IsString()
  xUrl?: string;

  @ApiProperty({ example: "https://snapchat.com/add/nmoo", required: false })
  @IsOptional()
  @IsString()
  snapchatUrl?: string;

  @ApiProperty({ example: "https://youtube.com/@nmoo", required: false })
  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @ApiProperty({ example: "support@nmoo.sa", required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ example: "https://nmoo.sa", required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;
}
