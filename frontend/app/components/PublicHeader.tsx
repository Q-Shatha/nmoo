import { AccountMenu } from "./AccountMenu";
import { CartLink } from "./CartLink";
import { StoreNavLink } from "./StoreNavLink";

type PublicHeaderProps = {
  active?: "home" | "store";
  storeHref?: string;
  profileHref?: string;
  vendorId?: string;
  storeLogoUrl?: string | null;
  storeName?: string | null;
  hideCart?: boolean;
};

export function PublicHeader({ active, storeHref, profileHref, vendorId, storeLogoUrl, storeName, hideCart = false }: PublicHeaderProps) {
  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-outline-variant/25 bg-surface-container-lowest/95 backdrop-blur-xl">
      <nav className="mx-auto grid min-h-24 w-full max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6 lg:px-8" dir="ltr">
        <div className="justify-self-start">{hideCart ? <span aria-hidden="true" /> : <CartLink vendorId={vendorId} />}</div>

        <div className="justify-self-center">
          <StoreNavLink href={profileHref ?? storeHref} active={active === "store"} logoUrl={storeLogoUrl} label={storeName} />
        </div>

        <div className="flex items-center justify-end gap-2 justify-self-end" aria-label="خيارات الحساب">
          <AccountMenu compact />
        </div>
      </nav>
    </header>
  );
}
