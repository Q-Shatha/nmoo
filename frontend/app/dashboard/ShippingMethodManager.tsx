"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiEdit3, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { ApiError, createShippingMethod, deleteShippingMethod, ShippingDeliveryLocation, ShippingMethod, updateShippingMethod } from "@/lib/api";
import { countries, saRegions } from "@/lib/location-data";

type ShippingDraft = {
  code: string;
  name: string;
  fee: string;
  description: string;
  eta: string;
  enabled: boolean;
  cashOnDeliveryEnabled: boolean;
  deliveryLocations: ShippingDeliveryLocation[];
};

const emptyDraft: ShippingDraft = {
  code: "",
  name: "",
  fee: "",
  description: "",
  eta: "",
  enabled: true,
  cashOnDeliveryEnabled: false,
  deliveryLocations: [],
};

type LocationDraft = {
  country: string;
  region: string;
  city: string;
};

const emptyLocationDraft: LocationDraft = {
  country: "SA",
  region: "",
  city: "",
};

export function ShippingMethodManager({ initialMethods }: { initialMethods: ShippingMethod[] }) {
  const [methods, setMethods] = useState(initialMethods);
  const [draft, setDraft] = useState<ShippingDraft>(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [locationDraft, setLocationDraft] = useState<LocationDraft>(emptyLocationDraft);

  function startEdit(method: ShippingMethod) {
    setEditingId(method.id);
    setDraft({
      code: method.code,
      name: method.name,
      fee: String(method.fee),
      description: method.description ?? "",
      eta: method.eta ?? "",
      enabled: method.enabled,
      cashOnDeliveryEnabled: method.cashOnDeliveryEnabled,
      deliveryLocations: normalizeDeliveryLocations(method),
    });
    setLocationDraft(emptyLocationDraft);
    setMessage("");
  }

  function resetForm() {
    setEditingId("");
    setDraft(emptyDraft);
    setLocationDraft(emptyLocationDraft);
  }

  function addDeliveryLocation() {
    const country = locationDraft.country.trim().toUpperCase();
    const region = locationDraft.region.trim();
    const city = locationDraft.city.trim();

    if (!country) {
      return;
    }

    const nextLocation: ShippingDeliveryLocation = {
      country,
      ...(region ? { region } : {}),
      ...(city ? { city } : {}),
    };
    const nextKey = getLocationKey(nextLocation);

    setDraft((current) => {
      if (current.deliveryLocations.some((location) => getLocationKey(location) === nextKey)) {
        return current;
      }

      return {
        ...current,
        deliveryLocations: [...current.deliveryLocations, nextLocation],
      };
    });
    setLocationDraft({ country, region: "", city: "" });
  }

  function removeDeliveryLocation(index: number) {
    setDraft((current) => ({
      ...current,
      deliveryLocations: current.deliveryLocations.filter((_, locationIndex) => locationIndex !== index),
    }));
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
        cashOnDeliveryEnabled: draft.cashOnDeliveryEnabled,
        excludedRegions: [],
        unavailableLocations: [],
        deliveryLocations: draft.deliveryLocations,
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link className="primary-button px-6 py-3 text-center" href="/dashboard/shipping/new">
            إضافة شركة شحن
          </Link>
          <h4 className="text-xl font-black text-on-surface">شركات الشحن</h4>
        </div>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">أضف الشركات التي يستطيع متجرك الشحن من خلالها، وحدد رسوم كل شركة. هذه الخيارات تظهر للعميل في صفحة إتمام الشراء.</p>
      </div>

      {false ? <form className="grid gap-4 border-b border-outline-variant/15 p-5 text-right" dir="rtl" onSubmit={handleSubmit}>
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

        <label className="flex items-center justify-end gap-2 text-sm font-bold text-on-surface">
          <span>الدفع عند الاستلام</span>
          <input checked={draft.cashOnDeliveryEnabled} className="h-4 w-4" type="checkbox" onChange={(event) => setDraft({ ...draft, cashOnDeliveryEnabled: event.target.checked })} />
        </label>

        <section className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
          <div>
            <h5 className="font-black text-on-surface">مناطق التوصيل المتاحة</h5>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              اختر المواقع التي يستطيع هذا النوع من الشحن التوصيل إليها. اترك المنطقة فارغة لتغطية الدولة كاملة، واترك المدينة فارغة لتغطية المنطقة كاملة.
            </p>
          </div>
          <ShippingLocationBuilder locationDraft={locationDraft} onAdd={addDeliveryLocation} onChange={setLocationDraft} />
          {draft.deliveryLocations.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-2">
              {draft.deliveryLocations.map((location, index) => (
                <span key={getLocationKey(location)} className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-2 text-sm font-bold text-on-primary-container">
                  <button className="text-lg leading-none" type="button" aria-label="حذف الموقع" onClick={() => removeDeliveryLocation(index)}>
                    ×
                  </button>
                  {formatLocation(location)}
                </span>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface-variant">لم تحدد مناطق توصيل. سيعتبر هذا النوع متاحاً لكل المواقع.</p>
          )}
        </section>

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
      </form> : null}

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
                  {method.isPickup
                    ? <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">استلام من المتجر</span>
                    : null}
                  {method.freeShippingEnabled && method.freeShippingMinimum
                    ? <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">شحن مجاني عند {formatPrice(Number(method.freeShippingMinimum))}+</span>
                    : null}
                  {method.eta ? <span className="rounded-full bg-surface-container-low px-3 py-1">{method.eta}</span> : null}
                  {method.description ? <span className="rounded-full bg-surface-container-low px-3 py-1">{method.description}</span> : null}
                  {normalizeDeliveryLocations(method).length ? <span className="rounded-full bg-primary-container px-3 py-1 text-on-primary-container">التوصيل إلى: {normalizeDeliveryLocations(method).map(formatLocation).join("، ")}</span> : <span className="rounded-full bg-surface-container-low px-3 py-1">التوصيل: كل المواقع</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-col">
                <Link className="secondary-button flex h-11 w-full items-center justify-center p-0 text-[0px] lg:w-11" title="تعديل" aria-label={`تعديل ${method.name}`} href={`/dashboard/shipping/${method.id}`}>
                  <FiEdit3 aria-hidden="true" className="h-5 w-5" />
                </Link>
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

function ShippingLocationBuilder({ locationDraft, onAdd, onChange }: { locationDraft: LocationDraft; onAdd: () => void; onChange: (draft: LocationDraft) => void }) {
  const isSaudiArabia = locationDraft.country === "SA";
  const saRegionNames = Object.keys(saRegions);
  const cityOptions = isSaudiArabia && locationDraft.region ? saRegions[locationDraft.region] ?? [] : [];

  return (
    <div className="grid gap-3 rounded-2xl bg-surface-container-low p-4">
      <div className="grid gap-3 lg:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">الدولة</span>
          <select className="input-field px-4 py-3" value={locationDraft.country} onChange={(event) => onChange({ country: event.target.value, region: "", city: "" })}>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label} ({country.value})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">المنطقة أو الولاية</span>
          {isSaudiArabia ? (
            <select className="input-field px-4 py-3" value={locationDraft.region} onChange={(event) => onChange({ ...locationDraft, region: event.target.value, city: "" })}>
              <option value="">كل الدولة</option>
              {saRegionNames.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          ) : (
            <input className="input-field px-4 py-3 text-right" placeholder="مثال: California" value={locationDraft.region} onChange={(event) => onChange({ ...locationDraft, region: event.target.value, city: "" })} />
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">المدينة أو المحافظة</span>
          {isSaudiArabia && locationDraft.region ? (
            <select className="input-field px-4 py-3" value={locationDraft.city} onChange={(event) => onChange({ ...locationDraft, city: event.target.value })}>
              <option value="">كل المنطقة</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input className="input-field px-4 py-3 text-right" disabled={!locationDraft.region.trim()} placeholder={locationDraft.region.trim() ? "مثال: London" : "اتركها فارغة لتطبيق المنع على الدولة"} value={locationDraft.city} onChange={(event) => onChange({ ...locationDraft, city: event.target.value })} />
          )}
        </label>

        <div className="flex items-end">
          <button className="primary-button w-full px-5 py-3" type="button" onClick={onAdd}>
            إضافة الموقع
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeDeliveryLocations(method: ShippingMethod): ShippingDeliveryLocation[] {
  return (method.deliveryLocations ?? []).filter((location) => Boolean(location.country));
}

function getLocationKey(location: ShippingDeliveryLocation) {
  return `${location.country}|${location.region ?? ""}|${location.city ?? ""}`;
}

function formatLocation(location: ShippingDeliveryLocation) {
  return [location.country, location.region, location.city].filter(Boolean).join(" / ");
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
