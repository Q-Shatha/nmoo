import type { Translations } from "./types";
import ar from "./translations/ar";
import en from "./translations/en";

export type { Translations };
export type Locale = "ar" | "en";
export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "nmoo_lang";

const translations: Record<Locale, Translations> = { ar, en };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function parseLocale(cookieValue: string | undefined): Locale {
  return cookieValue === "en" ? "en" : "ar";
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function localeLang(locale: Locale): string {
  return locale === "ar" ? "ar" : "en";
}
