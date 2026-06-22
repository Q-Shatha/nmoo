import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getOrder, Order, ShippingCarrier } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
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

type T = Awaited<ReturnType<typeof getT>>;

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

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { orderId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const t = await getT();
  const data = await loadOrder(orderId, resolvedSearchParams.payment, t);

  return (
    <>
      <PublicHeader active="store" />
      <main className="app-container min-h-screen pt-8">
        {data.ok ? <PaymentSummary order={data.order} paymentStatus={data.paymentStatus} t={t} /> : <Unavailable message={data.message} t={t} />}
      </main>
      <PublicFooter />
    </>
  );
}

function PaymentSummary({ order, paymentStatus, t }: { order: Order; paymentStatus?: string; t: T }) {
  const itemsSubtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  const isCashOnDelivery = order.paymentMethod === "CASH_ON_DELIVERY";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <section className="panel p-6 text-start">
        <p className="chip px-4 py-2 text-sm">{t.paymentChip}</p>
        <h1 className="mt-4 text-3xl font-black text-primary">{t.paymentOrderHeading(order.id.slice(0, 8))}</h1>
        <p className="mt-3 leading-8 text-on-surface-variant">{t.paymentDesc}</p>

        {paymentStatus === "success" ? (
          <p className="mt-5 rounded-2xl bg-primary-container/40 px-5 py-4 font-bold text-primary">{t.paymentSuccessNote}</p>
        ) : null}

        {paymentStatus === "cancelled" ? (
          <p className="mt-5 rounded-2xl bg-error-container/60 px-5 py-4 font-bold text-error">{t.paymentCancelledNote}</p>
        ) : null}

        {isCashOnDelivery ? (
          <p className="mt-5 rounded-2xl bg-primary-container/40 px-5 py-4 font-bold text-primary">{t.paymentCodNote}</p>
        ) : null}

        <div className="mt-8 grid gap-4">
          {order.items.map((item) => {
            const selectedAddons = item.selectedAddons ?? [];

            return (
            <article key={item.id} className="rounded-2xl border border-outline-variant/20 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-on-surface">{item.product?.title ?? t.paymentDefaultProduct}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">{t.checkoutQty(item.quantity)}</p>
                  {selectedAddons.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedAddons.map((addon) => (
                        <span key={addon.id} className="rounded-full bg-primary-container/35 px-3 py-1 text-xs font-black text-primary">
                          {addon.name} + {formatPrice(Number(addon.price), t.currency, t.paymentFreeShipping, t.numberLocale)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <strong className="text-lg text-primary">{formatPrice(Number(item.unitPrice) * item.quantity, t.currency, t.paymentFreeShipping, t.numberLocale)}</strong>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <aside className="panel h-fit p-6 text-start">
        <h2 className="text-xl font-black text-on-surface">{t.paymentSummaryTitle}</h2>
        <div className="mt-5 grid gap-3">
          <SummaryRow label={t.paymentOrderStatus} value={formatOrderStatus(order.status, t)} />
          <SummaryRow label={t.paymentMethod} value={isCashOnDelivery ? t.paymentCodMethod : t.paymentOnlineMethod} />
          <SummaryRow label={t.checkoutSubtotal} value={formatPrice(itemsSubtotal, t.currency, t.paymentFreeShipping, t.numberLocale)} />
          <SummaryRow label={t.paymentShipping(formatShippingCarrier(order.shippingCarrier, t))} value={formatPrice(shippingFee, t.currency, t.paymentFreeShipping, t.numberLocale)} />
          {discountAmount > 0 ? <SummaryRow label={t.paymentDiscount(order.discountCode ?? t.paymentDefaultDiscountCode)} value={`- ${formatPrice(discountAmount, t.currency, t.paymentFreeShipping, t.numberLocale)}`} valueClassName="text-red-600" /> : null}
          <div className="flex items-center justify-between rounded-2xl bg-primary-container/30 p-4">
            <span className="font-black text-on-surface">{t.paymentTotal}</span>
            <span className="text-2xl font-black text-primary">{formatPrice(Number(order.total), t.currency, t.paymentFreeShipping, t.numberLocale)}</span>
          </div>
        </div>
        {isCashOnDelivery ? (
          <Link className="primary-button mt-6 w-full py-3 text-center" href="/orders">
            {t.paymentViewOrders}
          </Link>
        ) : (
          <PaymentActions orderId={order.id} />
        )}
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, valueClassName = "text-on-surface" }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold text-on-surface-variant">{label}</span>
      <span className={`font-black ${valueClassName}`}>{value}</span>
    </div>
  );
}

function Unavailable({ message, t }: { message: string; t: T }) {
  return (
    <section className="panel mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-2xl font-black text-primary">{t.paymentUnavailableTitle}</h1>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/checkout">
        {t.login}
      </Link>
    </section>
  );
}

async function loadOrder(orderId: string, paymentStatus: string | undefined, t: T): Promise<OrderData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      message: t.paymentLoginFirst,
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
      message: error instanceof ApiError ? error.message : t.paymentLoadFailed,
    };
  }
}

function formatPrice(value: number, currency: string, freeLabel: string, locale = "ar-SA") {
  if (value === 0) {
    return freeLabel;
  }

  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatShippingCarrier(carrier: ShippingCarrier | null | undefined, t: T) {
  if (!carrier) return t.paymentShippingUnset;
  const labels: Record<ShippingCarrier, string> = {
    spl: t.paymentShippingCarrierSpl,
    smsa: t.paymentShippingCarrierSmsa,
    aramex: t.paymentShippingCarrierAramex,
    pickup: t.paymentShippingCarrierPickup,
  };
  return labels[carrier];
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
