import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { VendorTheme } from "@/lib/api";
import { BrandLogo } from "../components/BrandLogo";
import { PublicFooter } from "../components/PublicFooter";

type DashboardShellProps = {
  active: "overview" | "orders" | "products" | "shipping" | "discounts" | "settings";
  title: string;
  description: string;
  userName?: string;
  logoUrl?: string | null;
  children: ReactNode;
};

const navItems: Array<{ key: DashboardShellProps["active"]; label: string; icon: string; href: string }> = [
  { key: "overview", label: "نظرة عامة", icon: "□", href: "/dashboard" },
  { key: "orders", label: "الطلبات", icon: "▤", href: "/dashboard/orders" },
  { key: "products", label: "المنتجات", icon: "▣", href: "/dashboard/products" },
  { key: "shipping", label: "الشحن", icon: "⇄", href: "/dashboard/shipping" },
  { key: "discounts", label: "التخفيضات", icon: "%", href: "/dashboard/discounts" },
  { key: "settings", label: "الإعدادات", icon: "⚙", href: "/dashboard/settings" },
];

export function DashboardShell({ active, title, description, userName = "التاجر", logoUrl, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-on-surface" dir="rtl">
      <DashboardSidebar active={active} />

      <main className="min-h-screen flex-1 md:mr-64">
        <DashboardHeader title={title} description={description} name={userName} logoUrl={logoUrl} />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-5 md:p-8">{children}</div>
        <PublicFooter />
      </main>
    </div>
  );
}

export function DashboardUnavailable({ message, needsLogin = false }: { message: string; needsLogin?: boolean }) {
  return (
    <section className="dashboard-panel mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-2xl font-black text-primary">{needsLogin ? "تحتاج تسجيل دخول" : "تعذر تحميل الصفحة"}</h1>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href={needsLogin ? "/login?next=/dashboard" : "/dashboard"}>
        {needsLogin ? "تسجيل الدخول" : "العودة للوحة التحكم"}
      </Link>
    </section>
  );
}

export function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="dashboard-panel p-6">
      <p className="text-on-surface-variant">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-on-surface">{value}</h3>
      <p className="mt-4 rounded-full bg-surface-container-low px-3 py-1 text-sm font-bold text-primary">{hint}</p>
    </article>
  );
}

export function EmptyPanel({ title }: { title: string }) {
  return <div className="p-8 text-center font-bold text-on-surface-variant">{title}</div>;
}

function DashboardSidebar({ active }: { active: DashboardShellProps["active"] }) {
  return (
    <aside className="fixed right-0 top-0 z-50 hidden h-full w-64 flex-col border-l border-inverse-on-surface/15 bg-inverse-surface px-4 py-6 text-inverse-on-surface shadow-sm md:flex">
      <div className="mb-10 px-2">
        <BrandLogo />
        <p className="mt-3 text-sm text-inverse-on-surface/75">مركز التجار</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.key}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-colors ${
              active === item.key ? "bg-secondary-container text-on-secondary-container" : "text-inverse-on-surface/78 hover:bg-white/10 hover:text-white"
            }`}
            href={item.href}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <Link className="primary-button mt-6 w-full gap-2 py-3" href="/dashboard/products/new">
        <span>+</span>
        <span>إضافة منتج</span>
      </Link>
    </aside>
  );
}

function DashboardHeader({ title, description, name, logoUrl }: { title: string; description: string; name: string; logoUrl?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/25 bg-surface-container-lowest/95 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div>
          <h2 className="text-2xl font-black text-primary">{title}</h2>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-left sm:block">
            <p className="font-bold text-on-surface">{name}</p>
            <p className="text-xs text-on-surface-variant">nmoo dashboard</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-container font-black text-on-primary-container">
            {logoUrl ? <Image className="h-full w-full object-cover" alt="أيقونة المتجر" src={logoUrl} width={40} height={40} unoptimized /> : name.trim()[0] ?? "ن"}
          </div>
        </div>
      </div>
    </header>
  );
}

export function formatDashboardPrice(value: number) {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}

export function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatOrderStatus(status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED") {
  const labels = {
    PENDING: "بانتظار الدفع",
    PAID: "مدفوع",
    PROCESSING: "قيد التنفيذ",
    SHIPPED: "تم الشحن",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
  };

  return labels[status];
}

export function statusClass(status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED") {
  const classes = {
    PENDING: "bg-amber-100 text-amber-800",
    PAID: "bg-emerald-100 text-emerald-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return classes[status];
}

export type DashboardTheme = VendorTheme;
