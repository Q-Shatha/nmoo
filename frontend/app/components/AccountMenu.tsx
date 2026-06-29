"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { ApiError, ApiUser, getMe } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { LOCALE_COOKIE } from "@/lib/i18n";

type AccountMenuProps = {
  compact?: boolean;
  initialUser?: ApiUser | null;
};

export function AccountMenu({ compact = false, initialUser = null }: AccountMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<ApiUser | null>(initialUser);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsLoading(false);
      return;
    }

    const token = readCookie("nmoo_access_token");
    if (!token) {
      Promise.resolve().then(() => setIsLoading(false));
      return;
    }

    getMe(token)
      .then(setUser)
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthCookie();
          setUser(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, [initialUser]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleLogout() {
    clearAuthCookie();
    setUser(null);
    setIsOpen(false);
    window.location.assign("/logout");
  }

  if (compact) {
    return (
      <>
        <div className="sm:hidden">
          <MobileAccountMenu isLoading={isLoading} user={user} onLogout={handleLogout} />
        </div>
        <div className="hidden sm:block">
          <DesktopAccountMenu compact isLoading={isLoading} isOpen={isOpen} menuRef={menuRef} setIsOpen={setIsOpen} user={user} onLogout={handleLogout} />
        </div>
      </>
    );
  }

  return <DesktopAccountMenu isLoading={isLoading} isOpen={isOpen} menuRef={menuRef} setIsOpen={setIsOpen} user={user} onLogout={handleLogout} />;
}

function MobileAccountMenu({ isLoading, user, onLogout }: { isLoading: boolean; user: ApiUser | null; onLogout: () => void }) {
  const { t: tMobile, locale } = useI18n();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }

  return (
    <details ref={detailsRef} className="group relative" suppressHydrationWarning>
      <summary
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-outline-variant/45 bg-surface-container-lowest text-primary shadow-sm transition hover:bg-surface-container-low focus:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden"
        aria-label={tMobile.accountMenuLabel}
      >
        <MenuIcon />
      </summary>
      <div className="fixed inset-0 z-[80] hidden h-dvh group-open:block" role="presentation">
        <button className="absolute inset-0 h-full w-full bg-black/35" type="button" aria-label={tMobile.closeMenu} data-mobile-menu-close onClick={closeMenu} />
        <aside className="absolute right-0 top-0 flex h-dvh w-[84vw] max-w-80 flex-col overflow-hidden rounded-l-3xl border-l border-outline-variant/40 bg-surface-container-lowest p-4 text-start shadow-2xl" role="menu">
          <div className="mb-3 flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <button className="icon-button border border-outline-variant bg-surface-container-lowest" type="button" aria-label={tMobile.closeMenu} data-mobile-menu-close onClick={closeMenu}>
              <CloseIcon />
            </button>
          </div>
          <LangSwitcherAccordion locale={locale} />
          <div className="grid gap-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid gap-3 px-3 py-3">
                <div className="h-12 w-full animate-pulse rounded-xl bg-surface-container-low" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-surface-container-low" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-surface-container-low" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 border-b border-outline-variant/20 px-3 py-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-sm font-black text-on-primary-container">
                    {user.avatarUrl ? <Image alt={displayName(user, locale)} className="object-cover" src={user.avatarUrl} fill sizes="48px" unoptimized /> : displayName(user, locale).trim()[0] ?? "ن"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-on-surface">{displayName(user, locale)}</p>
                    <p className="mt-1 truncate text-xs text-on-surface-variant">{user.email}</p>
                  </div>
                </div>
                <MenuLink href="/orders" label={tMobile.myOrdersLink} onClick={closeMenu} />
                <MenuLink href="/account" label={tMobile.accountSettings} onClick={closeMenu} />
                {user.role === "BUYER" ? <MenuLink href="/account/address" label={tMobile.shippingAddress} onClick={closeMenu} /> : null}
                {user.role !== "BUYER" ? <MenuLink href="/dashboard" label={tMobile.dashboard} onClick={closeMenu} /> : null}
                {user.role === "VENDOR" ? <MenuLink href={user.storeUsername ? `/${user.storeUsername}` : `/vendors/${user.id}`} label={tMobile.storeLink} onClick={closeMenu} /> : null}
                <LogoutLink onLogout={onLogout} t={tMobile} />
              </>
            ) : (
              <>
                <MenuLink href="/login" label={tMobile.loginLink} onClick={closeMenu} />
                <MenuLink href="/register" label={tMobile.registerLink} onClick={closeMenu} />
              </>
            )}
          </div>
        </aside>
      </div>
    </details>
  );
}

