import Link from "next/link";
import { getMyDiscountCodes, getMyProducts, getMyShippingMethods, getMyStorePages, getOrders, Order } from "@/lib/api";
import { DashboardShell, DashboardUnavailable, EmptyPanel, formatDashboardDate, formatDashboardPrice, formatOrderStatus, statusClass, SummaryCard } from "./DashboardShell";
import { loadVendorDashboardBase } from "./dashboard-data";

type DashboardData =
  | {
      ok: true;
      userName: string;
      logoUrl?: string | null;
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
    >
      {data.ok ? <DashboardOverview data={data} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

function DashboardOverview({ data }: { data: Extract<DashboardData, { ok: true }> }) {
  const latestOrders = data.orders.slice(0, 5);

  return (
    <>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-6">
        <SummaryCard label="إجمالي المبيعات" value={formatDashboardPrice(data.stats.totalSales)} hint="محسوبة من الطلبات الظاهرة" />
        <SummaryCard label="إجمالي الطلبات" value={String(data.stats.totalOrders)} hint={`${data.stats.completedOrders} مكتمل`} />
        <SummaryCard label="منتجات المتجر" value={String(data.stats.totalProducts)} hint={`${data.stats.activeProducts} نشط`} />
        <SummaryCard label="شركات الشحن" value={String(data.stats.shippingMethods)} hint={`${data.stats.activeShippingMethods} مفعلة`} />
        <SummaryCard label="مدونة المتجر" value={String(data.stats.storePages)} hint={`${data.stats.publishedStorePages} منشورة`} />
        <SummaryCard label="أكواد التخفيض" value={String(data.stats.discountCodes)} hint={`${data.stats.activeDiscountCodes} نشط`} />
      </section>

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

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <>
      <div className="grid gap-3 p-4 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-right shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status)}</span>
              <Link className="font-black text-primary underline-offset-4 hover:underline" href={`/dashboard/orders/${order.id}`}>
                #{order.id.slice(0, 8)}
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
                  #{order.id.slice(0, 8)}
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
