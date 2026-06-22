"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { FiEdit3, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { ApiError, createDiscountCode, deleteDiscountCode, DiscountCode, DiscountCodeInput, DiscountType, Product, updateDiscountCode } from "@/lib/api";
import { DashboardAccordion } from "./DashboardAccordion";
import { useI18n } from "@/lib/i18n/context";

function ProductMultiSelect({
  products,
  selected,
  onChange,
}: {
  products: Product[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const { t } = useI18n();

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  if (products.length === 0) {
    return <p className="py-2 text-sm text-on-surface-variant">{t.noProductsAvailable}</p>;
  }

  return (
    <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-2xl border border-outline-variant bg-surface p-2">
      {products.map((p) => (
        <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold text-on-surface hover:bg-surface-container">
          <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="accent-primary" />
          {p.title}
        </label>
      ))}
      {selected.length === 0 && (
        <p className="px-2 py-1 text-xs italic text-on-surface-variant">{t.allProductsDefault}</p>
      )}
    </div>
  );
}

const emptyForm: DiscountCodeInput = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: 10,
  enabled: true,
  maxUses: undefined,
  maxUsesPerUser: 1,
};

export function DiscountCodeManager({ initialCodes, products }: { initialCodes: DiscountCode[]; products: Product[] }) {
  const { t } = useI18n();
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
      setMessage(t.discountSaved);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.discountSaveError);
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
      productIds: code.products?.map((p) => p.product.id) ?? [],
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
    <section id="discounts" className="dashboard-panel p-4 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-black text-on-surface">{t.discountCodesTitle}</h3>
          <p className="mt-2 text-on-surface-variant">{t.discountCodesDesc}</p>
        </div>
        <span className="chip px-4 py-2 text-sm">{t.activeCodesCount(activeCount)}</span>
      </div>

      <DashboardAccordion className="mt-6" title={editingId ? t.editDiscountCode : t.addDiscountCode2} description={t.discountFormDesc} defaultOpen>
      <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
        <Field label={t.code} className="lg:col-span-3">
          <input className="input-field" required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
        </Field>
        <Field label={t.discountTypeLabel} className="lg:col-span-2">
          <select className="input-field" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as DiscountType }))}>
            <option value="PERCENTAGE">{t.percentage}</option>
            <option value="FIXED">{t.fixedAmount}</option>
          </select>
        </Field>
        <Field label={form.type === "PERCENTAGE" ? t.percentageValue : t.amountValue} className="lg:col-span-2">
          <input className="input-field" min="0.01" max={form.type === "PERCENTAGE" ? 100 : undefined} required step="0.01" type="number" value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: Number(event.target.value) }))} />
        </Field>
        <Field label={t.totalUsageLimit} className="lg:col-span-2">
          <input className="input-field" min="1" placeholder={t.noLimit} type="number" value={form.maxUses ?? ""} onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value ? Number(event.target.value) : undefined }))} />
        </Field>
        <Field label={t.perCustomerLimit} className="lg:col-span-2">
          <input className="input-field" min="1" placeholder={t.noLimit} type="number" value={form.maxUsesPerUser ?? ""} onChange={(event) => setForm((current) => ({ ...current, maxUsesPerUser: event.target.value ? Number(event.target.value) : undefined }))} />
        </Field>
        <label className="flex items-center gap-2 rounded-2xl bg-surface-container-low px-4 py-3 font-bold text-on-surface lg:col-span-1">
          <input checked={Boolean(form.enabled)} type="checkbox" onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} />
          {t.enabledShort}
        </label>
        <Field label={t.shortDescription} className="lg:col-span-4">
          <input className="input-field" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </Field>
        <Field label={t.startsAt} className="lg:col-span-3">
          <input className="input-field" type="datetime-local" value={form.startsAt ?? ""} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value || undefined }))} />
        </Field>
        <Field label={t.expiresAt} className="lg:col-span-3">
          <input className="input-field" type="datetime-local" value={form.expiresAt ?? ""} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value || undefined }))} />
        </Field>

        {/* Product selector — full row */}
        <div className="lg:col-span-12">
          <Field label={t.applyToProducts}>
            <ProductMultiSelect
              products={products}
              selected={form.productIds ?? []}
              onChange={(ids) => setForm((c) => ({ ...c, productIds: ids }))}
            />
          </Field>
        </div>

        {/* Submit row — full width */}
        <div className="flex items-center gap-3 lg:col-span-12">
          <button className="primary-button px-8 py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {editingId ? t.update : t.add}
          </button>
          {editingId ? (
            <button className="secondary-button px-4 py-3" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              {t.cancel}
            </button>
          ) : null}
        </div>
      </form>
      </DashboardAccordion>

      {message ? <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface-variant">{message}</p> : null}

      <div className="mt-6 grid gap-3 md:hidden">
        {codes.map((code) => (
          <article key={code.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-start shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${code.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{code.enabled ? t.activeStatus : t.stoppedStatus}</span>
              <div>
                <h4 className="text-lg font-black text-on-surface">{code.code}</h4>
                <p className="mt-1 text-sm font-bold text-red-600">{formatDiscount(code, t.currency, t.numberLocale)}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {code.products && code.products.length > 0 && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-on-surface-variant shrink-0">{t.productsColumn}</span>
                  <span className="flex flex-wrap justify-end gap-1">
                    {code.products.map((p) => (
                      <span key={p.product.id} className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-bold">{p.product.title}</span>
                    ))}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">{t.usageColumn}</span>
                <span className="font-bold text-on-surface">{code._count?.redemptions ?? 0} / {code.maxUses ?? t.noLimit}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">{t.perCustomerColumn}</span>
                <span className="font-bold text-on-surface">{code.maxUsesPerUser ?? t.noLimit}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button className="secondary-button h-10 p-0 text-[0px]" type="button" title={t.edit} aria-label={t.editCode(code.code)} onClick={() => startEdit(code)}>
                <FiEdit3 aria-hidden="true" className="h-5 w-5" />
              </button>
              <button className="secondary-button h-10 p-0 text-[0px]" type="button" title={code.enabled ? t.disableAction : t.enableAction} aria-label={t.toggleCode(code.enabled ? t.disableAction : t.enableAction, code.code)} onClick={() => toggleEnabled(code)}>
                {code.enabled ? <FiEyeOff aria-hidden="true" className="h-5 w-5" /> : <FiEye aria-hidden="true" className="h-5 w-5" />}
              </button>
              <button className="flex h-10 items-center justify-center rounded-full bg-red-100 p-0 text-[0px] font-bold text-red-700" type="button" title={t.delete} aria-label={t.deleteCode(code.code)} onClick={() => removeCode(code)}>
                <FiTrash2 aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </article>
        ))}
        {codes.length === 0 ? <div className="p-8 text-center font-bold text-on-surface-variant">{t.noDiscountsYet}</div> : null}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-start">
          <thead>
            <tr className="bg-surface-container-low/60">
              {[t.code, t.discountValue, t.productsColumn, t.status, t.usageColumn, t.perCustomerColumn, t.actionsColumn].map((heading) => (
                <th key={heading} className="border-b border-outline-variant/15 px-4 py-3 text-start text-sm font-bold text-on-surface-variant">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {codes.map((code) => (
              <tr key={code.id}>
                <td className="px-4 py-4 font-black text-on-surface">{code.code}</td>
                <td className="px-4 py-4 font-bold text-red-600">{formatDiscount(code, t.currency, t.numberLocale)}</td>
                <td className="px-4 py-4 text-sm text-on-surface-variant">
                  {code.products && code.products.length > 0
                    ? <span className="flex flex-wrap gap-1">{code.products.map((p) => <span key={p.product.id} className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-bold">{p.product.title}</span>)}</span>
                    : <span className="italic">{t.allProducts}</span>}
                </td>
                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-sm font-bold ${code.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{code.enabled ? t.activeStatus : t.stoppedStatus}</span></td>
                <td className="px-4 py-4 text-on-surface-variant">{code._count?.redemptions ?? 0} / {code.maxUses ?? t.noLimit}</td>
                <td className="px-4 py-4 text-on-surface-variant">{code.maxUsesPerUser ?? t.noLimit}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="secondary-button h-10 w-10 p-0 text-[0px]" type="button" title={t.edit} aria-label={t.editCode(code.code)} onClick={() => startEdit(code)}>
                      <FiEdit3 aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <button className="secondary-button h-10 w-10 p-0 text-[0px]" type="button" title={code.enabled ? t.disableAction : t.enableAction} aria-label={t.toggleCode(code.enabled ? t.disableAction : t.enableAction, code.code)} onClick={() => toggleEnabled(code)}>
                      {code.enabled ? <FiEyeOff aria-hidden="true" className="h-5 w-5" /> : <FiEye aria-hidden="true" className="h-5 w-5" />}
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 p-0 text-[0px] font-bold text-red-700" type="button" title={t.delete} aria-label={t.deleteCode(code.code)} onClick={() => removeCode(code)}>
                      <FiTrash2 aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 ? <div className="p-8 text-center font-bold text-on-surface-variant">{t.noDiscountsYet}</div> : null}
      </div>
    </section>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`grid gap-2 text-start ${className}`}>
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

function formatDiscount(code: DiscountCode, currency = "ر.س", locale = "ar-SA") {
  return code.type === "PERCENTAGE" ? `${Number(code.value).toLocaleString(locale)}%` : `${Number(code.value).toLocaleString(locale)} ${currency}`;
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