function DesktopAccountMenu({
  compact = false,
  isLoading,
  isOpen,
  menuRef,
  setIsOpen,
  user,
  onLogout,
}: {
  compact?: boolean;
  isLoading: boolean;
  isOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  user: ApiUser | null;
  onLogout: () => void;
}) {
  const { t, locale } = useI18n();

  if (isLoading) {
    return <div className="h-11 w-11 animate-pulse rounded-full bg-surface-container-low" aria-hidden="true" />;
  }

  if (!user) {
    if (compact) {
      return (
        <div ref={menuRef} className="relative">
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/45 bg-surface-container-lowest text-primary shadow-sm transition hover:bg-surface-container-low"
            type="button"
            aria-label={t.accountMenuLabel}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            <MenuIcon />
          </button>

          {isOpen ? (
            <div className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-2 text-start shadow-xl" role="menu">
              <MenuLink href="/login" label={t.loginLink} onClick={() => setIsOpen(false)} />
              <MenuLink href="/register" label={t.registerLink} onClick={() => setIsOpen(false)} />
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="hidden rounded-full px-4 py-3 text-sm font-bold text-primary hover:bg-primary-container/25 sm:block">
          {t.loginLink}
        </Link>
        <Link href="/register" className="primary-button px-4 py-3 text-sm">
          {t.startFree}
        </Link>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        className={`${compact ? "h-11 w-11 justify-center rounded-full p-0" : "gap-2 rounded-xl px-3 py-2"} flex items-center border border-outline-variant/45 bg-surface-container-lowest text-start shadow-sm transition hover:bg-surface-container-low`}
        type="button"
        aria-label={`${displayName(user, locale)} - ${formatRole(user.role, t)}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((value) => !value)}
      >
        {compact ? (
          <MenuIcon />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container font-black text-on-primary-container">
            {displayName(user, locale).trim()[0] ?? "?"}
          </span>
        )}
        {!compact ? (
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-28 truncate text-sm font-bold text-on-surface">{displayName(user, locale)}</span>
            <span className="block text-xs text-on-surface-variant">{formatRole(user.role, t)}</span>
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-2 text-start shadow-xl" role="menu">
          <div className="border-b border-outline-variant/20 px-3 py-3">
            <p className="font-black text-on-surface">{displayName(user, locale)}</p>
            <p className="mt-1 truncate text-xs text-on-surface-variant">{user.email}</p>
          </div>
          <MenuLink href="/orders" label={t.myOrdersLink} onClick={() => setIsOpen(false)} />
          <MenuLink href="/account" label={t.accountSettings} onClick={() => setIsOpen(false)} />
          {user.role === "BUYER" ? <MenuLink href="/account/address" label={t.shippingAddress} onClick={() => setIsOpen(false)} /> : null}
          {user.role !== "BUYER" ? <MenuLink href="/dashboard" label={t.dashboard} onClick={() => setIsOpen(false)} /> : null}
          {user.role === "VENDOR" ? <MenuLink href={user.storeUsername ? `/${user.storeUsername}` : `/vendors/${user.id}`} label={t.storeLink} onClick={() => setIsOpen(false)} /> : null}
          <LogoutLink onLogout={onLogout} t={t} />
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link className="block rounded-lg px-3 py-3 font-bold text-on-surface hover:bg-surface-container-low" href={href} role="menuitem" onClick={onClick}>
      {label}
    </Link>
  );
}

const LANGUAGES = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

function LangSwitcherAccordion({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  function switchLang(code: string) {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }
  const current = LANGUAGES.find((l) => l.code === locale);
  return (
    <div className="border-b border-outline-variant/20 pb-2 mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 hover:bg-surface-container-low"
      >
        <span className="flex items-center gap-2 font-bold text-on-surface">
          <span>{current?.flag}</span>
          <span>{current?.label}</span>
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </button>
      {open && (
        <div className="mt-1 grid gap-1 px-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => switchLang(lang.code)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition hover:bg-surface-container-low ${
                locale === lang.code ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {locale === lang.code && <span className="ms-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LogoutLink({ onLogout, t }: { onLogout: () => void; t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <a className="mt-2 block w-full rounded-lg px-3 py-3 text-start font-bold text-error hover:bg-error-container/50" href="/logout" role="menuitem" data-mobile-logout onClick={onLogout}>
      {t.logout}
    </a>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="pointer-events-none h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="pointer-events-none h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}

function clearAuthCookie() {
  document.cookie = "nmoo_access_token=; path=/; max-age=0; samesite=lax";
}

function displayName(user: ApiUser, locale?: string) {
  if (user.role === "VENDOR") {
    const theme = user.theme;
    if (theme) {
      if (locale === "ar" && theme.storeNameAr) return theme.storeNameAr;
      if (locale === "en" && theme.storeNameEn) return theme.storeNameEn;
      if (theme.storeName) return theme.storeName;
    }
  }
  return user.name;
}

function formatRole(role: ApiUser["role"], t: ReturnType<typeof useI18n>["t"]) {
  if (role === "ADMIN") {
    return t.roleAdmin;
  }

  if (role === "VENDOR") {
    return t.roleVendor;
  }

  return t.roleBuyer;
}
