"use client";

import { useState } from "react";
import { ApiError, Order, OrderStatus, updateOrderStatus } from "@/lib/api";

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "بانتظار الدفع" },
  { value: "PAID", label: "مدفوع" },
  { value: "PROCESSING", label: "قيد التنفيذ" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "COMPLETED", label: "مكتمل" },
  { value: "CANCELLED", label: "ملغي" },
];

export function OrderStatusEditor({ orderId, initialStatus }: { orderId: string; initialStatus: OrderStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [savedStatus, setSavedStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const order = await updateOrderStatus(orderId, status, token);
      setSavedStatus(order.status);
      setStatus(order.status);
      setMessage("تم تحديث حالة الطلب.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر تحديث حالة الطلب.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard-panel p-6 text-right" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-on-surface">تعديل حالة الطلب</h2>
          <p className="mt-1 text-sm text-on-surface-variant">اختر الحالة الحالية للطلب ثم احفظ التغيير.</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${statusClass(savedStatus)}`}>{formatOrderStatus(savedStatus)}</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <select className="input-field px-4 py-3 text-right" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="primary-button px-7 py-3 disabled:opacity-60" disabled={isSaving || status === savedStatus} type="button" onClick={handleSave}>
          {isSaving ? "جاري الحفظ..." : "حفظ الحالة"}
        </button>
      </div>

      {message ? <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}
    </section>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
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
