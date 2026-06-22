import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ApiError, getOrder, Order } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { PrintButtons } from "../PrintButtons";

type Props = { params: Promise<{ orderId: string }> };

export default async function InvoicePage({ params }: Props) {
  const t = await getT();
  const { orderId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;
  if (!token) return <p className="p-8 text-center">{t.unauthorized}</p>;

  let order: Order;
  try {
    order = await getOrder(orderId, token);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    return <p className="p-8 text-center">{t.orderLoadError}</p>;
  }

  const vendor = order.items[0]?.product?.vendor;
  const itemsSubtotal = order.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  const total = Number(order.total);

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          .no-print { display: none !important; }
        }
        #print-root { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
        .inv-page { max-width: 720px; margin: 0 auto; padding: 32px; color: #111; }
        .inv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 24px; }
        .inv-store-name { font-size: 22px; font-weight: 900; color: #1a1a2e; }
        .inv-store-sub { font-size: 12px; color: #666; margin-top: 4px; }
        .inv-label { font-size: 28px; font-weight: 900; color: #1a1a2e; }
        .inv-meta { font-size: 12px; color: #555; margin-top: 6px; line-height: 1.7; }
        .inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .inv-party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 8px; }
        .inv-party-name { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
        .inv-party-info { font-size: 12px; color: #555; line-height: 1.7; }
        .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .inv-th { background: #1a1a2e; color: #fff; padding: 10px 12px; font-size: 12px; font-weight: 700; }
        .inv-td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        .inv-totals { margin-right: auto; width: 280px; }
        .inv-total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .inv-grand { border-top: 2px solid #1a1a2e; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 900; color: #1a1a2e; }
        .inv-discount { color: #c00; }
        .inv-footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
      `}</style>

      <div id="print-root">
        <div className="inv-page">
          <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <PrintButtons />
          </div>

          <div className="inv-header">
            <div>
              <div className="inv-store-name">{vendor?.name ?? t.defaultStoreName2}</div>
              {vendor?.storeUsername && <div className="inv-store-sub">nmoo.store/{vendor.storeUsername}</div>}
              {vendor?.phoneNumber && <div className="inv-store-sub">{vendor.phoneNumber}</div>}
            </div>
            <div>
              <div className="inv-label">{t.invoiceLabel}</div>
              <div className="inv-meta">
                <div>{t.invoiceNumber} #{order.id.slice(0, 8).toUpperCase()}</div>
                <div>{t.invoiceDate} {formatDate(order.createdAt, t.numberLocale)}</div>
                <div>{t.statusLabel2} {formatStatus(order.status, t)}</div>
              </div>
            </div>
          </div>

          <div className="inv-parties">
            <div>
              <div className="inv-party-label">{t.supplierLabel}</div>
              <div className="inv-party-name">{vendor?.name ?? "—"}</div>
              <div className="inv-party-info">{vendor?.email}</div>
            </div>
            <div>
              <div className="inv-party-label">{t.buyerLabel}</div>
              <div className="inv-party-name">{order.buyer?.name ?? "—"}</div>
              <div className="inv-party-info">
                {order.buyer?.email}
                {order.buyer?.phoneNumber && <><br />{order.buyer.phoneNumber}</>}
                {[order.buyer?.street, order.buyer?.district, order.buyer?.city, order.buyer?.region, order.buyer?.country]
                  .filter(Boolean).join(t.addressSeparator)}
              </div>
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th className="inv-th" style={{ textAlign: "start" }}>{t.invProductColumn}</th>
                <th className="inv-th" style={{ textAlign: "center" }}>{t.quantityColumn}</th>
                <th className="inv-th" style={{ textAlign: "end" }}>{t.unitPriceColumn}</th>
                <th className="inv-th" style={{ textAlign: "end" }}>{t.totalColumn}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="inv-td">
                    <div style={{ fontWeight: 700 }}>{item.product?.title ?? t.unknownProduct}</div>
                    {(item.selectedAddons ?? []).map((a) => (
                      <div key={a.id} style={{ fontSize: 11, color: "#666" }}>+ {a.name} ({formatPrice(Number(a.price), t.currency, t.numberLocale)})</div>
                    ))}
                  </td>
                  <td className="inv-td" style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td className="inv-td" style={{ textAlign: "end" }}>{formatPrice(Number(item.unitPrice), t.currency, t.numberLocale)}</td>
                  <td className="inv-td" style={{ textAlign: "end", fontWeight: 700 }}>{formatPrice(Number(item.unitPrice) * item.quantity, t.currency, t.numberLocale)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="inv-total-row"><span>{t.subtotalLabel2}</span><span>{formatPrice(itemsSubtotal, t.currency, t.numberLocale)}</span></div>
            <div className="inv-total-row"><span>{t.shippingLabel3} ({order.shippingCarrier ?? "—"})</span><span>{formatPrice(shippingFee, t.currency, t.numberLocale)}</span></div>
            {discountAmount > 0 && (
              <div className="inv-total-row inv-discount"><span>{t.discountLabel2} ({order.discountCode ?? "—"})</span><span>- {formatPrice(discountAmount, t.currency, t.numberLocale)}</span></div>
            )}
            <div className="inv-total-row inv-grand"><span>{t.grandTotalLabel}</span><span>{formatPrice(total, t.currency, t.numberLocale)}</span></div>
          </div>

          <div className="inv-footer">
            {t.paymentMethodLabel} {order.paymentMethod === "CASH_ON_DELIVERY" ? t.cashOnDelivery : t.onlinePayment} — {t.invoiceThankYou}
          </div>
        </div>
      </div>
    </>
  );
}

function formatPrice(v: number, currency: string, locale = "ar-SA") {
  return `${v.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function formatDate(v: string, locale = "ar-SA") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(v));
}

import type { Translations } from "@/lib/i18n/types";

function formatStatus(s: Order["status"], t: Translations) {
  const m: Record<string, string> = {
    PENDING: t.statusPending,
    PAID: t.statusPaid,
    PROCESSING: t.statusProcessing,
    SHIPPED: t.statusShipped,
    COMPLETED: t.statusCompleted,
    CANCELLED: t.statusCancelled,
  };
  return m[s] ?? s;
}
