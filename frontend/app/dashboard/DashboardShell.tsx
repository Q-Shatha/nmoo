import Link from "next/link";
import { ReactNode } from "react";
import { VendorTheme } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";

type DashboardShellProps = {
  active: "overview" | "orders" | "products" | "shipping" | "discounts" | "reviews" | "analytics" | "settings";
  title: string;
  description: string;
  userName?: string;
  logoUrl?: string | null;
  storeHref?: string;
  children: ReactNode;
};

export async function DashboardShell({ active, title, description, logoUrl, storeHref, children }: DashboardShellProps) {
  const t = await getT();
  const navItems = [
    { key: "overview" as const, label: t.overview, icon: "□", href: "/dashboard" },
    { key: "orders" as const, label: t.orders, icon: "▤", href: "/dashboard/orders" },
    { key: "products" as const, label: t.products, icon: "▣", href: "/dashboard/products" },
    { key: "shipping" as const, label: t.shipping, icon: "⇄", href: "/dashboard/shipping" },
    { key: "discounts" as const, label: t.discounts, icon: "%", href: "/dashboard/discounts" },
    { key: "reviews" as const, label: t.reviews, icon: "★", href: "/dashboard/reviews" },
    { key: "analytics" as const, label: t.analytics, icon: "↗", href: "/dashboard/analytics" },
    { key: "settings" as const, label: t.settings, icon: "⚙", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-on-surface">
      <PublicHeader active="store" storeHref={storeHref} storeLogoUrl={logoUrl} hideCart />
      <main className="min-h-screen min-w-0 max-w-full overflow-x-hidden">
        <DashboardHeader title={title} description={description} />
        <DashboardNav active={active} navItems={navItems} addProductLabel={t.addProduct} />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 pb-24 md:gap-6 md:p-8">
          {children}
        </div>
        <PublicFooter />
      </main>
    </div>
  );
}

export async function DashboardUnavailable({
  title,
  description,
  message,
  needsLogin = false,
}: {
  title?: string;
  description?: string;
  message?: string;
  needsLogin?: boolean;
}) {
  const t = await getT();
  const resolvedMessage =
    message === "VENDOR_ONLY"
      ? t.dashboardVendorOnly
      : message === "LOAD_ERROR"
        ? t.dashboardLoadError
        : message;
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <div className="w-full rounded-3xl border border-outline-variant bg-surface px-10 py-12 text-center shadow-soft">
        <h1 className="text-2xl font-black leading-relaxed text-primary">
          {title ?? (needsLogin ? t.needsLoginTitle : t.dashboardUnavailableTitle)}
        </h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          {description ?? resolvedMessage ?? t.dashboardUnavailableDesc}
        </p>
        <Link
          href={needsLogin ? "/login" : "/dashboard"}
          className="mt-8 block rounded-2xl bg-primary px-6 py-4 text-center text-base font-bold text-white"
        >
          {needsLogin ? t.loginBtn : t.backToDashboard}
        </Link>
      </div>
    </div>
  );
}

export function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-soft">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <strong className="mt-2 block text-3xl font-black text-on-surface">{value}</strong>
      <span className="mt-2 block text-xs text-on-surface-variant">{hint}</span>
    </article>
  );
}

export function EmptyPanel({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant bg-surface p-8 text-center">
      <h3 className="text-xl font-black text-on-surface">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-7 text-on-surface-variant">{description}</p> : null}
    </div>
  );
}

function DashboardNav({
  active,
  navItems,
  addProductLabel,
}: {
  active: DashboardShellProps["active"];
  navItems: Array<{ key: DashboardShellProps["active"]; label: string; icon: string; href: string }>;
  addProductLabel: string;
}) {
  return (
    <nav
      className="sticky top-[73px] z-30 border-b border-outline-variant/20 bg-background/95 px-4 py-3 backdrop-blur-xl"
      aria-label="Dashboard navigation"
    >
      <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const selected = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                selected
                  ? "bg-primary text-white shadow-soft"
                  : "border border-outline-variant bg-surface text-on-surface-variant hover:text-primary"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/dashboard/products/new"
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
        >
          <span aria-hidden="true">+</span>
          <span>{addProductLabel}</span>
        </Link>
      </div>
    </nav>
  );
}

function DashboardHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 text-start md:px-8 md:pt-8">
        <h2 className="truncate text-xl font-black text-primary md:text-2xl">{title}</h2>
        <p className="mt-1 max-w-3xl text-xs leading-6 text-on-surface-variant md:text-sm">{description}</p>
      </div>
    </header>
  );
}

export function formatDashboardPrice(value: number, currency = "ر.س", locale = "ar-SA") {
  return `${value.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDashboardDate(value: string | Date, locale = "ar-SA") {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export function formatOrderStatus(status: string, t?: { statusPending: string; statusPaid: string; statusProcessing: string; statusShipped: string; statusCompleted: string; statusCancelled: string }) {
  if (t) {
    const labels: Record<string, string> = {
      PENDING: t.statusPending,
      PAID: t.statusPaid,
      PROCESSING: t.statusProcessing,
      SHIPPED: t.statusShipped,
      COMPLETED: t.statusCompleted,
      CANCELLED: t.statusCancelled,
    };
    return labels[status] ?? status;
  }
  const labels: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status] ?? status;
}

export function statusClass(status: string) {
  const classes: Record<string, string> = {
    PENDING: "status-pending",
    PAID: "status-paid",
    PROCESSING: "status-processing",
    SHIPPED: "status-shipped",
    COMPLETED: "status-completed",
    CANCELLED: "status-cancelled",
  };
  return classes[status] ?? "status-pending";
}

export type DashboardTheme = VendorTheme;
