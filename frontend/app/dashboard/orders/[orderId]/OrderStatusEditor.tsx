"use client";

import { useState } from "react";
import { ApiError, Order, OrderStatus, updateOrderStatus } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function OrderStatusEditor({ orderId, initialStatus }: { orderId: string; initialStatus: OrderStatus }) {
  const { t } = useI18n();
  const [status, setStatus] = useState(initialStatus);
  const [savedStatus, setSavedStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions: Array<{ value: OrderStatus; label: string }> = [
    { value: "PENDING", label: t.statusPending },
    { value: "PAID", label: t.statusPaid },
    { value: "PROCESSING", label: t.statusProcessing },
    { value: "SHIPPED", label: t.statusShipped },
    { value: "COMPLETED", label: t.statusCompleted },
    { value: "CANCELLED", label: t.statusCancelled },
  ];

  const statusLabels: Record<Order["status"], string> = {
    PENDING: t.statusPending,
    PAID: t.statusPaid,
    PROCESSING: t.statusProcessing,
    SHIPPED: t.statusShipped,
    COMPLETED: t.statusCompleted,
    CANCELLED: t.statusCancelled,
  };

  async function handleSave() {
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const order = await updateOrderStatus(orderId, status, token);
      setSavedStatus(order.status);
      setStatus(order.status);
      setMessage(t.orderStatusUpdated);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.orderStatusUpdateError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard-panel p-6 text-start">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-on-surface">{t.editOrderStatus}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t.selectStatusHint}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${statusClass(savedStatus)}`}>{statusLabels[savedStatus]}</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <select className="input-field px-4 py-3 text-start" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="primary-button px-7 py-3 disabled:opacity-60" disabled={isSaving || status === savedStatus} type="button" onClick={handleSave}>
          {isSaving ? t.savingStatus : t.saveStatus}
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
