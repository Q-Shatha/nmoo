import { AccountMenu } from "./AccountMenu";
import { CartLink } from "./CartLink";
import { StoreNavLink } from "./StoreNavLink";

type PublicHeaderProps = {
  active?: "home" | "store";
  storeHref?: string;
  profileHref?: string;
  vendorId?: string;
  storeLogoUrl?: string | null;
};

export function PublicHeader({ active, storeHref, profileHref, vendorId, storeLogoUrl }: PublicHeaderProps) {
  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-outline-variant/25 bg-surface-container-lowest/95 backdrop-blur-xl">
      <nav className="app-container flex min-h-20 items-center justify-end py-3" dir="ltr">
        <div className="flex flex-row-reverse items-center gap-2" aria-label="خيارات المتجر والحساب">
          <AccountMenu compact />
          <StoreNavLink href={profileHref ?? storeHref} active={active === "store"} logoUrl={storeLogoUrl} />
          <CartLink vendorId={vendorId} />
        </div>
      </nav>
    </header>
  );
}
