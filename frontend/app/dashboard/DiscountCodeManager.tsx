"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { ApiError, createDiscountCode, deleteDiscountCode, DiscountCode, DiscountCodeInput, DiscountType, updateDiscountCode } from "@/lib/api";

const emptyForm: DiscountCodeInput = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: 10,
  enabled: true,
  maxUses: undefined,
  maxUsesPerUser: 1,
};

export function DiscountCodeManager({ initialCodes }: { initialCodes: DiscountCode[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [form, setForm] = useState<DiscountCodeInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const activeCount = useMemo(() => codes.filter((code) => code.enabled).length, [codes]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    const token = readCookie("nmoo_access_token");
    const payload = cleanPayload(form);

    try {
      const saved = editingId ? await updateDiscountCode(editingId, payload, token) : await createDiscountCode(payload as DiscountCodeInput, token);
      setCodes((current) => (editingId ? current.map((code) => (code.id === saved.id ? saved : code)) : [saved, ...current]));
      setForm(emptyForm);
      setEditingId(null);
      setMessage("تم حفظ كود التخفيض.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ كود التخفيض.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(code: DiscountCode) {
    setEditingId(code.id);
    setMessage("");
    setForm({
      code: code.code,
      description: code.description ?? "",
      type: code.type,
      value: Number(code.value),
      enabled: code.enabled,
      maxUses: code.maxUses ?? undefined,
      maxUsesPerUser: code.maxUsesPerUser ?? undefined,
      startsAt: toDateInput(code.startsAt),
      expiresAt: toDateInput(code.expiresAt),
    });
  }

  async function toggleEnabled(code: DiscountCode) {
    const token = readCookie("nmoo_access_token");
    const saved = await updateDiscountCode(code.id, { enabled: !code.enabled }, token);
    setCodes((current) => current.map((item) => (item.id === saved.id ? saved : item)));
  }

  async function removeCode(code: DiscountCode) {
    const token = readCookie("nmoo_access_token");
    await deleteDiscountCode(code.id, token);
    setCodes((current) => current.filter((item) => item.id !== code.id));
    if (editingId === code.id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  }

  return (
    <section id="discounts" className="dashboard-panel p-6" dir="rtl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-black text-on-surface">أكواد التخفيض</h3>
          <p className="mt-2 text-on-surface-variant">أنشئ أكواد خصم وحدد عدد استخدامها لكل عميل ولجميع العملاء.</p>
        </div>
        <span className="chip px-4 py-2 text-sm">{activeCount} كود مفعل</span>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
        <Field label="الكود" className="lg:col-span-3">
          <input className="input-field" required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
        </Field>
        <Field label="نوع الخصم" className="lg:col-span-2">
          <select className="input-field" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as DiscountType }))}>
            <option value="PERCENTAGE">نسبة</option>
            <option value="FIXED">مبلغ ثابت</option>
          </select>
        </Field>
        <Field label={form.type === "PERCENTAGE" ? "النسبة" : "المبلغ"} className="lg:col-span-2">
          <input className="input-field" min="0.01" max={form.type === "PERCENTAGE" ? 100 : undefined} required step="0.01" type="number" value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: Number(event.target.value) }))} />
        </Field>
        <Field label="إجمالي الاستخدام" className="lg:col-span-2">
          <input className="input-field" min="1" placeholder="بدون حد" type="number" value={form.maxUses ?? ""} onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value ? Number(event.target.value) : undefined }))} />
        </Field>
        <Field label="لكل عميل" className="lg:col-span-2">
          <input className="input-field" min="1" placeholder="بدون حد" type="number" value={form.maxUsesPerUser ?? ""} onChange={(event) => setForm((current) => ({ ...current, maxUsesPerUser: event.target.value ? Number(event.target.value) : undefined }))} />
        </Field>
        <label className="flex items-center gap-2 rounded-2xl bg-surface-container-low px-4 py-3 font-bold text-on-surface lg:col-span-1">
          <input checked={Boolean(form.enabled)} type="checkbox" onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} />
          مفعل
        </label>
        <Field label="وصف مختصر" className="lg:col-span-4">
          <input className="input-field" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </Field>
        <Field label="يبدأ في" className="lg:col-span-3">
          <input className="input-field" type="datetime-local" value={form.startsAt ?? ""} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value || undefined }))} />
        </Field>
        <Field label="ينتهي في" className="lg:col-span-3">
          <input className="input-field" type="datetime-local" value={form.expiresAt ?? ""} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value || undefined }))} />
        </Field>
        <div className="flex items-end gap-2 lg:col-span-2">
          <button className="primary-button w-full py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {editingId ? "تحديث" : "إضافة"}
          </button>
          {editingId ? (
            <button className="secondary-button px-4 py-3" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              إلغاء
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface-variant">{message}</p> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-right">
          <thead>
            <tr className="bg-surface-container-low/60">
              {["الكود", "الخصم", "الحالة", "الاستخدام", "الحد لكل عميل", "الإجراءات"].map((heading) => (
                <th key={heading} className="border-b border-outline-variant/15 px-4 py-3 text-sm font-bold text-on-surface-variant">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {codes.map((code) => (
              <tr key={code.id}>
                <td className="px-4 py-4 font-black text-on-surface">{code.code}</td>
                <td className="px-4 py-4 font-bold text-primary">{formatDiscount(code)}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-sm font-bold ${code.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{code.enabled ? "نشط" : "متوقف"}</span></td>
                <td className="px-4 py-4 text-on-surface-variant">{code._count?.redemptions ?? 0} / {code.maxUses ?? "بدون حد"}</td>
                <td className="px-4 py-4 text-on-surface-variant">{code.maxUsesPerUser ?? "بدون حد"}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="secondary-button px-3 py-2 text-sm" type="button" onClick={() => startEdit(code)}>تعديل</button>
                    <button className="secondary-button px-3 py-2 text-sm" type="button" onClick={() => toggleEnabled(code)}>{code.enabled ? "إيقاف" : "تفعيل"}</button>
                    <button className="rounded-full bg-red-100 px-3 py-2 text-sm font-bold text-red-700" type="button" onClick={() => removeCode(code)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 ? <div className="p-8 text-center font-bold text-on-surface-variant">لا توجد أكواد تخفيض بعد</div> : null}
      </div>
    </section>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`grid gap-2 text-right ${className}`}>
      <span className="text-sm font-bold text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function cleanPayload(input: DiscountCodeInput): Partial<DiscountCodeInput> {
  return {
    ...input,
    code: input.code.trim().toUpperCase(),
    description: input.description?.trim() || undefined,
    startsAt: input.startsAt ? new Date(input.startsAt).toISOString() : undefined,
    expiresAt: input.expiresAt ? new Date(input.expiresAt).toISOString() : undefined,
  };
}

function formatDiscount(code: DiscountCode) {
  return code.type === "PERCENTAGE" ? `${Number(code.value).toLocaleString("ar-SA")}%` : `${Number(code.value).toLocaleString("ar-SA")} ر.س`;
}

function toDateInput(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString().slice(0, 16);
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
