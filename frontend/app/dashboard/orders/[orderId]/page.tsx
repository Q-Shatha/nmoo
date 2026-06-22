import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getOrder, Order } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../../../components/PublicFooter";
import { OrderStatusEditor } from "./OrderStatusEditor";

type DashboardOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function DashboardOrderPage({ params }: DashboardOrderPageProps) {
  const t = await getT();
  const { orderId } = await params;
  const data = await loadOrder(orderId, t.orderDetailNeedsVendorLogin, t.orderDetailLoadError);

  if (!data.ok) {
    return <Unavailable message={data.message} needsLogin={data.needsLogin} backToOrders={t.backToOrdersBtn} needsLoginTitle={t.needsLoginOrder} loginBtn={t.loginToSeeOrder} cantOpenOrder={t.cantOpenOrder} loginLink="/login?next=/dashboard" ordersLink="/dashboard/orders" />;
  }

  const order = data.order;
  const itemsSubtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-6 p-5 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-sm font-bold text-primary underline-offset-4 hover:underline" href="/dashboard/orders">
              {t.backToOrders}
            </Link>
            <h1 className="mt-2 text-3xl font-black text-on-surface">
              {t.orderDetails(order.id.slice(0, 8))}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">{t.lastUpdated(formatDate(order.updatedAt, t.numberLocale))}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${statusClass(order.status)}`}>{formatOrderStatus(order.status, t)}</span>
            <a
              href={`/dashboard/orders/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low"
            >
              🧾 {t.printOrder}
            </a>
            <a
              href={`/dashboard/orders/${order.id}/label`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low"
            >
              📦 {t.printLabel}
            </a>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="grid gap-6">
            <OrderStatusEditor orderId={order.id} initialStatus={order.status} />
            <OrderItems order={order} orderItemsTitle={t.orderItems} unknownProduct={t.unknownProduct} productDeleted={t.productDeleted} quantityLabel={t.quantityLabel} unitPriceLabel={t.unitPriceLabel} currency={t.currency} numberLocale={t.numberLocale} />
          </div>

          <aside className="grid gap-6">
            <BuyerCard order={order} buyerData={t.buyerData} buyerName={t.buyerName} buyerEmail={t.buyerEmail} orderNumberLabel={t.orderNumberLabel} orderDateLabel={t.orderDateLabel} numberLocale={t.numberLocale} />
            <OrderSummary itemsSubtotal={itemsSubtotal} shippingFee={shippingFee} discountAmount={discountAmount} total={Number(order.total)} order={order} subtotalLabel={t.subtotalLabel} shippingLabel2={t.shippingLabel2} discountLabel={t.discountLabel} totalLabel={t.totalLabel} currency={t.currency} unspecified={t.unspecified} discountCodeFallback={t.discountCodeFallback} orderSummaryTitle={t.orderSummaryTitle} numberLocale={t.numberLocale} />
          </aside>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}

function OrderItems({ order, orderItemsTitle, unknownProduct, productDeleted, quantityLabel, unitPriceLabel, currency, numberLocale }: {
  order: Order;
  orderItemsTitle: string;
  unknownProduct: string;
  productDeleted: string;
  quantityLabel: (qty: number) => string;
  unitPriceLabel: (price: string) => string;
  currency: string;
  numberLocale: string;
}) {
  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5">
        <h2 className="text-xl font-black text-on-surface">{orderItemsTitle}</h2>
      </div>
      <div className="divide-y divide-outline-variant/15">
        {order.items.map((item) => {
          const imageUrl = item.product?.imageUrl || item.product?.images?.[0]?.url || "/nmoo-logo.png";
          const selectedAddons = item.selectedAddons ?? [];

          return (
            <article key={item.id} className="grid gap-4 p-5 sm:grid-cols-[96px_1fr_auto] sm:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-surface-container-low">
                <Image className="object-cover" alt={item.product?.title ?? unknownProduct} src={imageUrl} fill sizes="96px" unoptimized />
              </div>
              <div className="text-start">
                <h3 className="text-lg font-black text-on-surface">{item.product?.title ?? productDeleted}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{quantityLabel(item.quantity)}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{unitPriceLabel(formatPrice(Number(item.unitPrice), currency, numberLocale))}</p>
                {selectedAddons.length > 0 ? (
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {selectedAddons.map((addon) => (
                      <span key={addon.id} className="rounded-full bg-primary-container/35 px-3 py-1 text-xs font-black text-primary">
                        {addon.name} + {formatPrice(Number(addon.price), currency, numberLocale)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <strong className="text-xl text-primary">{formatPrice(Number(item.unitPrice) * item.quantity, currency, numberLocale)}</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BuyerCard({ order, buyerData, buyerName, buyerEmail, orderNumberLabel, orderDateLabel, numberLocale }: {
  order: Order;
  buyerData: string;
  buyerName: string;
  buyerEmail: string;
  orderNumberLabel: string;
  orderDateLabel: string;
  numberLocale: string;
}) {
  return (
    <section className="dashboard-panel p-6 text-start">
      <h2 className="text-xl font-black text-on-surface">{buyerData}</h2>
      <div className="mt-5 grid gap-3">
        <Info label={buyerName} value={order.buyer?.name} />
        <Info label={buyerEmail} value={order.buyer?.email} />
        <Info label={orderNumberLabel} value={order.id} />
        <Info label={orderDateLabel} value={formatDate(order.createdAt, numberLocale)} />
      </div>
    </section>
  );
}

function OrderSummary({ itemsSubtotal, shippingFee, discountAmount, total, order, subtotalLabel, shippingLabel2, discountLabel, totalLabel, currency, unspecified, discountCodeFallback, orderSummaryTitle, numberLocale }: {
  itemsSubtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  order: Order;
  subtotalLabel: string;
  shippingLabel2: (carrier: string) => string;
  discountLabel: (code: string) => string;
  totalLabel: string;
  currency: string;
  unspecified: string;
  discountCodeFallback: string;
  orderSummaryTitle: string;
  numberLocale: string;
}) {
  return (
    <section className="dashboard-panel p-6 text-start">
      <h2 className="text-xl font-black text-on-surface">{orderSummaryTitle}</h2>
      <div className="mt-5 grid gap-3 border-b border-outline-variant/20 pb-5">
        <SummaryRow label={subtotalLabel} value={formatPrice(itemsSubtotal, currency, numberLocale)} />
        <SummaryRow label={shippingLabel2(order.shippingCarrier ?? unspecified)} value={formatPrice(shippingFee, currency, numberLocale)} />
        {discountAmount > 0 ? <SummaryRow label={discountLabel(order.discountCode ?? discountCodeFallback)} value={`- ${formatPrice(discountAmount, currency, numberLocale)}`} valueClassName="text-red-600" /> : null}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary-container/30 p-4">
        <span className="font-black text-on-surface">{totalLabel}</span>
        <span className="text-2xl font-black text-primary">{formatPrice(total, currency, numberLocale)}</span>
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

function SummaryRow({ label, value, valueClassName = "text-on-surface" }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold text-on-surface-variant">{label}</span>
      <span className={`font-black ${valueClassName}`}>{value}</span>
    </div>
  );
}

function Unavailable({ message, needsLogin, backToOrders, needsLoginTitle, loginBtn, cantOpenOrder, loginLink, ordersLink }: {
  message: string;
  needsLogin: boolean;
  backToOrders: string;
  needsLoginTitle: string;
  loginBtn: string;
  cantOpenOrder: string;
  loginLink: string;
  ordersLink: string;
}) {
  return (
    <main className="min-h-screen bg-background p-6 text-on-surface">
      <section className="dashboard-panel mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-black text-primary">{needsLogin ? needsLoginTitle : cantOpenOrder}</h1>
        <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
        <Link className="primary-button mt-6 px-6 py-3" href={needsLogin ? loginLink : ordersLink}>
          {needsLogin ? loginBtn : backToOrders}
        </Link>
      </section>
    </main>
  );
}

async function loadOrder(orderId: string, needsVendorLoginMsg: string, loadErrorMsg: string): Promise<{ ok: true; order: Order } | { ok: false; message: string; needsLogin: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      needsLogin: true,
      message: needsVendorLoginMsg,
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
      message: error instanceof ApiError ? error.message : loadErrorMsg,
    };
  }
}

function formatPrice(value: number, currency: string, locale = "ar-SA") {
  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDate(value: string, locale = "ar-SA") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

import type { Translations } from "@/lib/i18n/types";

function formatOrderStatus(status: Order["status"], t: Translations) {
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
