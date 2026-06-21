import Link from "next/link";
import { ReactNode } from "react";
import { VendorTheme } from "@/lib/api";
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

const navItems: Array<{ key: DashboardShellProps["active"]; label: string; icon: string; href: string }> = [
  { key: "overview", label: "نظرة عامة", icon: "□", href: "/dashboard" },
  { key: "orders", label: "الطلبات", icon: "▤", href: "/dashboard/orders" },
  { key: "products", label: "المنتجات", icon: "▣", href: "/dashboard/products" },
  { key: "shipping", label: "الشحن", icon: "⇄", href: "/dashboard/shipping" },
  { key: "discounts", label: "التخفيضات", icon: "%", href: "/dashboard/discounts" },
  { key: "reviews", label: "التقييمات", icon: "★", href: "/dashboard/reviews" },
  { key: "analytics", label: "التقارير", icon: "↗", href: "/dashboard/analytics" },
  { key: "settings", label: "الإعدادات", icon: "⚙", href: "/dashboard/settings" },
];

export function DashboardShell({ active, title, description, logoUrl, storeHref, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-on-surface" dir="rtl">
      <PublicHeader active="store" storeHref={storeHref} storeLogoUrl={logoUrl} hideCart />
      <main className="min-h-screen min-w-0 max-w-full overflow-x-hidden">
        <DashboardHeader title={title} description={description} />
        <DashboardNav active={active} />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 pb-24 md:gap-6 md:p-8">
          {children}
        </div>
        <PublicFooter />
      </main>
    </div>
  );
}

export function DashboardUnavailable({
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
  return (
    <div dir="rtl" className="flex flex-1 items-center justify-center py-12">
      <div className="w-full rounded-3xl border border-outline-variant bg-surface px-10 py-12 text-center shadow-soft">
        <h1 className="text-2xl font-black leading-relaxed text-primary">
          {title ?? (needsLogin ? "تحتاج تسجيل دخول" : "تعذر تحميل الصفحة")}
        </h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          {description ?? message ?? "لم نتمكن من تحميل بيانات لوحة التحكم. حاول مرة أخرى بعد لحظات."}
        </p>
        <Link
          href={needsLogin ? "/login" : "/dashboard"}
          className="mt-8 block rounded-2xl bg-primary px-6 py-4 text-center text-base font-bold text-white"
        >
          {needsLogin ? "تسجيل الدخول" : "العودة للوحة التحكم"}
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

function DashboardNav({ active }: { active: DashboardShellProps["active"] }) {
  return (
    <nav
      className="sticky top-[73px] z-30 border-b border-outline-variant/20 bg-background/95 px-4 py-3 backdrop-blur-xl"
      aria-label="تنقل لوحة التحكم"
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
          <span>إضافة منتج</span>
        </Link>
      </div>
    </nav>
  );
}

function DashboardHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 text-right md:px-8 md:pt-8">
        <h2 className="truncate text-xl font-black text-primary md:text-2xl">{title}</h2>
        <p className="mt-1 max-w-3xl text-xs leading-6 text-on-surface-variant md:text-sm">{description}</p>
      </div>
    </header>
  );
}

export function formatDashboardPrice(value: number) {
  return `${value.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ر.س`;
}

export function formatDashboardDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "غير محدد";
  }
  return date.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

export function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "بانتظار الدفع",
    PAID: "مدفوع",
    PROCESSING: "قيد التنفيذ",
    SHIPPED: "تم الشحن",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
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
