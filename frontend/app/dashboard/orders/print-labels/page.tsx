import { cookies } from "next/headers";
import { ApiError, getOrders, Order } from "@/lib/api";
import { PrintButtons } from "../[orderId]/PrintButtons";
import { getT } from "@/lib/i18n/server";

type Props = { searchParams?: Promise<{ q?: string; from?: string; to?: string }> };

export default async function PrintAllLabelsPage({ searchParams }: Props) {
  const t = await getT();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.q?.trim() ?? "";
  const fromDate = resolvedSearchParams.from ? new Date(resolvedSearchParams.from) : null;
  const toDate = resolvedSearchParams.to ? new Date(resolvedSearchParams.to + "T23:59:59") : null;

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
      [o.id, o.id.slice(0, 8), o.buyer?.name, o.buyer?.email]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }
  if (fromDate) orders = orders.filter((o) => new Date(o.createdAt) >= fromDate);
  if (toDate) orders = orders.filter((o) => new Date(o.createdAt) <= toDate);

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; break-after: page; }
          .page-break:last-child { page-break-after: avoid; break-after: avoid; }
        }
        #print-root { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #111; }
        .lbl-wrap { max-width: 420px; margin: 32px auto; padding: 0 24px; }
        .lbl-card { border: 2px solid #000; border-radius: 8px; overflow: hidden; }
        .lbl-header { background: #1a1a2e; color: #fff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
        .lbl-title { font-size: 16px; font-weight: 900; }
        .lbl-order { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
        .lbl-body { padding: 18px; }
        .lbl-section { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px dashed #ccc; }
        .lbl-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .lbl-section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 8px; }
        .lbl-big-name { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
        .lbl-address { font-size: 13px; line-height: 1.8; color: #333; }
        .lbl-phone { font-size: 13px; font-weight: 700; color: #333; margin-top: 4px; }
        .lbl-items { font-size: 12px; color: #444; line-height: 1.8; }
        .lbl-carrier { display: inline-block; background: #f0f0f0; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; }
        .lbl-date { font-size: 11px; color: #888; margin-top: 4px; }
      `}</style>

      <div id="print-root">
        <div className="no-print" style={{ display: "flex", gap: 12, padding: "24px 32px" }}>
          <PrintButtons />
          <span style={{ alignSelf: "center", fontSize: 13, color: "#666" }}>{t.labelCount(orders.length)}</span>
        </div>

        {orders.map((order, idx) => {
          const vendor = order.items[0]?.product?.vendor;
          const buyerAddress = [
            order.buyer?.street,
            order.buyer?.district,
            order.buyer?.city,
            order.buyer?.region,
            order.buyer?.country,
          ].filter(Boolean).join(t.addressSeparator);

          return (
            <div key={order.id} className={idx < orders.length - 1 ? "page-break" : ""}>
              <div className="lbl-wrap">
                <div className="lbl-card">
                  <div className="lbl-header">
                    <div className="lbl-title">{t.shippingLabelTitle}</div>
                    <div className="lbl-order">#{order.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                  <div className="lbl-body">
                    <div className="lbl-section">
                      <div className="lbl-section-label">{t.recipientLabel}</div>
                      <div className="lbl-big-name">{order.buyer?.name ?? "—"}</div>
                      <div className="lbl-address">{buyerAddress || t.noAddressLabel}</div>
                      {order.buyer?.phoneNumber && <div className="lbl-phone">{order.buyer.phoneNumber}</div>}
                    </div>
                    <div className="lbl-section">
                      <div className="lbl-section-label">{t.senderLabel}</div>
                      <div className="lbl-big-name">{vendor?.name ?? t.defaultStoreName2}</div>
                      {vendor?.phoneNumber && <div className="lbl-phone">{vendor.phoneNumber}</div>}
                    </div>
                    <div className="lbl-section">
                      <div className="lbl-section-label">{t.contentsLabel}</div>
                      <div className="lbl-items">
                        {order.items.map((item) => (
                          <div key={item.id}>• {item.product?.title ?? t.unknownProduct} × {item.quantity}</div>
                        ))}
                      </div>
                    </div>
                    <div className="lbl-section">
                      <div className="lbl-section-label">{t.shippingInfoLabel}</div>
                      {order.shippingCarrier && <span className="lbl-carrier">{order.shippingCarrier}</span>}
                      <div className="lbl-date">{t.orderDateLabel2} {formatDate(order.createdAt, t.numberLocale)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function formatDate(v: string, locale = "ar-SA") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(v));
}
