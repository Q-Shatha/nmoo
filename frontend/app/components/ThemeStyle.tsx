import { VendorTheme } from "@/lib/api";
import { themeToCss } from "@/lib/theme";

export function ThemeStyle({ theme }: { theme?: VendorTheme | null }) {
  if (!theme) {
    return null;
  }

  return <style id="vendor-theme" dangerouslySetInnerHTML={{ __html: `:root {\n${themeToCss(theme)}\n}` }} />;
}
