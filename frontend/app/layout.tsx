import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import { cookies } from "next/headers";
import { getActiveTheme } from "@/lib/api";
import { I18nProvider } from "@/lib/i18n/context";
import { parseLocale, localeDir, localeLang, LOCALE_COOKIE } from "@/lib/i18n";
import { ThemeStyle } from "./components/ThemeStyle";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "nmoo نمو",
  description: "منصة عربية لإطلاق وإدارة المتاجر الإلكترونية",
  icons: {
    icon: "/nmoo-logo.png",
    shortcut: "/nmoo-logo.png",
    apple: "/nmoo-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, cookieStore] = await Promise.all([loadTheme(), cookies()]);
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dir = localeDir(locale);
  const lang = localeLang(locale);

  return (
    <html lang={lang} dir={dir} className={`${ibmPlexSansArabic.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface overflow-x-hidden">
        <Script src="/nmoo-mobile-controls.js" strategy="beforeInteractive" />
        <ThemeStyle theme={theme} />
        <I18nProvider locale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

async function loadTheme() {
  try {
    return await getActiveTheme();
  } catch {
    return null;
  }
}
