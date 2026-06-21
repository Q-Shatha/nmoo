import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ApiError, getOrder, Order } from "@/lib/api";
import { PrintButtons } from "../PrintButtons";

type Props = { params: Promise<{ orderId: string }> };

export default async function LabelPage({ params }: Props) {
  const { orderId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;
  if (!token) return <p className="p-8 text-center">غير مصرح</p>;

  let order: Order;
  try {
    order = await getOrder(orderId, token);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    return <p className="p-8 text-center">تعذر تحميل الطلب</p>;
  }

  const vendor = order.items[0]?.product?.vendor;
  const buyerAddress = [
    order.buyer?.street,
    order.buyer?.district,
    order.buyer?.city,
    order.buyer?.region,
    order.buyer?.country,
  ].filter(Boolean).join("، ");

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          .no-print { display: none !important; }
        }
        #print-root { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
        .lbl-wrap { max-width: 420px; margin: 0 auto; padding: 24px; }
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
        <div className="lbl-wrap">
          <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <PrintButtons />
          </div>

          <div className="lbl-card">
            <div className="lbl-header">
              <div className="lbl-title">بوليصة شحن</div>
              <div className="lbl-order">#{order.id.slice(0, 8).toUpperCase()}</div>
            </div>

            <div className="lbl-body">
              <div className="lbl-section">
                <div className="lbl-section-label">المُرسَل إليه</div>
                <div className="lbl-big-name">{order.buyer?.name ?? "—"}</div>
                <div className="lbl-address">{buyerAddress || "العنوان غير محدد"}</div>
                {order.buyer?.phoneNumber && <div className="lbl-phone">{order.buyer.phoneNumber}</div>}
              </div>

              <div className="lbl-section">
                <div className="lbl-section-label">المُرسِل</div>
                <div className="lbl-big-name">{vendor?.name ?? "المتجر"}</div>
                {vendor?.phoneNumber && <div className="lbl-phone">{vendor.phoneNumber}</div>}
              </div>

              <div className="lbl-section">
                <div className="lbl-section-label">المحتويات</div>
                <div className="lbl-items">
                  {order.items.map((item) => (
                    <div key={item.id}>• {item.product?.title ?? "منتج"} × {item.quantity}</div>
                  ))}
                </div>
              </div>

              <div className="lbl-section">
                <div className="lbl-section-label">الشحن</div>
                {order.shippingCarrier && <span className="lbl-carrier">{order.shippingCarrier}</span>}
                <div className="lbl-date">تاريخ الطلب: {formatDate(order.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatDate(v: string) {
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(v));
}
