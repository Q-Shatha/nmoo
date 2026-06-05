import Link from "next/link";
import { getMyDiscountCodes, getMyProducts, getMyShippingMethods, getMyStorePages, getOrders, Order } from "@/lib/api";
import { DashboardShell, DashboardUnavailable, EmptyPanel, formatDashboardDate, formatDashboardPrice, formatOrderStatus, statusClass } from "./DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "./dashboard-data";

type DashboardData =
  | {
      ok: true;
      userName: string;
      logoUrl?: string | null;
      storeHref: string;
      orders: Order[];
      stats: {
        totalSales: number;
        totalOrders: number;
        completedOrders: number;
        totalProducts: number;
        activeProducts: number;
        shippingMethods: number;
        activeShippingMethods: number;
        storePages: number;
        publishedStorePages: number;
        discountCodes: number;
        activeDiscountCodes: number;
      };
    }
  | {
      ok: false;
      message: string;
      needsLogin: boolean;
    };

export default async function Dashboard() {
  const data = await loadDashboardData();

  return (
    <DashboardShell
      active="overview"
      title="لوحة التحكم"
      description="إحصائيات المتجر وآخر الطلبات"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <DashboardOverview data={data} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

function DashboardOverview({ data }: { data: Extract<DashboardData, { ok: true }> }) {
  const latestOrders = data.orders.slice(0, 5);

  return (
    <>
      <StatsShowcase stats={data.stats} orders={data.orders} />

      <section className="dashboard-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-outline-variant/15 p-4 text-right sm:flex-row sm:items-center sm:justify-between md:p-5">
          <div>
            <h2 className="text-xl font-black text-on-surface">آخر الطلبات</h2>
            <p className="mt-1 text-sm text-on-surface-variant">أحدث الطلبات التي وصلت لمتجرك.</p>
          </div>
          <Link className="secondary-button w-full px-5 py-3 text-center sm:w-auto" href="/dashboard/orders">
            عرض كل الطلبات
          </Link>
        </div>
        {latestOrders.length > 0 ? <OrdersTable orders={latestOrders} /> : <EmptyPanel title="لا توجد طلبات بعد" />}
      </section>
    </>
  );
}

function StatsShowcase({ stats, orders }: { stats: Extract<DashboardData, { ok: true }>["stats"]; orders: Order[] }) {
  const completedRate = percentage(stats.completedOrders, stats.totalOrders);
  const activeProductsRate = percentage(stats.activeProducts, stats.totalProducts);
  const activeShippingRate = percentage(stats.activeShippingMethods, stats.shippingMethods);
  const publishedPagesRate = percentage(stats.publishedStorePages, stats.storePages);
  const activeDiscountRate = percentage(stats.activeDiscountCodes, stats.discountCodes);
  const salesSeries = buildSalesSeries(orders);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <article className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-primary p-6 text-white shadow-soft md:p-7">
        <div className="pointer-events-none absolute -left-12 -top-16 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-8 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid min-h-[18rem] content-between gap-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 text-right md:min-w-[20rem]">
              <p className="text-sm font-bold text-white/75">نبض المتجر اليومي</p>
              <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{formatDashboardPrice(stats.totalSales)}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">إجمالي المبيعات من الطلبات المسجلة في المتجر.</p>
            </div>
            <div className="flex w-full flex-none items-center justify-between gap-4 rounded-3xl border border-white/20 bg-white/12 px-5 py-4 text-right backdrop-blur md:w-auto md:min-w-64 lg:min-w-72">
              <div className="min-w-0">
                <span className="block whitespace-nowrap text-xs font-bold leading-6 text-white/70">إجمالي الطلبات</span>
                <span className="mt-1 block whitespace-nowrap text-sm font-bold leading-6 text-white/80">المسجلة في المتجر</span>
              </div>
              <strong className="text-4xl font-black leading-none">{stats.totalOrders}</strong>
            </div>
          </div>

          <SalesSparkChart data={salesSeries} />

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMiniStat label="طلبات مكتملة" value={stats.completedOrders} total={stats.totalOrders} rate={completedRate} />
            <HeroMiniStat label="منتجات نشطة" value={stats.activeProducts} total={stats.totalProducts} rate={activeProductsRate} />
            <HeroMiniStat label="خصومات فعالة" value={stats.activeDiscountCodes} total={stats.discountCodes} rate={activeDiscountRate} />
          </div>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <MetricTile label="المنتجات" value={stats.totalProducts} hint={`${stats.activeProducts} نشط`} rate={activeProductsRate} tone="primary" />
        <MetricTile label="الشحن" value={stats.shippingMethods} hint={`${stats.activeShippingMethods} مفعلة`} rate={activeShippingRate} tone="blue" />
        <MetricTile label="صفحات المتجر" value={stats.storePages} hint={`${stats.publishedStorePages} منشورة`} rate={publishedPagesRate} tone="amber" />
        <MetricTile label="أكواد التخفيض" value={stats.discountCodes} hint={`${stats.activeDiscountCodes} نشط`} rate={activeDiscountRate} tone="rose" />
      </div>
    </section>
  );
}

function SalesSparkChart({ data }: { data: Array<{ label: string; total: number; count: number }> }) {
  const maxTotal = Math.max(...data.map((item) => item.total), 1);

  return (
    <div className="dashboard-bar-chart relative max-w-full overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/14 p-4 text-white shadow-inner backdrop-blur md:p-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-white/75" dir="rtl">
        <span>آخر 7 أيام</span>
        <span>حركة المبيعات</span>
      </div>
      <div className="relative grid h-56 max-w-full grid-cols-[2.5rem_minmax(0,1fr)] gap-3 overflow-hidden" dir="ltr">
        <div className="grid h-[calc(100%-2rem)] w-10 grid-rows-4 pt-2 text-left text-xs font-black text-white/35">
          {[100, 75, 50, 25].map((mark) => (
            <span key={mark}>{mark}%</span>
          ))}
        </div>
        <div className="relative border-b-4 border-white/35">
          <div className="absolute inset-x-0 top-2 h-[calc(100%-2rem)] bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_1px,transparent_1px,transparent_20px)]" />
          <div className="relative z-10 grid h-full min-w-0 grid-cols-7 items-end gap-2 px-1 pb-8 sm:gap-3 md:gap-5 md:px-3">
            {data.map((item, index) => {
              const percent = Math.round((item.total / maxTotal) * 100);
              const height = Math.max(item.total > 0 ? 15 : 4, percent);
              const barColor = index % 3 === 0 ? "bg-white" : index % 3 === 1 ? "bg-white/72" : "bg-white/50";
              const ghostHeight = Math.min(100, Math.max(74, height + 22));
            return (
              <div key={item.label} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <div className="relative flex h-full w-full items-end justify-center">
                  <span
                    className="dashboard-bar-ghost absolute bottom-0 w-full max-w-[3.5rem] rounded-t-sm bg-white/12"
                    style={{ height: `${ghostHeight}%`, animationDelay: `${index * 90}ms` }}
                  />
                  <span
                    className="dashboard-bar-value absolute z-10 -translate-y-2 text-lg font-black text-white drop-shadow-sm md:text-2xl"
                    style={{ bottom: `${height}%`, animationDelay: `${260 + index * 90}ms` }}
                  >
                    {percent}%
                  </span>
                  <span
                    className={`dashboard-bar-fill relative z-0 w-full max-w-[3.5rem] rounded-t-sm ${barColor}`}
                    style={{ height: `${height}%` }}
                    title={`${formatDashboardPrice(item.total)} - ${item.count} طلب`}
                  />
                </div>
                <span className="absolute bottom-1 truncate text-center text-[0.72rem] font-black text-white/55 md:text-xs">{item.label}</span>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMiniStat({ label, value, total, rate }: { label: string; value: number; total: number; rate: number }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-end justify-between gap-3">
        <span className="text-xs font-bold text-white/70">{label}</span>
        <strong className="text-2xl font-black">{value}</strong>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
        <span className="block h-full rounded-full bg-white" style={{ width: `${rate}%` }} />
      </div>
      <p className="mt-2 text-xs font-bold text-white/65">{rate}% من {total || 0}</p>
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  rate,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  rate: number;
  tone: "primary" | "blue" | "amber" | "rose";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-sky-100 text-sky-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
  }[tone];

  return (
    <article className="rounded-[1.5rem] border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-on-surface-variant">{label}</p>
          <strong className="mt-2 block text-3xl font-black text-on-surface">{value}</strong>
        </div>
        <span className={`rounded-2xl px-3 py-2 text-xs font-black ${toneClass}`}>{hint}</span>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <span className="text-xs font-black text-on-surface-variant">{rate}%</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
          <span className="block h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
        </div>
      </div>
    </article>
  );
}

function percentage(value: number, total: number) {
  if (!total) {
    return 0;
  }
  return Math.min(100, Math.round((value / total) * 100));
}

function buildSalesSeries(orders: Order[]) {
  const formatter = new Intl.DateTimeFormat("ar-SA", { weekday: "short" });
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: formatter.format(date),
      total: 0,
      count: 0,
    };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));

  for (const order of orders) {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    const key = orderDate.toISOString().slice(0, 10);
    const day = byKey.get(key);
    if (day) {
      day.total += Number(order.total);
      day.count += 1;
    }
  }

  return days;
}

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <>
      <div className="grid gap-3 p-4 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-right shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status)}</span>
              <Link className="font-black text-primary underline-offset-4 hover:underline" href={`/dashboard/orders/${order.id}`}>
                <span className="order-code">#{order.id.slice(0, 8)}</span>
              </Link>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">العميل</span>
                <span className="font-bold text-on-surface">{order.buyer?.name ?? "عميل"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">المبلغ</span>
                <span className="font-black text-on-surface">{formatDashboardPrice(Number(order.total))}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">التاريخ</span>
                <span className="text-left font-bold text-on-surface">{formatDashboardDate(order.createdAt)}</span>
              </div>
            </div>
            <Link className="secondary-button mt-4 w-full py-3 text-center text-sm" href={`/dashboard/orders/${order.id}`}>
              التفاصيل
            </Link>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[680px] text-right">
        <thead>
          <tr className="bg-surface-container-low/60">
            {["رقم الطلب", "العميل", "التاريخ", "المبلغ", "الحالة"].map((heading) => (
              <th key={heading} className="border-b border-outline-variant/15 px-5 py-3 text-sm font-bold text-on-surface-variant">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/15">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-surface-container-low/60">
              <td className="px-5 py-4 font-bold text-on-surface">
                <Link className="text-primary underline-offset-4 hover:underline" href={`/dashboard/orders/${order.id}`}>
                  <span className="order-code">#{order.id.slice(0, 8)}</span>
                </Link>
              </td>
              <td className="px-5 py-4 font-semibold">{order.buyer?.name ?? "عميل"}</td>
              <td className="px-5 py-4 text-on-surface-variant">{formatDashboardDate(order.createdAt)}</td>
              <td className="px-5 py-4 font-bold text-on-surface">{formatDashboardPrice(Number(order.total))}</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status)}</span>
                <Link className="mt-2 block text-xs font-bold text-primary underline-offset-4 hover:underline" href={`/dashboard/orders/${order.id}`}>
                  التفاصيل
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

async function loadDashboardData(): Promise<DashboardData> {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    const [products, orders, shippingMethods, storePages, discountCodes] = await Promise.all([
      getMyProducts(base.token),
      getOrders(base.token),
      getMyShippingMethods(base.token),
      getMyStorePages(base.token),
      getMyDiscountCodes(base.token),
    ]);

    return {
      ok: true,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      orders,
      stats: {
        totalSales: orders.reduce((sum, order) => sum + Number(order.total), 0),
        totalOrders: orders.length,
        completedOrders: orders.filter((order) => order.status === "COMPLETED").length,
        totalProducts: products.length,
        activeProducts: products.filter((product) => product.status === "ACTIVE").length,
        shippingMethods: shippingMethods.length,
        activeShippingMethods: shippingMethods.filter((method) => method.enabled).length,
        storePages: storePages.length,
        publishedStorePages: storePages.filter((page) => page.published).length,
        discountCodes: discountCodes.length,
        activeDiscountCodes: discountCodes.filter((code) => code.enabled).length,
      },
    };
  } catch (error) {
    return {
      ok: false,
      needsLogin: false,
      message: error instanceof Error ? error.message : "تعذر تحميل إحصائيات لوحة التحكم.",
    };
  }
}
