import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getOrder, Order } from "@/lib/api";
import { PublicFooter } from "../../../components/PublicFooter";
import { OrderStatusEditor } from "./OrderStatusEditor";

type DashboardOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function DashboardOrderPage({ params }: DashboardOrderPageProps) {
  const { orderId } = await params;
  const data = await loadOrder(orderId);

  if (!data.ok) {
    return <Unavailable message={data.message} needsLogin={data.needsLogin} />;
  }

  const order = data.order;
  const itemsSubtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);

  return (
    <main className="min-h-screen bg-background text-on-surface" dir="rtl">
      <div className="mx-auto grid w-full max-w-7xl gap-6 p-5 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-sm font-bold text-primary underline-offset-4 hover:underline" href="/dashboard/orders">
              العودة للطلبات
            </Link>
            <h1 className="mt-2 text-3xl font-black text-on-surface">تفاصيل الطلب #{order.id.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-on-surface-variant">آخر تحديث: {formatDate(order.updatedAt)}</p>
          </div>
          <span className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status)}</span>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="grid gap-6">
            <OrderStatusEditor orderId={order.id} initialStatus={order.status} />
            <OrderItems order={order} />
          </div>

          <aside className="grid gap-6">
            <BuyerCard order={order} />
            <OrderSummary itemsSubtotal={itemsSubtotal} shippingFee={shippingFee} discountAmount={discountAmount} total={Number(order.total)} order={order} />
          </aside>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}

function OrderItems({ order }: { order: Order }) {
  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5">
        <h2 className="text-xl font-black text-on-surface">منتجات الطلب</h2>
      </div>
      <div className="divide-y divide-outline-variant/15">
        {order.items.map((item) => {
          const imageUrl = item.product?.imageUrl || item.product?.images?.[0]?.url || "/nmoo-logo.png";

          return (
            <article key={item.id} className="grid gap-4 p-5 sm:grid-cols-[96px_1fr_auto] sm:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-surface-container-low">
                <Image className="object-cover" alt={item.product?.title ?? "منتج"} src={imageUrl} fill sizes="96px" unoptimized />
              </div>
              <div className="text-right">
                <h3 className="text-lg font-black text-on-surface">{item.product?.title ?? "منتج محذوف"}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">الكمية: {item.quantity}</p>
                <p className="mt-1 text-sm text-on-surface-variant">سعر الوحدة: {formatPrice(Number(item.unitPrice))}</p>
              </div>
              <strong className="text-xl text-primary">{formatPrice(Number(item.unitPrice) * item.quantity)}</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BuyerCard({ order }: { order: Order }) {
  return (
    <section className="dashboard-panel p-6 text-right">
      <h2 className="text-xl font-black text-on-surface">بيانات العميل</h2>
      <div className="mt-5 grid gap-3">
        <Info label="الاسم" value={order.buyer?.name} />
        <Info label="البريد" value={order.buyer?.email} />
        <Info label="رقم الطلب" value={order.id} />
        <Info label="تاريخ الطلب" value={formatDate(order.createdAt)} />
      </div>
    </section>
  );
}

function OrderSummary({ itemsSubtotal, shippingFee, discountAmount, total, order }: { itemsSubtotal: number; shippingFee: number; discountAmount: number; total: number; order: Order }) {
  return (
    <section className="dashboard-panel p-6 text-right">
      <h2 className="text-xl font-black text-on-surface">ملخص الطلب</h2>
      <div className="mt-5 grid gap-3 border-b border-outline-variant/20 pb-5">
        <SummaryRow label="المجموع الفرعي" value={formatPrice(itemsSubtotal)} />
        <SummaryRow label={`الشحن (${order.shippingCarrier ?? "غير محدد"})`} value={formatPrice(shippingFee)} />
        {discountAmount > 0 ? <SummaryRow label={`الخصم (${order.discountCode ?? "كود تخفيض"})`} value={`- ${formatPrice(discountAmount)}`} /> : null}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary-container/30 p-4">
        <span className="font-black text-on-surface">الإجمالي</span>
        <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-4">
      <p className="text-sm font-bold text-on-surface-variant">{label}</p>
      <p className="mt-1 break-words font-black text-on-surface">{value || "-"}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold text-on-surface-variant">{label}</span>
      <span className="font-black text-on-surface">{value}</span>
    </div>
  );
}

function Unavailable({ message, needsLogin }: { message: string; needsLogin: boolean }) {
  return (
    <main className="min-h-screen bg-background p-6 text-on-surface" dir="rtl">
      <section className="dashboard-panel mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-black text-primary">{needsLogin ? "تحتاج تسجيل دخول" : "تعذر فتح الطلب"}</h1>
        <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
        <Link className="primary-button mt-6 px-6 py-3" href={needsLogin ? "/login?next=/dashboard" : "/dashboard/orders"}>
          {needsLogin ? "تسجيل الدخول" : "العودة للطلبات"}
        </Link>
      </section>
    </main>
  );
}

async function loadOrder(orderId: string): Promise<{ ok: true; order: Order } | { ok: false; message: string; needsLogin: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      needsLogin: true,
      message: "سجل الدخول بحساب التاجر حتى تقدر تعرض تفاصيل الطلب.",
    };
  }

  try {
    return {
      ok: true,
      order: await getOrder(orderId, token),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return {
      ok: false,
      needsLogin: error instanceof ApiError && error.status === 401,
      message: error instanceof ApiError ? error.message : "حدث خطأ أثناء تحميل تفاصيل الطلب.",
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
