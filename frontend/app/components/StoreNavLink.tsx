"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getVendorTheme } from "@/lib/api";
import { readCart, subscribeToCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/context";

type StoreNavLinkProps = {
  active: boolean;
  href?: string;
  logoUrl?: string | null;
  label?: string | null;
};

export function StoreNavLink({ active, href, logoUrl, label }: StoreNavLinkProps) {
  const { t } = useI18n();
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
      className={`group flex min-w-20 flex-col items-center justify-center gap-1 text-center transition ${
        active ? "text-primary" : "text-on-surface hover:text-primary"
      }`}
      href={resolvedHref}
      aria-label={t.storeNavLabel}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-surface-container-lowest transition group-hover:border-primary ${
          active ? "border-primary bg-primary-container/35 shadow-sm" : "border-outline-variant/40"
        }`}
      >
        {resolvedLogoUrl ? <Image className="h-full w-full object-cover" alt={t.storeNavIconAlt} src={resolvedLogoUrl} width={48} height={48} unoptimized /> : <StoreIcon />}
      </span>
      {label ? <span className="max-w-28 truncate text-xs font-black leading-4">{label}</span> : null}
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
