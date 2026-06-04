"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, createShippingMethod, ShippingDeliveryLocation, ShippingMethod, updateShippingMethod } from "@/lib/api";
import { countries, saRegions } from "@/lib/location-data";

type Draft = {
  code: string;
  name: string;
  fee: string;
  description: string;
  eta: string;
  enabled: boolean;
  cashOnDeliveryEnabled: boolean;
  deliveryLocations: ShippingDeliveryLocation[];
};

type LocationDraft = {
  country: string;
  region: string;
  city: string;
};

const emptyLocation: LocationDraft = { country: "SA", region: "", city: "" };

export function ShippingMethodForm({ method }: { method?: ShippingMethod }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>({
    code: method?.code ?? "",
    name: method?.name ?? "",
    fee: method?.fee ? String(method.fee) : "",
    description: method?.description ?? "",
    eta: method?.eta ?? "",
    enabled: method?.enabled ?? true,
    cashOnDeliveryEnabled: method?.cashOnDeliveryEnabled ?? false,
    deliveryLocations: method?.deliveryLocations ?? [],
  });
  const [locationDraft, setLocationDraft] = useState<LocationDraft>(emptyLocation);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function addLocation() {
    const location: ShippingDeliveryLocation = {
      country: locationDraft.country.trim().toUpperCase(),
      ...(locationDraft.region.trim() ? { region: locationDraft.region.trim() } : {}),
      ...(locationDraft.city.trim() ? { city: locationDraft.city.trim() } : {}),
    };

    if (!location.country) {
      return;
    }

    const key = locationKey(location);
    setDraft((current) =>
      current.deliveryLocations.some((item) => locationKey(item) === key)
        ? current
        : { ...current, deliveryLocations: [...current.deliveryLocations, location] },
    );
    setLocationDraft({ country: location.country, region: "", city: "" });
  }

  function removeLocation(index: number) {
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

      if (method) {
        await updateShippingMethod(method.id, input, token);
      } else {
        await createShippingMethod(input, token);
      }

      router.push("/dashboard/shipping");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ شركة الشحن.");
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-right">
        <h4 className="text-xl font-black text-on-surface">{method ? "تعديل شركة الشحن" : "إضافة شركة شحن"}</h4>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">حدد بيانات الشركة ومناطق التوصيل وخيار الدفع عند الاستلام لهذه الشركة فقط.</p>
      </div>

      <form className="grid gap-5 p-5 text-right" dir="rtl" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-6">
          <Field label="كود الشركة" required>
            <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder="spl" required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} />
          </Field>
          <Field className="lg:col-span-2" label="اسم الشركة" required>
            <input className="input-field px-4 py-3 text-right" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </Field>
          <Field label="رسوم الشحن" required>
            <input className="input-field px-4 py-3 text-left" dir="ltr" min="0" required step="0.01" type="number" value={draft.fee} onChange={(event) => setDraft({ ...draft, fee: event.target.value })} />
          </Field>
          <Field className="lg:col-span-2" label="مدة التوصيل">
            <input className="input-field px-4 py-3 text-right" placeholder="2 - 5 أيام عمل" value={draft.eta} onChange={(event) => setDraft({ ...draft, eta: event.target.value })} />
          </Field>
        </div>

        <Field label="وصف مختصر">
          <input className="input-field px-4 py-3 text-right" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </Field>

        <div className="grid gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 md:grid-cols-2">
          <Toggle label="مفعلة للعملاء" checked={draft.enabled} onChange={(enabled) => setDraft({ ...draft, enabled })} />
          <Toggle label="توفير الدفع عند الاستلام لهذه الشركة" checked={draft.cashOnDeliveryEnabled} onChange={(cashOnDeliveryEnabled) => setDraft({ ...draft, cashOnDeliveryEnabled })} />
        </div>

        <section className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
          <div>
            <h5 className="font-black text-on-surface">مناطق التوصيل المتاحة</h5>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">اترك المنطقة فارغة لتغطية الدولة كاملة، واترك المدينة فارغة لتغطية المنطقة كاملة.</p>
          </div>
          <LocationBuilder draft={locationDraft} onAdd={addLocation} onChange={setLocationDraft} />
          {draft.deliveryLocations.length ? (
            <div className="flex flex-wrap justify-end gap-2">
              {draft.deliveryLocations.map((location, index) => (
                <span key={locationKey(location)} className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-2 text-sm font-bold text-on-primary-container">
                  <button className="text-lg leading-none" type="button" onClick={() => removeLocation(index)} aria-label="حذف الموقع">
                    ×
                  </button>
                  {formatLocation(location)}
                </span>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface-variant">بدون تحديد مناطق، ستكون الشركة متاحة لكل المواقع.</p>
          )}
        </section>

        {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link className="secondary-button px-6 py-3 text-center" href="/dashboard/shipping">
            إلغاء
          </Link>
          <button className="primary-button px-8 py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "جاري الحفظ..." : "حفظ شركة الشحن"}
          </button>
        </div>
      </form>
    </section>
  );
}

function LocationBuilder({ draft, onAdd, onChange }: { draft: LocationDraft; onAdd: () => void; onChange: (draft: LocationDraft) => void }) {
  const isSaudiArabia = draft.country === "SA";
  const regions = Object.keys(saRegions);
  const cities = isSaudiArabia && draft.region ? saRegions[draft.region] ?? [] : [];

  return (
    <div className="grid gap-3 rounded-2xl bg-surface-container-low p-4 lg:grid-cols-4">
      <Field label="الدولة">
        <select className="input-field px-4 py-3" value={draft.country} onChange={(event) => onChange({ country: event.target.value, region: "", city: "" })}>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label} ({country.value})
            </option>
          ))}
        </select>
      </Field>
      <Field label="المنطقة أو الولاية">
        {isSaudiArabia ? (
          <select className="input-field px-4 py-3" value={draft.region} onChange={(event) => onChange({ ...draft, region: event.target.value, city: "" })}>
            <option value="">كل الدولة</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        ) : (
          <input className="input-field px-4 py-3 text-right" value={draft.region} onChange={(event) => onChange({ ...draft, region: event.target.value, city: "" })} />
        )}
      </Field>
      <Field label="المدينة أو المحافظة">
        {isSaudiArabia && draft.region ? (
          <select className="input-field px-4 py-3" value={draft.city} onChange={(event) => onChange({ ...draft, city: event.target.value })}>
            <option value="">كل المنطقة</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        ) : (
          <input className="input-field px-4 py-3 text-right" disabled={!draft.region.trim()} value={draft.city} onChange={(event) => onChange({ ...draft, city: event.target.value })} />
        )}
      </Field>
      <div className="flex items-end">
        <button className="primary-button w-full px-5 py-3" type="button" onClick={onAdd}>
          إضافة الموقع
        </button>
      </div>
    </div>
  );
}

function Field({ children, className = "", label, required = false }: { children: React.ReactNode; className?: string; label: string; required?: boolean }) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-sm font-bold text-on-surface">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-surface-container-low px-4 py-4 text-sm font-bold text-on-surface">
      <span>{label}</span>
      <input checked={checked} className="h-5 w-5 shrink-0" type="checkbox" onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function locationKey(location: ShippingDeliveryLocation) {
  return `${location.country}|${location.region ?? ""}|${location.city ?? ""}`;
}

function formatLocation(location: ShippingDeliveryLocation) {
  return [location.country, location.region, location.city].filter(Boolean).join(" / ");
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
