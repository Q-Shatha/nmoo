"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, createShippingMethod, ShippingDeliveryLocation, ShippingMethod, updateShippingMethod } from "@/lib/api";
import { countries, saRegions } from "@/lib/location-data";
import { DashboardAccordion } from "./DashboardAccordion";
import { useI18n } from "@/lib/i18n/context";
import { FiPlus, FiX } from "react-icons/fi";

const SUPPORTED_LANGS = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
] as const;

const LANG_META: Record<string, { label: string; flag: string }> = {
  ar: { label: "العربية", flag: "🇸🇦" },
  en: { label: "English", flag: "🇬🇧" },
};

function AddLangButton({ addedLangs, onAdd }: { addedLangs: string[]; onAdd: (lang: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const available = SUPPORTED_LANGS.filter((l) => !addedLangs.includes(l.code));
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);
  if (available.length === 0) return null;
  return (
    <div ref={ref} className="relative w-fit">
      <button type="button" title="إضافة لغة"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-outline-variant/50 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        onClick={() => setOpen((v) => !v)}>
        <FiPlus className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute start-0 top-10 z-20 min-w-[130px] rounded-xl border border-outline-variant/30 bg-surface shadow-lg">
          {available.map((lang) => (
            <button key={lang.code} type="button" dir="ltr"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low"
              onClick={() => { onAdd(lang.code); setOpen(false); }}>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Draft = {
  code: string;
  name: string;
  nameAr: string;
  nameEn: string;
  fee: string;
  description: string;
  descriptionAr: string;
  descriptionEn: string;
  eta: string;
  etaAr: string;
  etaEn: string;
  enabled: boolean;
  cashOnDeliveryEnabled: boolean;
  freeShippingEnabled: boolean;
  freeShippingMinimum: string;
  isPickup: boolean;
  pickupAddress: string;
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
  const { t } = useI18n();
  const [draft, setDraft] = useState<Draft>({
    code: method?.code ?? "",
    name: method?.name ?? "",
    nameAr: method?.nameAr ?? "",
    nameEn: method?.nameEn ?? "",
    fee: method?.fee ? String(method.fee) : "",
    freeShippingMinimum: method?.freeShippingMinimum ? String(method.freeShippingMinimum) : "",
    description: method?.description ?? "",
    descriptionAr: method?.descriptionAr ?? "",
    descriptionEn: method?.descriptionEn ?? "",
    eta: method?.eta ?? "",
    etaAr: method?.etaAr ?? "",
    etaEn: method?.etaEn ?? "",
    enabled: method?.enabled ?? true,
    cashOnDeliveryEnabled: method?.cashOnDeliveryEnabled ?? false,
    freeShippingEnabled: method?.freeShippingEnabled ?? false,
    isPickup: method?.isPickup ?? false,
    pickupAddress: method?.pickupAddress ?? "",
    deliveryLocations: method?.deliveryLocations ?? [],
  });

  const [addedLangs, setAddedLangs] = useState<string[]>(() => {
    const langs: string[] = [];
    if (method?.nameAr || method?.descriptionAr || method?.etaAr) langs.push("ar");
    if (method?.nameEn || method?.descriptionEn || method?.etaEn) langs.push("en");
    return langs;
  });

  function removeLang(lang: string) {
    setAddedLangs((current) => current.filter((l) => l !== lang));
    if (lang === "ar") setDraft((d) => ({ ...d, nameAr: "", descriptionAr: "", etaAr: "" }));
    if (lang === "en") setDraft((d) => ({ ...d, nameEn: "", descriptionEn: "", etaEn: "" }));
  }
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
        nameAr: addedLangs.includes("ar") ? draft.nameAr || undefined : undefined,
        nameEn: addedLangs.includes("en") ? draft.nameEn || undefined : undefined,
        fee: Number(draft.fee),
        freeShippingEnabled: draft.freeShippingEnabled,
        freeShippingMinimum: draft.freeShippingEnabled && draft.freeShippingMinimum ? Number(draft.freeShippingMinimum) : null,
        isPickup: draft.isPickup,
        pickupAddress: draft.isPickup && draft.pickupAddress ? draft.pickupAddress : null,
        description: draft.description || undefined,
        descriptionAr: addedLangs.includes("ar") ? draft.descriptionAr || undefined : undefined,
        descriptionEn: addedLangs.includes("en") ? draft.descriptionEn || undefined : undefined,
        eta: draft.eta || undefined,
        etaAr: addedLangs.includes("ar") ? draft.etaAr || undefined : undefined,
        etaEn: addedLangs.includes("en") ? draft.etaEn || undefined : undefined,
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
      setMessage(error instanceof ApiError ? error.message : t.carriersSaveError);
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-start">
        <h4 className="text-xl font-black text-on-surface">{method ? t.editShippingMethod : t.addShippingMethod2}</h4>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.shippingFormDesc}</p>
      </div>

      <form className="grid gap-5 p-5 text-start" onSubmit={handleSubmit}>
        {/* Default fields */}
        <div className="rounded-xl border border-outline-variant/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">Default</span>
            <span className="text-xs text-on-surface-variant">{t.defaultLangHint}</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-6">
            <Field label={t.carrierCode} required>
              <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder={t.carrierCodePlaceholder} required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} />
            </Field>
            <Field className="lg:col-span-2" label={t.carrierName} required>
              <input className="input-field px-4 py-3 text-start" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </Field>
            <Field label={t.shippingFee} required>
              <input className="input-field px-4 py-3 text-left" dir="ltr" min="0" required step="0.01" type="number" value={draft.fee} onChange={(event) => setDraft({ ...draft, fee: event.target.value })} />
            </Field>
            <Field className="lg:col-span-2" label={t.deliveryDuration}>
              <input className="input-field px-4 py-3 text-start" placeholder={t.deliveryDurationPlaceholder} value={draft.eta} onChange={(event) => setDraft({ ...draft, eta: event.target.value })} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label={t.shortDescription}>
              <input className="input-field px-4 py-3 text-start" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            </Field>
          </div>
        </div>

        {/* Language sections */}
        {addedLangs.map((lang) => {
          const meta = LANG_META[lang];
          const isAr = lang === "ar";
          return (
            <div key={lang} className="rounded-xl border border-outline-variant/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">
                  {meta.flag} {meta.label}
                </span>
                <button type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error"
                  onClick={() => removeLang(lang)}>
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label={t.carrierName}>
                  <input className="input-field px-4 py-3 text-start" dir={isAr ? "rtl" : "ltr"}
                    value={isAr ? draft.nameAr : draft.nameEn}
                    onChange={(e) => setDraft({ ...draft, [isAr ? "nameAr" : "nameEn"]: e.target.value })} />
                </Field>
                <Field label={t.deliveryDuration}>
                  <input className="input-field px-4 py-3 text-start" dir={isAr ? "rtl" : "ltr"}
                    value={isAr ? draft.etaAr : draft.etaEn}
                    onChange={(e) => setDraft({ ...draft, [isAr ? "etaAr" : "etaEn"]: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label={t.shortDescription}>
                  <input className="input-field px-4 py-3 text-start" dir={isAr ? "rtl" : "ltr"}
                    value={isAr ? draft.descriptionAr : draft.descriptionEn}
                    onChange={(e) => setDraft({ ...draft, [isAr ? "descriptionAr" : "descriptionEn"]: e.target.value })} />
                </Field>
              </div>
            </div>
          );
        })}

        <AddLangButton addedLangs={addedLangs} onAdd={(lang) => setAddedLangs((current) => [...current, lang])} />

        <DashboardAccordion title={t.carrierOptionsTitle} defaultOpen>
          <div className="grid gap-3 md:grid-cols-2">
            <Toggle label={t.enabledForCustomers} checked={draft.enabled} onChange={(enabled) => setDraft({ ...draft, enabled })} />
            <Toggle label={t.enableCashOnDelivery} checked={draft.cashOnDeliveryEnabled} onChange={(cashOnDeliveryEnabled) => setDraft({ ...draft, cashOnDeliveryEnabled })} />
            <Toggle label={t.isPickupOption} checked={draft.isPickup} onChange={(isPickup) => setDraft({ ...draft, isPickup })} />
            {draft.isPickup && (
              <div className="grid gap-2 md:col-span-2">
                <span className="text-sm font-bold text-on-surface">{t.googleMapsLink}</span>
                <input
                  className="input-field px-4 py-3 text-left"
                  dir="ltr"
                  placeholder={t.googleMapsPlaceholder}
                  required={draft.isPickup}
                  type="url"
                  value={draft.pickupAddress}
                  onChange={(e) => setDraft({ ...draft, pickupAddress: e.target.value })}
                />
                <p className="text-xs text-on-surface-variant">{t.googleMapsHint}</p>
              </div>
            )}
            <Toggle label={t.freeShippingWithMinimum} checked={draft.freeShippingEnabled} onChange={(freeShippingEnabled) => setDraft({ ...draft, freeShippingEnabled })} />
            {draft.freeShippingEnabled && (
              <div className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">{t.freeShippingMinimumLabel}</span>
                <input
                  className="input-field px-4 py-3 text-left"
                  dir="ltr"
                  min="0"
                  placeholder={t.freeShippingMinimumPlaceholder}
                  required={draft.freeShippingEnabled}
                  step="0.01"
                  type="number"
                  value={draft.freeShippingMinimum}
                  onChange={(e) => setDraft({ ...draft, freeShippingMinimum: e.target.value })}
                />
              </div>
            )}
          </div>
        </DashboardAccordion>

        <DashboardAccordion title={t.deliveryZonesTitle} description={t.deliveryZonesDesc}>
          <div>
            <h5 className="font-black text-on-surface">{t.deliveryZonesTitle}</h5>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.deliveryZonesInfo}</p>
          </div>
          <LocationBuilder draft={locationDraft} onAdd={addLocation} onChange={setLocationDraft} t={t} />
          {draft.deliveryLocations.length ? (
            <div className="flex flex-wrap justify-end gap-2">
              {draft.deliveryLocations.map((location, index) => (
                <span key={locationKey(location)} className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-2 text-sm font-bold text-on-primary-container">
                  <button className="text-lg leading-none" type="button" onClick={() => removeLocation(index)} aria-label={t.deleteLocation}>
                    ×
                  </button>
                  {formatLocation(location)}
                </span>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface-variant">{t.noZonesSelected}</p>
          )}
        </DashboardAccordion>

        {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link className="secondary-button px-6 py-3 text-center" href="/dashboard/shipping">
            {t.cancel}
          </Link>
          <button className="primary-button px-8 py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? t.savingShipping : t.saveShipping}
          </button>
        </div>
      </form>
    </section>
  );
}

function LocationBuilder({ draft, onAdd, onChange, t }: { draft: LocationDraft; onAdd: () => void; onChange: (draft: LocationDraft) => void; t: ReturnType<typeof useI18n>["t"] }) {
  const isSaudiArabia = draft.country === "SA";
  const regions = Object.keys(saRegions);
  const cities = isSaudiArabia && draft.region ? saRegions[draft.region] ?? [] : [];

  return (
    <div className="grid gap-3 rounded-2xl bg-surface-container-low p-4 lg:grid-cols-4">
      <Field label={t.country}>
        <select className="input-field px-4 py-3" value={draft.country} onChange={(event) => onChange({ country: event.target.value, region: "", city: "" })}>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label} ({country.value})
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.regionOrState}>
        {isSaudiArabia ? (
          <select className="input-field px-4 py-3" value={draft.region} onChange={(event) => onChange({ ...draft, region: event.target.value, city: "" })}>
            <option value="">{t.allCountry}</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        ) : (
          <input className="input-field px-4 py-3 text-start" value={draft.region} onChange={(event) => onChange({ ...draft, region: event.target.value, city: "" })} />
        )}
      </Field>
      <Field label={t.cityOrProvince}>
        {isSaudiArabia && draft.region ? (
          <select className="input-field px-4 py-3" value={draft.city} onChange={(event) => onChange({ ...draft, city: event.target.value })}>
            <option value="">{t.allRegion}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        ) : (
          <input className="input-field px-4 py-3 text-start" disabled={!draft.region.trim()} value={draft.city} onChange={(event) => onChange({ ...draft, city: event.target.value })} />
        )}
      </Field>
      <div className="flex items-end">
        <button className="primary-button w-full px-5 py-3" type="button" onClick={onAdd}>
          {t.addLocation}
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
