import { cookies } from "next/headers";
import { getTranslations, LOCALE_COOKIE, parseLocale, type Locale, type Translations } from "./index";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function getT(): Promise<Translations> {
  return getTranslations(await getLocale());
}
