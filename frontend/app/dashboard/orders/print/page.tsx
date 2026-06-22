import { cookies } from "next/headers";
import { ApiError, getOrders, Order } from "@/lib/api";
import { formatOrderStatus, statusClass } from "../../DashboardShell";
import { PrintButtons } from "../[orderId]/PrintButtons";
import { getT } from "@/lib/i18n/server";

type Props = { searchParams?: Promise<{ q?: string }> };

export default async function PrintAllOrdersPage({ searchParams }: Props) {
  const t = await getT();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.q?.trim() ?? "";

  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;
  if (!token) return <p className="p-8 text-center">{t.unauthorized}</p>;

  let orders: Order[];
  try {
    orders = await getOrders(token);
  } catch (e) {
    return <p className="p-8 text-center">{t.ordersLoadError}{e instanceof ApiError ? `: ${e.message}` : ""}</p>;
  }

  if (query) {
    const q = query.toLowerCase();
    orders = orders.filter((o) =>
      [o.id, o.id.slice(0, 8), o.buyer?.name, o.buyer?.email, formatOrderStatus(o.status)]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }

  const grandTotal = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          .no-print { display: none !important; }
        }
        #print-root { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #111; }
        .po-page { max-width: 960px; margin: 0 auto; padding: 32px; }
        .po-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 24px; }
        .po-title { font-size: 22px; font-weight: 900; color: #1a1a2e; }
        .po-meta { font-size: 12px; color: #666; text-align: left; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1a1a2e; color: #fff; padding: 10px 14px; font-size: 12px; font-weight: 700; text-align: right; }
        td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 13px; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) td { background: #fafafa; }
        .order-num { font-family: monospace; font-weight: 900; color: #1a1a2e; }
        .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .po-footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #1a1a2e; padding-top: 16px; }
        .po-count { font-size: 13px; color: #555; }
        .po-total { font-size: 18px; font-weight: 900; color: #1a1a2e; }
      `}</style>

      <div id="print-root">
        <div className="po-page">
          <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <PrintButtons />
          </div>

          <div className="po-header">
            <div className="po-title">
              {t.printOrdersTitle(query || null)}
            </div>
            <div className="po-meta">
              <div>{t.printDate} {formatDate(new Date().toISOString(), t.numberLocale)}</div>
              <div>{t.printCount(orders.length)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>{t.printOrderNumber}</th>
                <th>{t.customer}</th>
                <th>{t.printProducts}</th>
                <th>{t.date}</th>
                <th>{t.printPaymentMethod}</th>
                <th>{t.status}</th>
                <th style={{ textAlign: "start" }}>{t.amount}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><span className="order-num">#{order.id.slice(0, 8).toUpperCase()}</span></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{order.buyer?.name ?? "—"}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{order.buyer?.email}</div>
                  </td>
                  <td style={{ fontSize: 12, color: "#555" }}>
                    {order.items.map((item) => (
                      <div key={item.id}>• {item.product?.title ?? "منتج"} × {item.quantity}</div>
                    ))}
                  </td>
                  <td style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>{formatDate(order.createdAt, t.numberLocale)}</td>
                  <td style={{ fontSize: 12 }}>
                    {order.paymentMethod === "CASH_ON_DELIVERY" ? t.cashOnDelivery : t.onlinePayment}
                  </td>
                  <td>
                    <span className={`status-badge ${statusClass(order.status)}`}>{formatOrderStatus(order.status)}</span>
                  </td>
                  <td style={{ fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>
                    {formatPrice(Number(order.total), t.currency, t.numberLocale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="po-footer">
            <div className="po-count">{t.printCount(orders.length)}</div>
            <div className="po-total">{t.printGrandTotal(formatPrice(grandTotal, t.currency, t.numberLocale))}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatPrice(v: number, currency = "ر.س", locale = "ar-SA") {
  return `${v.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function formatDate(v: string, locale = "ar-SA") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(v));
}
