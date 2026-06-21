import { AbandonedCartBuyer, ApiError, getAbandonedCarts, getOrders, Order } from "@/lib/api";
import { DashboardShell, DashboardUnavailable, formatDashboardPrice } from "../DashboardShell";
import { loadVendorDashboardBase, getVendorStoreHref } from "../dashboard-data";

export default async function AnalyticsPage() {
  const base = await loadVendorDashboardBase();
  if (!base.ok) {
    return (
      <DashboardShell active="analytics" title="التقارير" description="تحليل المبيعات وسلوك العملاء"
        userName="التاجر" logoUrl={null}>
        <DashboardUnavailable needsLogin={base.needsLogin} message={base.message} />
      </DashboardShell>
    );
  }

  let orders: Order[] = [];
  let abandonedCarts: AbandonedCartBuyer[] = [];
  try {
    [orders, abandonedCarts] = await Promise.all([
      getOrders(base.token),
      getAbandonedCarts(base.token).catch(() => []),
    ]);
  } catch (e) {
    return (
      <DashboardShell active="analytics" title="التقارير" description="تحليل المبيعات وسلوك العملاء"
        userName={base.user.name} logoUrl={base.theme.logoUrl} storeHref={getVendorStoreHref(base.user)}>
        <DashboardUnavailable message={e instanceof ApiError ? e.message : "تعذر تحميل البيانات"} />
      </DashboardShell>
    );
  }

  const paidOrders = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING");
  const analytics = computeAnalytics(paidOrders);

  return (
    <DashboardShell active="analytics" title="التقارير" description="تحليل المبيعات وسلوك العملاء"
      userName={base.user.name} logoUrl={base.theme.logoUrl} storeHref={getVendorStoreHref(base.user)}>
      <div className="grid gap-6">
        {/* Period summary cards */}
        <section>
          <h3 className="mb-4 text-lg font-black text-on-surface">ملخص المبيعات</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <PeriodCard label="اليوم" data={analytics.today} />
            <PeriodCard label="هذا الأسبوع" data={analytics.week} />
            <PeriodCard label="هذا الشهر" data={analytics.month} />
          </div>
        </section>

        {/* Monthly trend */}
        <section className="dashboard-panel p-5 md:p-6">
          <h3 className="mb-5 text-base font-black text-on-surface">المبيعات الشهرية (آخر 6 أشهر)</h3>
          <MonthlyChart months={analytics.monthly} />
        </section>

        {/* Best sellers + country breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="dashboard-panel p-5 md:p-6">
            <h3 className="mb-5 text-base font-black text-on-surface">أكثر المنتجات مبيعاً</h3>
            <BestSellers products={analytics.topProducts} />
          </section>
          <section className="dashboard-panel p-5 md:p-6">
            <h3 className="mb-5 text-base font-black text-on-surface">المبيعات حسب الدولة</h3>
            <CountryBreakdown countries={analytics.byCountry} />
          </section>
        </div>

        {/* Customer behavior */}
        <section className="dashboard-panel p-5 md:p-6">
          <h3 className="mb-5 text-base font-black text-on-surface">تحليل سلوك العملاء</h3>
          <CustomerBehavior data={analytics.behavior} />
        </section>

        {/* Abandoned carts */}
        <section className="dashboard-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 p-5 md:p-6">
            <h3 className="text-base font-black text-on-surface">سلات مهجورة</h3>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              {abandonedCarts.length} عميل
            </span>
          </div>
          <AbandonedCarts carts={abandonedCarts} />
        </section>
      </div>
    </DashboardShell>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function PeriodCard({ label, data }: { label: string; data: PeriodData }) {
  return (
    <article className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-soft text-right">
      <p className="text-sm font-bold text-on-surface-variant">{label}</p>
      <strong className="mt-2 block text-2xl font-black text-on-surface">{formatDashboardPrice(data.revenue)}</strong>
      <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant">
        <span>{data.orders} طلب</span>
        <span>متوسط {formatDashboardPrice(data.avg)}</span>
      </div>
    </article>
  );
}

function MonthlyChart({ months }: { months: MonthStat[] }) {
  if (months.length === 0) return <Empty />;
  const max = Math.max(...months.map((m) => m.revenue), 1);
  return (
    <div className="grid gap-3">
      {months.map((m) => (
        <div key={m.label} className="grid grid-cols-[80px_1fr_100px] items-center gap-3 text-sm" dir="rtl">
          <span className="text-right text-xs font-bold text-on-surface-variant">{m.label}</span>
          <div className="h-7 overflow-hidden rounded-xl bg-surface-container-low">
            <div
              className="h-full rounded-xl bg-primary transition-all"
              style={{ width: `${Math.max((m.revenue / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-left text-xs font-bold text-on-surface">{formatDashboardPrice(m.revenue)}</span>
        </div>
      ))}
    </div>
  );
}

function BestSellers({ products }: { products: ProductStat[] }) {
  if (products.length === 0) return <Empty />;
  const maxQty = Math.max(...products.map((p) => p.qty), 1);
  return (
    <ol className="grid gap-3">
      {products.map((p, i) => (
        <li key={p.id} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 text-sm" dir="rtl">
          <span className="text-center text-xs font-black text-on-surface-variant">{i + 1}</span>
          <div>
            <p className="font-bold text-on-surface leading-snug">{p.title}</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-container-low">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-on-surface">{p.qty} قطعة</p>
            <p className="text-xs text-on-surface-variant">{formatDashboardPrice(p.revenue)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CountryBreakdown({ countries }: { countries: CountryStat[] }) {
  if (countries.length === 0) return <Empty />;
  const maxRev = Math.max(...countries.map((c) => c.revenue), 1);
  return (
    <ol className="grid gap-3">
      {countries.map((c) => (
        <li key={c.country} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm" dir="rtl">
          <div>
            <p className="font-bold text-on-surface">{c.country}</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-container-low">
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${(c.revenue / maxRev) * 100}%` }} />
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-on-surface">{formatDashboardPrice(c.revenue)}</p>
            <p className="text-xs text-on-surface-variant">{c.orders} طلب</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CustomerBehavior({ data }: { data: BehaviorData }) {
  const stats = [
    { label: "إجمالي العملاء", value: data.totalBuyers.toString() },
    { label: "عملاء متكررون", value: data.repeatBuyers.toString() },
    { label: "معدل التكرار", value: `${data.repeatRate}%` },
    { label: "متوسط قيمة الطلب", value: formatDashboardPrice(data.avgOrderValue) },
    { label: "أكثر طريقة دفع", value: data.topPayment },
    { label: "متوسط عدد المنتجات/طلب", value: data.avgItemsPerOrder.toFixed(1) },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl bg-surface-container-low p-4 text-right">
          <p className="text-xs text-on-surface-variant">{s.label}</p>
          <p className="mt-1 text-lg font-black text-on-surface">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function AbandonedCarts({ carts }: { carts: AbandonedCartBuyer[] }) {
  if (carts.length === 0) {
    return <p className="py-8 text-center text-sm text-on-surface-variant">لا توجد سلات مهجورة — كل العملاء أكملوا طلباتهم</p>;
  }
  return (
    <div className="divide-y divide-outline-variant/15">
      {carts.map((entry) => {
        const totalValue = entry.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
        const daysSince = Math.floor((Date.now() - new Date(entry.lastActive).getTime()) / 86400000);
        return (
          <div key={entry.buyer.id} className="grid gap-2 p-4 text-right md:grid-cols-[1fr_auto]" dir="rtl">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-on-surface">{entry.buyer.name}</p>
                <span className="text-xs text-on-surface-variant">{entry.buyer.email}</span>
              </div>
              {entry.buyer.phoneNumber && (
                <p className="text-xs text-on-surface-variant">{entry.buyer.phoneNumber}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.items.map((item) => (
                  <span key={item.product.id} className="rounded-xl bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface">
                    {item.product.title} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end justify-center gap-1">
              <p className="font-black text-on-surface">{formatDashboardPrice(totalValue)}</p>
              <p className="text-xs text-on-surface-variant">
                {daysSince === 0 ? "اليوم" : `منذ ${daysSince} يوم`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty() {
  return <p className="py-6 text-center text-sm text-on-surface-variant">لا توجد بيانات كافية بعد</p>;
}

/* ── Analytics computation ──────────────────────────────────── */

type PeriodData = { revenue: number; orders: number; avg: number };
type MonthStat = { label: string; revenue: number };
type ProductStat = { id: string; title: string; qty: number; revenue: number };
type CountryStat = { country: string; revenue: number; orders: number };
type BehaviorData = {
  totalBuyers: number;
  repeatBuyers: number;
  repeatRate: number;
  avgOrderValue: number;
  topPayment: string;
  avgItemsPerOrder: number;
};

function computeAnalytics(orders: Order[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const periodData = (filtered: Order[]): PeriodData => {
    const revenue = filtered.reduce((s, o) => s + Number(o.total), 0);
    return { revenue, orders: filtered.length, avg: filtered.length ? revenue / filtered.length : 0 };
  };

  // Monthly trend (last 6 months)
  const monthly: MonthStat[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = d.toLocaleDateString("ar-SA", { month: "short", year: "2-digit" });
    const revenue = orders
      .filter((o) => { const t = new Date(o.createdAt); return t >= d && t < end; })
      .reduce((s, o) => s + Number(o.total), 0);
    monthly.push({ label, revenue });
  }

  // Top products
  const productMap = new Map<string, ProductStat>();
  for (const order of orders) {
    for (const item of order.items) {
      const id = item.productId;
      const title = item.product?.title ?? "منتج";
      const rev = Number(item.unitPrice) * item.quantity;
      const existing = productMap.get(id);
      if (existing) {
        existing.qty += item.quantity;
        existing.revenue += rev;
      } else {
        productMap.set(id, { id, title, qty: item.quantity, revenue: rev });
      }
    }
  }
  const topProducts = [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 8);

  // By country
  const countryMap = new Map<string, CountryStat>();
  for (const order of orders) {
    const country = order.buyer?.country ?? "غير محدد";
    const rev = Number(order.total);
    const existing = countryMap.get(country);
    if (existing) {
      existing.revenue += rev;
      existing.orders += 1;
    } else {
      countryMap.set(country, { country, revenue: rev, orders: 1 });
    }
  }
  const byCountry = [...countryMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // Customer behavior
  const buyerOrderCount = new Map<string, number>();
  for (const order of orders) buyerOrderCount.set(order.buyerId, (buyerOrderCount.get(order.buyerId) ?? 0) + 1);
  const totalBuyers = buyerOrderCount.size;
  const repeatBuyers = [...buyerOrderCount.values()].filter((c) => c > 1).length;
  const repeatRate = totalBuyers ? Math.round((repeatBuyers / totalBuyers) * 100) : 0;
  const avgOrderValue = orders.length ? orders.reduce((s, o) => s + Number(o.total), 0) / orders.length : 0;
  const cashCount = orders.filter((o) => o.paymentMethod === "CASH_ON_DELIVERY").length;
  const topPayment = cashCount >= orders.length - cashCount ? "الدفع عند الاستلام" : "دفع إلكتروني";
  const totalItems = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const avgItemsPerOrder = orders.length ? totalItems / orders.length : 0;

  return {
    today: periodData(orders.filter((o) => new Date(o.createdAt) >= todayStart)),
    week: periodData(orders.filter((o) => new Date(o.createdAt) >= weekStart)),
    month: periodData(orders.filter((o) => new Date(o.createdAt) >= monthStart)),
    monthly,
    topProducts,
    byCountry,
    behavior: { totalBuyers, repeatBuyers, repeatRate, avgOrderValue, topPayment, avgItemsPerOrder },
  };
}
