import { Injectable } from "@nestjs/common";
import { UserRole, VendorTheme } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { ProductAssetsService } from "../products/product-assets.service";
import { UpdateThemeDto } from "./dto/update-theme.dto";

const defaultTheme = {
  primaryColor: "#884a70",
  secondaryColor: "#1e293b",
  logoUrl: null,
  bannerUrl: null,
  storefrontImageUrl: null,
  storefrontTitle: null,
  storefrontDescription: null,
  whatsappUrl: null,
  instagramUrl: null,
  tiktokUrl: null,
  lineUrl: null,
  telegramUrl: null,
  xUrl: null,
  snapchatUrl: null,
  youtubeUrl: null,
  contactEmail: null,
  websiteUrl: null,
};

@Injectable()
export class ThemesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productAssetsService: ProductAssetsService,
  ) {}

  async findActive() {
    const theme = await this.prisma.vendorTheme.findFirst({
      orderBy: { updatedAt: "desc" },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            storeUsername: true,
            role: true,
          },
        },
      },
    });

    return this.serializeTheme(theme ?? defaultTheme);
  }

  async findMine(user: AuthenticatedUser) {
    const theme = await this.prisma.vendorTheme.upsert({
      where: { vendorId: user.id },
      update: {},
      create: {
        vendorId: user.id,
        ...defaultTheme,
      },
    });

    return this.serializeTheme(theme);
  }

  async findVendorTheme(vendorId: string) {
    const theme = await this.prisma.vendorTheme.findUnique({
      where: { vendorId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            storeUsername: true,
            role: true,
          },
        },
      },
    });

    return this.serializeTheme(theme ?? { vendorId, ...defaultTheme });
  }

  async updateMine(dto: UpdateThemeDto, user: AuthenticatedUser) {
    const theme = await this.prisma.vendorTheme.upsert({
      where: { vendorId: user.id },
      update: {
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        logoUrl: normalizeOptionalUrl(dto.logoUrl),
        bannerUrl: normalizeOptionalUrl(dto.bannerUrl),
        storefrontImageUrl: normalizeOptionalUrl(dto.storefrontImageUrl),
        storefrontTitle: normalizeOptionalText(dto.storefrontTitle),
        storefrontDescription: normalizeOptionalText(dto.storefrontDescription),
        whatsappUrl: normalizeOptionalUrl(dto.whatsappUrl),
        instagramUrl: normalizeOptionalUrl(dto.instagramUrl),
        tiktokUrl: normalizeOptionalUrl(dto.tiktokUrl),
        lineUrl: normalizeOptionalUrl(dto.lineUrl),
        telegramUrl: normalizeOptionalUrl(dto.telegramUrl),
        xUrl: normalizeOptionalUrl(dto.xUrl),
        snapchatUrl: normalizeOptionalUrl(dto.snapchatUrl),
        youtubeUrl: normalizeOptionalUrl(dto.youtubeUrl),
        contactEmail: normalizeOptionalText(dto.contactEmail),
        websiteUrl: normalizeOptionalUrl(dto.websiteUrl),
      },
      create: {
        vendorId: user.id,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        logoUrl: normalizeOptionalUrl(dto.logoUrl),
        bannerUrl: normalizeOptionalUrl(dto.bannerUrl),
        storefrontImageUrl: normalizeOptionalUrl(dto.storefrontImageUrl),
        storefrontTitle: normalizeOptionalText(dto.storefrontTitle),
        storefrontDescription: normalizeOptionalText(dto.storefrontDescription),
        whatsappUrl: normalizeOptionalUrl(dto.whatsappUrl),
        instagramUrl: normalizeOptionalUrl(dto.instagramUrl),
        tiktokUrl: normalizeOptionalUrl(dto.tiktokUrl),
        lineUrl: normalizeOptionalUrl(dto.lineUrl),
        telegramUrl: normalizeOptionalUrl(dto.telegramUrl),
        xUrl: normalizeOptionalUrl(dto.xUrl),
        snapchatUrl: normalizeOptionalUrl(dto.snapchatUrl),
        youtubeUrl: normalizeOptionalUrl(dto.youtubeUrl),
        contactEmail: normalizeOptionalText(dto.contactEmail),
        websiteUrl: normalizeOptionalUrl(dto.websiteUrl),
      },
    });

    return this.serializeTheme(theme);
  }

  async serializeTheme(theme: Partial<VendorTheme> & { vendor?: { id: string; name: string; email: string; storeUsername: string | null; role: UserRole } }) {
    const primaryColor = theme.primaryColor ?? defaultTheme.primaryColor;
    const secondaryColor = theme.secondaryColor ?? defaultTheme.secondaryColor;
    const primaryContainer = mixWithWhite(primaryColor, 0.64);
    const secondaryContainer = mixWithWhite(secondaryColor, 0.16);
    const [logoUrl, bannerUrl, storefrontImageUrl] = await Promise.all([
      this.productAssetsService.resolveAssetUrl(theme.logoUrl),
      this.productAssetsService.resolveAssetUrl(theme.bannerUrl),
      this.productAssetsService.resolveAssetUrl(theme.storefrontImageUrl),
    ]);

    return {
      id: theme.id,
      vendorId: theme.vendorId,
      vendor: theme.vendor,
      primaryColor,
      secondaryColor,
      logoUrl,
      bannerUrl,
      storefrontImageUrl,
      storefrontTitle: theme.storefrontTitle ?? defaultTheme.storefrontTitle,
      storefrontDescription: theme.storefrontDescription ?? defaultTheme.storefrontDescription,
      whatsappUrl: theme.whatsappUrl ?? defaultTheme.whatsappUrl,
      instagramUrl: theme.instagramUrl ?? defaultTheme.instagramUrl,
      tiktokUrl: theme.tiktokUrl ?? defaultTheme.tiktokUrl,
      lineUrl: theme.lineUrl ?? defaultTheme.lineUrl,
      telegramUrl: theme.telegramUrl ?? defaultTheme.telegramUrl,
      xUrl: theme.xUrl ?? defaultTheme.xUrl,
      snapchatUrl: theme.snapchatUrl ?? defaultTheme.snapchatUrl,
      youtubeUrl: theme.youtubeUrl ?? defaultTheme.youtubeUrl,
      contactEmail: theme.contactEmail ?? defaultTheme.contactEmail,
      websiteUrl: theme.websiteUrl ?? defaultTheme.websiteUrl,
      tokens: {
        primary: primaryColor,
        onPrimary: readableTextColor(primaryColor),
        primaryContainer,
        onPrimaryContainer: readableTextColor(primaryContainer),
        primaryFixed: mixWithWhite(primaryColor, 0.78),
        primaryFixedDim: mixWithWhite(primaryColor, 0.52),
        onPrimaryFixed: readableTextColor(mixWithWhite(primaryColor, 0.78)),
        onPrimaryFixedVariant: readableTextColor(mixWithWhite(primaryColor, 0.52)),
        secondary: secondaryColor,
        onSecondary: readableTextColor(secondaryColor),
        secondaryContainer,
        onSecondaryContainer: readableTextColor(secondaryContainer),
        secondaryFixed: secondaryColor,
        secondaryFixedDim: secondaryColor,
        onSecondaryFixed: readableTextColor(secondaryColor),
        onSecondaryFixedVariant: readableTextColor(secondaryColor),
        inversePrimary: mixWithWhite(primaryColor, 0.5),
        surfaceTint: primaryColor,
      },
    };
  }
}

function normalizeOptionalUrl(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalText(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function readableTextColor(background: string) {
  return contrastRatio(background, "#ffffff") >= 4.5 ? "#ffffff" : "#111827";
}

function contrastRatio(first: string, second: string) {
  const firstLum = relativeLuminance(hexToRgb(first));
  const secondLum = relativeLuminance(hexToRgb(second));
  const lighter = Math.max(firstLum, secondLum);
  const darker = Math.min(firstLum, secondLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexToRgb(hex: string): [number, number, number] {
  return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}

function mixWithWhite(hex: string, whiteAmount: number) {
  const [r, g, b] = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel * (1 - whiteAmount) + 255 * whiteAmount);
  return rgbToHex(mix(r), mix(g), mix(b));
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
