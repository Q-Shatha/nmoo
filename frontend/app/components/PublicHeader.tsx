import { cookies } from "next/headers";
import { ApiError, ApiUser, getMe } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { AccountMenu } from "./AccountMenu";
import { CartLink } from "./CartLink";
import { StoreNavLink } from "./StoreNavLink";
import { LangSwitcher } from "./LangSwitcher";

type PublicHeaderProps = {
  active?: "home" | "store";
  storeHref?: string;
  profileHref?: string;
  vendorId?: string;
  storeLogoUrl?: string | null;
  storeName?: string | null;
  hideCart?: boolean;
  hideLogo?: boolean;
};

export async function PublicHeader({ active, storeHref, profileHref, vendorId, storeLogoUrl, storeName, hideCart = false, hideLogo = false }: PublicHeaderProps) {
  const [user, t] = await Promise.all([loadHeaderUser(), getT()]);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-outline-variant/25 bg-surface-container-lowest/95 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-24 w-full max-w-[1180px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8" dir="rtl">
        <div className="flex items-center gap-2" aria-label={t.accountOptionsLabel}>
          <AccountMenu compact initialUser={user} />
          <div className="hidden sm:block"><LangSwitcher /></div>
        </div>

        {active !== "home" && !hideLogo && (
          <StoreNavLink href={profileHref ?? storeHref} active={active === "store"} logoUrl={storeLogoUrl} label={storeName} />
        )}

        <div dir="ltr">{hideCart || active === "home" ? <span aria-hidden="true" /> : <CartLink vendorId={vendorId} />}</div>
      </nav>
    </header>
  );
}

async function loadHeaderUser(): Promise<ApiUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return null;
  }

  try {
    return await getMe(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    return null;
  }
}
