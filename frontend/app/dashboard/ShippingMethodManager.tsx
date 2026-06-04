"use client";

import { FormEvent, useState } from "react";
import { FiEdit3, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { ApiError, createShippingMethod, deleteShippingMethod, ShippingMethod, updateShippingMethod } from "@/lib/api";

type ShippingDraft = {
  code: string;
  name: string;
  fee: string;
  description: string;
  eta: string;
  enabled: boolean;
};

const emptyDraft: ShippingDraft = {
  code: "",
  name: "",
  fee: "",
  description: "",
  eta: "",
  enabled: true,
};

export function ShippingMethodManager({ initialMethods }: { initialMethods: ShippingMethod[] }) {
  const [methods, setMethods] = useState(initialMethods);
  const [draft, setDraft] = useState<ShippingDraft>(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function startEdit(method: ShippingMethod) {
    setEditingId(method.id);
    setDraft({
      code: method.code,
      name: method.name,
      fee: String(method.fee),
      description: method.description ?? "",
      eta: method.eta ?? "",
      enabled: method.enabled,
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId("");
    setDraft(emptyDraft);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const input = {
        code: draft.code,
        name: draft.name,
        fee: Number(draft.fee),
        description: draft.description || undefined,
        eta: draft.eta || undefined,
        enabled: draft.enabled,
      };

      if (editingId) {
        const updated = await updateShippingMethod(editingId, input, token);
        setMethods((current) => current.map((method) => (method.id === updated.id ? updated : method)));
        setMessage("تم تحديث شركة الشحن.");
      } else {
        const created = await createShippingMethod(input, token);
        setMethods((current) => [...current, created].sort(sortMethods));
        setMessage("تمت إضافة شركة الشحن.");
      }

      resetForm();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ شركة الشحن.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(method: ShippingMethod) {
    const confirmed = window.confirm(`حذف شركة الشحن "${method.name}"؟`);

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      await deleteShippingMethod(method.id, token);
      setMethods((current) => current.filter((item) => item.id !== method.id));
      if (editingId === method.id) {
        resetForm();
      }
      setMessage("تم حذف شركة الشحن.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حذف شركة الشحن.");
    }
  }

  async function toggleEnabled(method: ShippingMethod) {
    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      const updated = await updateShippingMethod(method.id, { enabled: !method.enabled }, token);
      setMethods((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر تغيير حالة شركة الشحن.");
    }
  }

  return (
    <section id="shipping" className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-right">
        <h4 className="text-xl font-black text-on-surface">شركات الشحن</h4>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">أضف الشركات التي يستطيع متجرك الشحن من خلالها، وحدد رسوم كل شركة. هذه الخيارات تظهر للعميل في صفحة إتمام الشراء.</p>
      </div>

      <form className="grid gap-4 border-b border-outline-variant/15 p-5 text-right" dir="rtl" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-6">
          <label className="grid gap-2">
            <RequiredLabel>كود الشركة</RequiredLabel>
            <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder="spl" required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <RequiredLabel>اسم الشركة</RequiredLabel>
            <input className="input-field px-4 py-3 text-right" dir="rtl" placeholder="سبل" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="grid gap-2">
            <RequiredLabel>رسوم الشحن</RequiredLabel>
            <input className="input-field px-4 py-3 text-left" dir="ltr" min="0" required step="0.01" type="number" value={draft.fee} onChange={(event) => setDraft({ ...draft, fee: event.target.value })} />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-bold text-on-surface">مدة التوصيل</span>
            <input className="input-field px-4 py-3 text-right" dir="rtl" placeholder="2 - 5 أيام عمل" value={draft.eta} onChange={(event) => setDraft({ ...draft, eta: event.target.value })} />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">وصف مختصر</span>
          <input className="input-field px-4 py-3 text-right" dir="rtl" placeholder="مثال: شحن سريع داخل السعودية" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </label>

        <label className="flex items-center justify-end gap-2 text-sm font-bold text-on-surface">
          <span>مفعلة للعملاء</span>
          <input checked={draft.enabled} className="h-4 w-4" type="checkbox" onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {editingId ? (
            <button className="secondary-button px-6 py-3" type="button" onClick={resetForm}>
              إلغاء التعديل
            </button>
          ) : null}
          <button className="primary-button px-8 py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "إضافة شركة"}
          </button>
        </div>
      </form>

      {message ? <p className="mx-5 mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <div className="grid gap-3 p-5">
        {methods.length === 0 ? (
          <p className="py-6 text-center font-bold text-on-surface-variant">لا توجد شركات شحن بعد.</p>
        ) : (
          methods.map((method) => (
            <article key={method.id} className="grid gap-4 rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-4 text-right lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${method.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
                    {method.enabled ? "مفعلة" : "متوقفة"}
                  </span>
                  <h5 className="text-lg font-black text-on-surface">{method.name}</h5>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">الكود: {method.code}</p>
                <div className="mt-3 flex flex-wrap justify-end gap-2 text-sm font-bold text-on-surface-variant">
                  <span className="rounded-full bg-surface-container-low px-3 py-1">الرسوم: {formatPrice(Number(method.fee))}</span>
                  {method.eta ? <span className="rounded-full bg-surface-container-low px-3 py-1">{method.eta}</span> : null}
                  {method.description ? <span className="rounded-full bg-surface-container-low px-3 py-1">{method.description}</span> : null}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-col">
                <button className="secondary-button h-11 w-full p-0 text-[0px] lg:w-11" type="button" title="تعديل" aria-label={`تعديل ${method.name}`} onClick={() => startEdit(method)}>
                  <FiEdit3 aria-hidden="true" className="h-5 w-5" />
                </button>
                <button className="secondary-button h-11 w-full p-0 text-[0px] lg:w-11" type="button" title={method.enabled ? "إيقاف" : "تفعيل"} aria-label={`${method.enabled ? "إيقاف" : "تفعيل"} ${method.name}`} onClick={() => toggleEnabled(method)}>
                  {method.enabled ? <FiEyeOff aria-hidden="true" className="h-5 w-5" /> : <FiEye aria-hidden="true" className="h-5 w-5" />}
                </button>
                <button className="flex h-11 w-full items-center justify-center rounded-lg border border-error/30 p-0 text-[0px] font-bold text-error hover:bg-error-container/40 lg:w-11" type="button" title="حذف" aria-label={`حذف ${method.name}`} onClick={() => handleDelete(method)}>
                  <FiTrash2 aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex flex-row-reverse items-center justify-end gap-1 text-right text-sm font-bold text-on-surface" dir="rtl">
      <span aria-hidden="true" className="text-error">
        *
      </span>
      <span>{children}</span>
    </span>
  );
}

function sortMethods(first: ShippingMethod, second: ShippingMethod) {
  return Number(second.enabled) - Number(first.enabled) || first.name.localeCompare(second.name, "ar");
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}

function formatPrice(value: number) {
  if (value === 0) {
    return "مجانا";
  }

  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}
