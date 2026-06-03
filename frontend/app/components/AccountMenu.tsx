"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { ApiUser, getMe } from "@/lib/api";

type AccountMenuProps = {
  compact?: boolean;
};

export function AccountMenu({ compact = false }: AccountMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = readCookie("nmoo_access_token");

    if (!token) {
      Promise.resolve().then(() => setIsLoading(false));
      return;
    }

    getMe(token)
      .then(setUser)
      .catch(() => {
        clearAuthCookie();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

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
    router.push("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <>
        <div className="sm:hidden">
          <MobileAccountMenu user={user} onLogout={handleLogout} />
        </div>
        <div className="hidden sm:block">
          <DesktopAccountMenu isLoading={isLoading} isOpen={isOpen} menuRef={menuRef} setIsOpen={setIsOpen} user={user} onLogout={handleLogout} compact />
        </div>
      </>
    );
  }

  return <DesktopAccountMenu isLoading={isLoading} isOpen={isOpen} menuRef={menuRef} setIsOpen={setIsOpen} user={user} onLogout={handleLogout} />;
}

function MobileAccountMenu({ user, onLogout }: { user: ApiUser | null; onLogout: () => void }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-outline-variant/45 bg-surface-container-lowest text-primary shadow-sm transition hover:bg-surface-container-low focus:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden"
        aria-label="قائمة الحساب"
      >
        <MenuIcon />
      </summary>
      <div className="fixed inset-0 z-[80] hidden h-dvh group-open:block" role="presentation">
        <button className="absolute inset-0 h-full w-full bg-black/35" type="button" aria-label="إغلاق القائمة" data-mobile-menu-close onClick={closeMenu} />
        <aside className="absolute right-0 top-0 flex h-dvh w-[84vw] max-w-80 flex-col overflow-hidden rounded-l-3xl border-l border-outline-variant/40 bg-surface-container-lowest p-4 text-right shadow-2xl" dir="rtl" role="menu">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
            <button className="icon-button border border-outline-variant bg-surface-container-lowest" type="button" aria-label="إغلاق القائمة" data-mobile-menu-close onClick={closeMenu}>
              <CloseIcon />
            </button>
            <h2 className="text-xl font-black text-on-surface">القائمة</h2>
          </div>
          <div className="grid gap-1 overflow-y-auto">
            {user ? (
              <>
                <div className="border-b border-outline-variant/20 px-3 py-3">
                  <p className="font-black text-on-surface">{user.name}</p>
                  <p className="mt-1 truncate text-xs text-on-surface-variant">{user.email}</p>
                </div>
                <MenuLink href="/orders" label="طلباتي" onClick={closeMenu} />
                <MenuLink href="/account" label="إعدادات الحساب" onClick={closeMenu} />
                {user.role === "BUYER" ? <MenuLink href="/account/address" label="عنوان الشحن" onClick={closeMenu} /> : null}
                {user.role !== "BUYER" ? <MenuLink href="/dashboard" label="لوحة التحكم" onClick={closeMenu} /> : null}
                {user.role === "VENDOR" ? <MenuLink href={user.storeUsername ? `/${user.storeUsername}` : `/vendors/${user.id}`} label="المتجر" onClick={closeMenu} /> : null}
                <button className="mt-2 w-full rounded-lg px-3 py-3 text-right font-bold text-error hover:bg-error-container/50" type="button" role="menuitem" onClick={onLogout}>
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <MenuLink href="/login" label="تسجيل الدخول" onClick={closeMenu} />
                <MenuLink href="/register" label="إنشاء حساب" onClick={closeMenu} />
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
            aria-label="قائمة الحساب"
            aria-expanded={isOpen}
            aria-haspopup="menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            <MenuIcon />
          </button>

          {isOpen ? (
            <div className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-2 text-right shadow-xl" role="menu">
              <MenuLink href="/login" label="تسجيل الدخول" onClick={() => setIsOpen(false)} />
              <MenuLink href="/register" label="إنشاء حساب" onClick={() => setIsOpen(false)} />
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="hidden rounded-full px-4 py-3 text-sm font-bold text-primary hover:bg-primary-container/25 sm:block">
          تسجيل الدخول
        </Link>
        <Link href="/register" className="primary-button px-4 py-3 text-sm">
          ابدأ مجانا
        </Link>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        className={`${compact ? "h-11 w-11 justify-center rounded-full p-0" : "gap-2 rounded-xl px-3 py-2"} flex items-center border border-outline-variant/45 bg-surface-container-lowest text-right shadow-sm transition hover:bg-surface-container-low`}
        type="button"
        aria-label={`${user.name} - ${formatRole(user.role)}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((value) => !value)}
      >
        {compact ? (
          <MenuIcon />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container font-black text-on-primary-container">
            {user.name.trim()[0] ?? "ن"}
          </span>
        )}
        {!compact ? (
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-28 truncate text-sm font-bold text-on-surface">{user.name}</span>
            <span className="block text-xs text-on-surface-variant">{formatRole(user.role)}</span>
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-2 text-right shadow-xl" role="menu">
          <div className="border-b border-outline-variant/20 px-3 py-3">
            <p className="font-black text-on-surface">{user.name}</p>
            <p className="mt-1 truncate text-xs text-on-surface-variant">{user.email}</p>
          </div>
          <MenuLink href="/orders" label="طلباتي" onClick={() => setIsOpen(false)} />
          <MenuLink href="/account" label="إعدادات الحساب" onClick={() => setIsOpen(false)} />
          {user.role === "BUYER" ? <MenuLink href="/account/address" label="عنوان الشحن" onClick={() => setIsOpen(false)} /> : null}
          {user.role !== "BUYER" ? <MenuLink href="/dashboard" label="لوحة التحكم" onClick={() => setIsOpen(false)} /> : null}
          {user.role === "VENDOR" ? <MenuLink href={user.storeUsername ? `/${user.storeUsername}` : `/vendors/${user.id}`} label="المتجر" onClick={() => setIsOpen(false)} /> : null}
          <button className="mt-2 w-full rounded-lg px-3 py-3 text-right font-bold text-error hover:bg-error-container/50" type="button" role="menuitem" onClick={onLogout}>
            تسجيل الخروج
          </button>
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

function formatRole(role: ApiUser["role"]) {
  if (role === "ADMIN") {
    return "مدير";
  }

  if (role === "VENDOR") {
    return "تاجر";
  }

  return "عميل";
}
