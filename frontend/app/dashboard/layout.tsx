import { getActiveTheme } from "@/lib/api";
import { ThemeStyle } from "../components/ThemeStyle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let theme = null;
  try {
    theme = await getActiveTheme();
  } catch {}

  return (
    <>
      <ThemeStyle theme={theme} />
      {children}
    </>
  );
}
