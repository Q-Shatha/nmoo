import Link from "next/link";
import { ApiError, getOrders, Order } from "@/lib/api";
import { DashboardShell, DashboardUnavailable, EmptyPanel, formatDashboardDate, formatDashboardPrice, formatOrderStatus, statusClass } from "../DashboardShell";
import { loadVendorDashboardBase } from "../dashboard-data";

export default async function DashboardOrdersPage() {
  const data = await loadPageData();

  return (
    <DashboardShell
      active="orders"
      title="الطلبات"
      description="متابعة طلبات العملاء وتحديث حالاتها"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
    >
      {data.ok ? (
        <section className="dashboard-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 p-4 md:p-5">
            <h2 className="text-xl font-black text-on-surface">كل الطلبات</h2>
            <span className="text-sm font-bold text-on-surface-variant">{data.orders.length} طلب</span>
          </div>
          {data.orders.length > 0 ? <OrdersTable orders={data.orders} /> : <EmptyPanel title="لا توجد طلبات بعد" />}
        </section>
      ) : (
        <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />
      )}
    </DashboardShell>
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
              <span className="font-black text-primary">#{order.id.slice(0, 8)}</span>
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
      <table className="w-full min-w-[760px] text-right">
        <thead>
          <tr className="bg-surface-container-low/60">
            {["رقم الطلب", "العميل", "التاريخ", "المبلغ", "الحالة", "الإجراء"].map((heading) => (
              <th key={heading} className="border-b border-outline-variant/15 px-5 py-3 text-sm font-bold text-on-surface-variant">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/15">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-surface-container-low/60">
              <td className="px-5 py-4 font-bold text-primary">#{order.id.slice(0, 8)}</td>
              <td className="px-5 py-4 font-semibold">{order.buyer?.name ?? "عميل"}</td>
              <td className="px-5 py-4 text-on-surface-variant">{formatDashboardDate(order.createdAt)}</td>
              <td className="px-5 py-4 font-bold text-on-surface">{formatDashboardPrice(Number(order.total))}</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status)}</span>
              </td>
              <td className="px-5 py-4">
                <Link className="secondary-button px-4 py-2 text-sm" href={`/dashboard/orders/${order.id}`}>
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
      orders: await getOrders(base.token),
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل الطلبات.",
    };
  }
}
