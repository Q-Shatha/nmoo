"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getVendorTheme } from "@/lib/api";
import { readCart, subscribeToCart } from "@/lib/cart";

type StoreNavLinkProps = {
  active: boolean;
  href?: string;
  logoUrl?: string | null;
};

export function StoreNavLink({ active, href, logoUrl }: StoreNavLinkProps) {
  const [resolvedHref, setResolvedHref] = useState(href ?? "/");
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string | null>(logoUrl ?? null);

  useEffect(() => {
    if (href || logoUrl) {
      setResolvedHref(href ?? "/");
      setResolvedLogoUrl(logoUrl ?? null);
      return;
    }

    let ignore = false;

    async function syncFromCart() {
      const firstItem = readCart()[0];

      if (!firstItem?.vendorId) {
        setResolvedHref("/");
        setResolvedLogoUrl(null);
        return;
      }

      setResolvedHref(firstItem.vendorUsername ? `/${firstItem.vendorUsername}` : `/vendors/${firstItem.vendorId}`);

      try {
        const theme = await getVendorTheme(firstItem.vendorId);
        if (!ignore) {
          setResolvedLogoUrl(theme.logoUrl ?? null);
        }
      } catch {
        if (!ignore) {
          setResolvedLogoUrl(null);
        }
      }
    }

    syncFromCart();
    const unsubscribe = subscribeToCart(syncFromCart);

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [href, logoUrl]);

  return (
    <Link
      className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition ${
        active ? "border-primary bg-primary-container/35 shadow-sm" : "border-transparent text-primary hover:bg-primary-container/30"
      }`}
      href={resolvedHref}
      aria-label="بروفايل التاجر"
    >
      {resolvedLogoUrl ? <Image className="h-full w-full object-cover" alt="أيقونة التاجر" src={resolvedLogoUrl} width={44} height={44} unoptimized /> : <StoreIcon />}
    </Link>
  );
}

function StoreIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 10h16" />
      <path d="M5 10l1-5h12l1 5" />
      <path d="M6 10v9h12v-9" />
      <path d="M9 19v-5h6v5" />
    </svg>
  );
}
