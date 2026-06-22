import Link from "next/link";
import { ApiError, getOrders, Order } from "@/lib/api";
import { DashboardShell, DashboardUnavailable, EmptyPanel, formatDashboardDate, formatDashboardPrice, formatOrderStatus, statusClass } from "../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../dashboard-data";
import { BulkPrintButton } from "./BulkPrintDialog";
import { getT } from "@/lib/i18n/server";
import type { Translations } from "@/lib/i18n";

type DashboardOrdersPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function DashboardOrdersPage({ searchParams }: DashboardOrdersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.q?.trim() ?? "";
  const [data, t] = await Promise.all([loadPageData(), getT()]);
  const visibleOrders = data.ok ? filterOrders(data.orders, query) : [];

  return (
    <DashboardShell
      active="orders"
      title={t.orders}
      description={t.searchOrders}
      userName={data.ok ? data.userName : ""}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? (
        <section className="dashboard-panel overflow-hidden">
          <div className="grid gap-4 border-b border-outline-variant/15 p-4 md:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <form className="order-2 lg:order-1 lg:w-80">
              <input className="input-field w-full px-4 py-3" defaultValue={query} name="q" placeholder={t.searchOrders} type="search" />
            </form>
            <div className="order-1 flex items-center justify-between gap-4 lg:order-2">
              <h2 className="text-xl font-black text-on-surface">{t.allOrders}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-on-surface-variant">{visibleOrders.length} / {data.orders.length}</span>
                <a
                  href={query ? `/dashboard/orders/print?q=${encodeURIComponent(query)}` : "/dashboard/orders/print"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low"
                >
                  {t.printAll}
                </a>
                <BulkPrintButton type="invoices" query={query} />
                <BulkPrintButton type="labels" query={query} />
              </div>
            </div>
          </div>
          {visibleOrders.length > 0 ? <OrdersTable orders={visibleOrders} t={t} /> : <EmptyPanel title={query ? t.noOrdersMatch : t.noOrders} />}
        </section>
      ) : (
        <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />
      )}
    </DashboardShell>
  );
}

function OrdersTable({ orders, t }: { orders: Order[]; t: Translations }) {
  return (
    <>
      <div className="grid gap-3 p-4 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status, t)}</span>
              <span className="order-code font-black text-primary">#{order.id.slice(0, 8)}</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">{t.customer}</span>
                <span className="font-bold text-on-surface">{order.buyer?.name ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">{t.amount}</span>
                <span className="font-black text-on-surface">{formatDashboardPrice(Number(order.total), t.currency, t.numberLocale)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">{t.date}</span>
                <span className="font-bold text-on-surface">{formatDashboardDate(order.createdAt, t.numberLocale)}</span>
              </div>
            </div>
            <Link className="secondary-button mt-4 w-full py-3 text-center text-sm" href={`/dashboard/orders/${order.id}`}>
              {t.details}
            </Link>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="bg-surface-container-low/60">
              {[t.orderNumber, t.customer, t.date, t.amount, t.status, t.action].map((heading) => (
                <th key={heading} className="border-b border-outline-variant/15 px-5 py-3 text-sm font-bold text-on-surface-variant text-start">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-container-low/60">
                <td className="px-5 py-4 font-bold text-primary"><span className="order-code">#{order.id.slice(0, 8)}</span></td>
                <td className="px-5 py-4 font-semibold">{order.buyer?.name ?? "—"}</td>
                <td className="px-5 py-4 text-on-surface-variant">{formatDashboardDate(order.createdAt, t.numberLocale)}</td>
                <td className="px-5 py-4 font-bold text-on-surface">{formatDashboardPrice(Number(order.total), t.currency, t.numberLocale)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status, t)}</span>
                </td>
                <td className="px-5 py-4">
                  <Link className="secondary-button px-4 py-2 text-sm" href={`/dashboard/orders/${order.id}`}>
                    {t.details}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function filterOrders(orders: Order[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return orders;
  }

  return orders.filter((order) => {
    const haystack = [
      order.id,
      order.id.slice(0, 8),
      order.buyer?.name,
      order.buyer?.email,
      order.status,
      formatOrderStatus(order.status),
      order.total,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

async function loadPageData() {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    return {
      ok: true as const,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      orders: await getOrders(base.token),
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "Failed to load orders.",
    };
  }
}
