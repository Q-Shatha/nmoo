import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getOrder, Order, ShippingCarrier } from "@/lib/api";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";
import { PaymentActions } from "./PaymentActions";

type PaymentPageProps = {
  params: Promise<{
    orderId: string;
  }>;
  searchParams?: Promise<{
    payment?: string;
  }>;
};

type OrderData =
  | {
      ok: true;
      order: Order;
      paymentStatus?: string;
    }
  | {
      ok: false;
      message: string;
    };

const shippingLabels: Record<ShippingCarrier, string> = {
  spl: "سبل",
  smsa: "سمسا",
  aramex: "أرامكس",
  pickup: "استلام من المتجر",
};

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { orderId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = await loadOrder(orderId, resolvedSearchParams.payment);

  return (
    <>
      <PublicHeader active="store" />
      <main className="app-container min-h-screen pt-8" dir="rtl">
        {data.ok ? <PaymentSummary order={data.order} paymentStatus={data.paymentStatus} /> : <Unavailable message={data.message} />}
      </main>
      <PublicFooter />
    </>
  );
}

function PaymentSummary({ order, paymentStatus }: { order: Order; paymentStatus?: string }) {
  const itemsSubtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  const isCashOnDelivery = order.paymentMethod === "CASH_ON_DELIVERY";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <section className="panel p-6 text-right">
        <p className="chip px-4 py-2 text-sm">الدفع</p>
        <h1 className="mt-4 text-3xl font-black text-primary">طلب #{order.id.slice(0, 8)}</h1>
        <p className="mt-3 leading-8 text-on-surface-variant">راجع الطلب وشركة الشحن، ثم اضغط الدفع الآن لفتح بوابة الدفع.</p>

        {paymentStatus === "success" ? (
          <p className="mt-5 rounded-2xl bg-primary-container/40 px-5 py-4 font-bold text-primary">تمت عملية الدفع بنجاح، وسيتم تحديث حالة الطلب من بوابة الدفع.</p>
        ) : null}

        {paymentStatus === "cancelled" ? (
          <p className="mt-5 rounded-2xl bg-error-container/60 px-5 py-4 font-bold text-error">تم إلغاء عملية الدفع. الطلب محفوظ وتقدر تحاول مرة أخرى.</p>
        ) : null}

        {isCashOnDelivery ? (
          <p className="mt-5 rounded-2xl bg-primary-container/40 px-5 py-4 font-bold text-primary">تم اختيار الدفع عند الاستلام. الطلب وصل للتاجر ولا تحتاج فتح بوابة الدفع.</p>
        ) : null}

        <div className="mt-8 grid gap-4">
          {order.items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-outline-variant/20 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-on-surface">{item.product?.title ?? "منتج"}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">الكمية: {item.quantity}</p>
                </div>
                <strong className="text-lg text-primary">{formatPrice(Number(item.unitPrice) * item.quantity)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="panel h-fit p-6 text-right">
        <h2 className="text-xl font-black text-on-surface">ملخص الدفع</h2>
        <div className="mt-5 grid gap-3">
          <SummaryRow label="حالة الطلب" value={formatOrderStatus(order.status)} />
          <SummaryRow label="طريقة الدفع" value={isCashOnDelivery ? "الدفع عند الاستلام" : "الدفع الإلكتروني"} />
          <SummaryRow label="المجموع الفرعي" value={formatPrice(itemsSubtotal)} />
          <SummaryRow label={`الشحن (${formatShippingCarrier(order.shippingCarrier)})`} value={formatPrice(shippingFee)} />
          {discountAmount > 0 ? <SummaryRow label={`الخصم (${order.discountCode ?? "كود تخفيض"})`} value={`- ${formatPrice(discountAmount)}`} /> : null}
          <div className="flex items-center justify-between rounded-2xl bg-primary-container/30 p-4">
            <span className="font-black text-on-surface">الإجمالي</span>
            <span className="text-2xl font-black text-primary">{formatPrice(Number(order.total))}</span>
          </div>
        </div>
        {isCashOnDelivery ? (
          <Link className="primary-button mt-6 w-full py-3 text-center" href="/orders">
            عرض طلباتي
          </Link>
        ) : (
          <PaymentActions orderId={order.id} />
        )}
      </aside>
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

function Unavailable({ message }: { message: string }) {
  return (
    <section className="panel mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-2xl font-black text-primary">تعذر فتح صفحة الدفع</h1>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/checkout">
        تسجيل الدخول
      </Link>
    </section>
  );
}

async function loadOrder(orderId: string, paymentStatus?: string): Promise<OrderData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      message: "سجل الدخول أولا حتى نعرض طلبك ونكمل الدفع.",
    };
  }

  try {
    return {
      ok: true,
      order: await getOrder(orderId, token),
      paymentStatus,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل الطلب.",
    };
  }
}

function formatPrice(value: number) {
  if (value === 0) {
    return "مجانا";
  }

  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatShippingCarrier(carrier?: ShippingCarrier | null) {
  return carrier ? shippingLabels[carrier] : "غير محدد";
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
