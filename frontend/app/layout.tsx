import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import { getActiveTheme } from "@/lib/api";
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
  const theme = await loadTheme();

  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexSansArabic.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface overflow-x-hidden">
        <Script src="/nmoo-mobile-controls.js" strategy="beforeInteractive" />
        <ThemeStyle theme={theme} />
        {children}
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
