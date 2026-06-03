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
      <nav className="mx-auto flex min-h-20 w-full max-w-[1180px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8" dir="ltr">
        <CartLink vendorId={vendorId} />

        <div className="flex flex-row-reverse items-center gap-2" aria-label="خيارات المتجر والحساب">
          <AccountMenu compact />
          <StoreNavLink href={profileHref ?? storeHref} active={active === "store"} logoUrl={storeLogoUrl} />
        </div>
      </nav>
    </header>
  );
}
