"use client";
import { useState } from "react";

type PrintType = "invoices" | "labels";

export function BulkPrintButton({ type, query }: { type: PrintType; query: string }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handlePrint() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const url = `/dashboard/orders/print-${type}?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low"
      >
        {type === "invoices" ? "🧾 جميع الفواتير" : "📦 جميع البوليصات"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-7xl rounded-3xl bg-surface p-6 shadow-xl" dir="rtl">
            <h2 className="text-lg font-black text-on-surface">
              {type === "invoices" ? "طباعة الفواتير" : "طباعة البوليصات"}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">حدد نطاق الطلبات التي تريد طباعتها</p>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">من تاريخ</span>
                <input
                  type="date"
                  className="input-field px-4 py-3 text-right"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">إلى تاريخ</span>
                <input
                  type="date"
                  className="input-field px-4 py-3 text-right"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              {!from && !to && (
                <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                  بدون تحديد تاريخ سيتم طباعة جميع الطلبات
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 rounded-2xl bg-primary py-3 font-bold text-white"
              >
                طباعة
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-2xl border border-outline-variant py-3 font-bold text-on-surface"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
