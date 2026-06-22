import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getOrders, Order } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";

type OrdersData =
  | { ok: true; orders: Order[] }
  | { ok: false; message: string };

type T = Awaited<ReturnType<typeof getT>>;

export default async function OrdersPage() {
  const t = await getT();
  const data = await loadOrders(t);

  return (
    <>
      <PublicHeader />
      <main className="app-container min-h-screen pt-8">
        <section className="mb-8 text-start">
          <p className="chip px-4 py-2 text-sm">{t.myOrdersChip}</p>
          <h1 className="section-title mt-4 text-4xl">{t.myOrdersTitle}</h1>
          <p className="section-copy mt-3">{t.myOrdersDesc}</p>
        </section>

        {data.ok ? <OrdersList orders={data.orders} t={t} /> : <Unavailable message={data.message} t={t} />}
      </main>
      <PublicFooter />
    </>
  );
}

function OrdersList({ orders, t }: { orders: Order[]; t: T }) {
  if (orders.length === 0) {
    return (
      <section className="panel p-8 text-center">
        <h2 className="text-2xl font-black text-on-surface">{t.noOrdersYetBuyer}</h2>
        <Link className="primary-button mt-6 px-6 py-3" href="/">
          {t.browseStore}
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {orders.map((order) => (
        <article key={order.id} className="panel grid gap-4 p-5 text-start md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-xl font-black text-on-surface">
              {t.orderHeading(order.id.slice(0, 8))}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">{formatDate(order.createdAt, t.numberLocale)}</p>
            <p className="mt-3 text-on-surface-variant">{t.itemsCount(order.items.length)}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status, t)}</span>
            <strong className="text-2xl text-on-surface">{formatPrice(Number(order.total), t.currency, t.numberLocale)}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}

function Unavailable({ message, t }: { message: string; t: T }) {
  return (
    <section className="panel mx-auto max-w-2xl p-8 text-center">
      <h2 className="text-2xl font-black text-primary">{t.loginRequiredOrders}</h2>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/orders">
        {t.loginBtn}
      </Link>
    </section>
  );
}

async function loadOrders(t: T): Promise<OrdersData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return { ok: false, message: t.loginFirstOrders };
  }

  try {
    return { ok: true, orders: await getOrders(token) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : t.failedToLoadOrders,
    };
  }
}

function formatPrice(value: number, currency: string, locale: string) {
  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderStatus(status: Order["status"], t: T) {
  const labels: Record<Order["status"], string> = {
    PENDING: t.statusPending,
    PAID: t.statusPaid,
    PROCESSING: t.statusProcessing,
    SHIPPED: t.statusShipped,
    COMPLETED: t.statusCompleted,
    CANCELLED: t.statusCancelled,
  };

  return labels[status];
}

function statusClass(status: Order["status"]) {
  const classes: Record<Order["status"], string> = {
    PENDING: "bg-amber-100 text-amber-800",
    PAID: "bg-emerald-100 text-emerald-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return classes[status];
}
