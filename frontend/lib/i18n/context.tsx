"use client";
import { createContext, useContext, ReactNode } from "react";
import { type Locale, type Translations, getTranslations } from "./index";

type I18nContextValue = { locale: Locale; t: Translations };
const I18nContext = createContext<I18nContextValue>({ locale: "ar", t: getTranslations("ar") });

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, t: getTranslations(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
