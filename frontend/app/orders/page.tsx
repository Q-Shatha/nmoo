import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getOrders, Order } from "@/lib/api";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";

type OrdersData =
  | {
      ok: true;
      orders: Order[];
    }
  | {
      ok: false;
      message: string;
    };

export default async function OrdersPage() {
  const data = await loadOrders();

  return (
    <>
      <PublicHeader />
      <main className="app-container min-h-screen pt-8">
        <section className="mb-8 text-right">
          <p className="chip px-4 py-2 text-sm">حسابي</p>
          <h1 className="section-title mt-4 text-4xl">طلباتي</h1>
          <p className="section-copy mt-3">تابع طلباتك وحالتها من مكان واحد.</p>
        </section>

        {data.ok ? <OrdersList orders={data.orders} /> : <Unavailable message={data.message} />}
      </main>
      <PublicFooter />
    </>
  );
}

function OrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <section className="panel p-8 text-center">
        <h2 className="text-2xl font-black text-on-surface">لا توجد طلبات بعد</h2>
        <Link className="primary-button mt-6 px-6 py-3" href="/">
          تصفح المتجر
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {orders.map((order) => (
        <article key={order.id} className="panel grid gap-4 p-5 text-right md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-xl font-black text-on-surface">طلب #{order.id.slice(0, 8)}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">{formatDate(order.createdAt)}</p>
            <p className="mt-3 text-on-surface-variant">عدد المنتجات: {order.items.length}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status)}</span>
            <strong className="text-2xl text-on-surface">{formatPrice(Number(order.total))}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <section className="panel mx-auto max-w-2xl p-8 text-center">
      <h2 className="text-2xl font-black text-primary">تحتاج تسجيل دخول</h2>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/orders">
        تسجيل الدخول
      </Link>
    </section>
  );
}

async function loadOrders(): Promise<OrdersData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      message: "سجل الدخول أولاً حتى نعرض طلباتك.",
    };
  }

  try {
    return {
      ok: true,
      orders: await getOrders(token),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل الطلبات.",
    };
  }
}

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderStatus(status: Order["status"]) {
  const labels: Record<Order["status"], string> = {
    PENDING: "بانتظار الدفع",
    PAID: "مدفوع",
    PROCESSING: "قيد التنفيذ",
    SHIPPED: "تم الشحن",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
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
