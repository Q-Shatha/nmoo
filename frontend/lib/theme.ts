import { VendorTheme } from "./api";
import type { CSSProperties } from "react";

type ThemeSource = Pick<VendorTheme, "primaryColor" | "secondaryColor"> & {
  textColor?: string | null;
  tokens?: Partial<VendorTheme["tokens"]>;
};

const tokenToCssVariable: Record<keyof VendorTheme["tokens"], string> = {
  primary: "--color-primary",
  onPrimary: "--color-on-primary",
  primaryContainer: "--color-primary-container",
  onPrimaryContainer: "--color-on-primary-container",
  primaryFixed: "--color-primary-fixed",
  primaryFixedDim: "--color-primary-fixed-dim",
  onPrimaryFixed: "--color-on-primary-fixed",
  onPrimaryFixedVariant: "--color-on-primary-fixed-variant",
  secondary: "--color-secondary",
  onSecondary: "--color-on-secondary",
  secondaryContainer: "--color-secondary-container",
  onSecondaryContainer: "--color-on-secondary-container",
  secondaryFixed: "--color-secondary-fixed",
  secondaryFixedDim: "--color-secondary-fixed-dim",
  onSecondaryFixed: "--color-on-secondary-fixed",
  onSecondaryFixedVariant: "--color-on-secondary-fixed-variant",
  inversePrimary: "--color-inverse-primary",
  surfaceTint: "--color-surface-tint",
};

export function themeToCss(theme: ThemeSource) {
  return Object.entries(getThemeVariables(theme))
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");
}

export function applyThemeTokens(theme: ThemeSource) {
  Object.entries(getThemeVariables(theme)).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

export function themeToStyle(theme: ThemeSource): CSSProperties {
  return getThemeVariables(theme) as CSSProperties;
}

function getThemeVariables(theme: ThemeSource) {
  const tokens = createThemeTokens(theme);
  const tokenVariables = Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [tokenToCssVariable[key as keyof VendorTheme["tokens"]], value]),
  );
  const primary = theme.primaryColor;
  const secondary = theme.secondaryColor;
  const text = theme.textColor || secondary;

  return {
    ...tokenVariables,
    "--color-text": text,
    "--color-background": mixWithWhite(primary, 0.97),
    "--color-surface": mixWithWhite(primary, 0.97),
    "--color-surface-container-lowest": mixWithWhite(primary, 0.99),
    "--color-surface-container-low": mixWithWhite(primary, 0.93),
    "--color-surface-container": mixWithWhite(primary, 0.89),
    "--color-surface-container-high": mixWithWhite(primary, 0.84),
    "--color-surface-container-highest": mixWithWhite(primary, 0.78),
    "--color-surface-variant": mixWithWhite(primary, 0.86),
    "--color-outline": mixWithWhite(secondary, 0.42),
    "--color-outline-variant": mixWithWhite(primary, 0.72),
    "--color-on-background": text,
    "--color-on-surface": text,
    "--color-on-surface-variant": mixWithWhite(text, 0.28),
    "--color-inverse-surface": secondary,
    "--color-inverse-on-surface": readableTextColor(secondary),
  };
}

function createThemeTokens(theme: ThemeSource): VendorTheme["tokens"] {
  const primary = theme.primaryColor;
  const secondary = theme.secondaryColor;
  const tokens: VendorTheme["tokens"] = {
    primary,
    onPrimary: readableTextColor(primary),
    primaryContainer: mixWithWhite(primary, 0.82),
    onPrimaryContainer: readableTextColor(mixWithWhite(primary, 0.82)),
    primaryFixed: mixWithWhite(primary, 0.76),
    primaryFixedDim: mixWithWhite(primary, 0.66),
    onPrimaryFixed: readableTextColor(mixWithWhite(primary, 0.76)),
    onPrimaryFixedVariant: secondary,
    secondary,
    onSecondary: readableTextColor(secondary),
    secondaryContainer: mixWithWhite(secondary, 0.84),
    onSecondaryContainer: readableTextColor(mixWithWhite(secondary, 0.84)),
    secondaryFixed: mixWithWhite(secondary, 0.78),
    secondaryFixedDim: mixWithWhite(secondary, 0.68),
    onSecondaryFixed: readableTextColor(mixWithWhite(secondary, 0.78)),
    onSecondaryFixedVariant: primary,
    inversePrimary: mixWithWhite(primary, 0.36),
    surfaceTint: primary,
  };

  return {
    ...tokens,
    ...theme.tokens,
  };
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
