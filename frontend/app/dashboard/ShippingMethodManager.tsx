"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiEdit3, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { ApiError, createShippingMethod, deleteShippingMethod, ShippingDeliveryLocation, ShippingMethod, updateShippingMethod } from "@/lib/api";
import { countries, saRegions } from "@/lib/location-data";
import { useI18n } from "@/lib/i18n/context";

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
  const { t } = useI18n();
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
        setMessage(t.carriersUpdated);
      } else {
        const created = await createShippingMethod(input, token);
        setMethods((current) => [...current, created].sort(sortMethods));
        setMessage(t.carriersAdded);
      }

      resetForm();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.carriersSaveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(method: ShippingMethod) {
    const confirmed = window.confirm(t.confirmDeleteCarrier(method.name));

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
      setMessage(t.carriersDeleted);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.carriersDeleteError);
    }
  }

  async function toggleEnabled(method: ShippingMethod) {
    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      const updated = await updateShippingMethod(method.id, { enabled: !method.enabled }, token);
      setMethods((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.carriersToggleError);
    }
  }

  return (
    <section id="shipping" className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-start">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-black text-on-surface">{t.carriersTitle}</h4>
          <Link className="primary-button px-6 py-3 text-center" href="/dashboard/shipping/new">
            {t.addCarrier}
          </Link>
        </div>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.carriersDesc}</p>
      </div>

      {false ? <form className="grid gap-4 border-b border-outline-variant/15 p-5 text-start" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-6">
          <label className="grid gap-2">
            <RequiredLabel>{t.carrierCode}</RequiredLabel>
            <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder={t.carrierCodePlaceholder} required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <RequiredLabel>{t.carrierName}</RequiredLabel>
            <input className="input-field px-4 py-3 text-start" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="grid gap-2">
            <RequiredLabel>{t.shippingFee}</RequiredLabel>
            <input className="input-field px-4 py-3 text-left" dir="ltr" min="0" required step="0.01" type="number" value={draft.fee} onChange={(event) => setDraft({ ...draft, fee: event.target.value })} />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-bold text-on-surface">{t.deliveryDuration}</span>
            <input className="input-field px-4 py-3 text-start" placeholder={t.deliveryDurationPlaceholder} value={draft.eta} onChange={(event) => setDraft({ ...draft, eta: event.target.value })} />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">{t.shortDescription}</span>
          <input className="input-field px-4 py-3 text-start" placeholder={t.carrierDescPlaceholder} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </label>

        <label className="flex items-center justify-end gap-2 text-sm font-bold text-on-surface">
          <span>{t.enabledForCustomers}</span>
          <input checked={draft.enabled} className="h-4 w-4" type="checkbox" onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} />
        </label>

        <label className="flex items-center justify-end gap-2 text-sm font-bold text-on-surface">
          <span>{t.cashOnDelivery}</span>
          <input checked={draft.cashOnDeliveryEnabled} className="h-4 w-4" type="checkbox" onChange={(event) => setDraft({ ...draft, cashOnDeliveryEnabled: event.target.checked })} />
        </label>

        <section className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
          <div>
            <h5 className="font-black text-on-surface">{t.deliveryZonesTitle}</h5>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              {t.deliveryZonesInfo}
            </p>
          </div>
          <ShippingLocationBuilder locationDraft={locationDraft} onAdd={addDeliveryLocation} onChange={setLocationDraft} />
          {draft.deliveryLocations.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-2">
              {draft.deliveryLocations.map((location, index) => (
                <span key={getLocationKey(location)} className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-2 text-sm font-bold text-on-primary-container">
                  <button className="text-lg leading-none" type="button" aria-label={t.deleteLocation} onClick={() => removeDeliveryLocation(index)}>
                    ×
                  </button>
                  {formatLocation(location)}
                </span>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface-variant">{t.noZonesSelected}</p>
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {editingId ? (
            <button className="secondary-button px-6 py-3" type="button" onClick={resetForm}>
              {t.cancel}
            </button>
          ) : null}
          <button className="primary-button px-8 py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? t.savingShipping : editingId ? t.saveEdit : t.addShippingMethod2}
          </button>
        </div>
      </form> : null}

      {message ? <p className="mx-5 mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <div className="grid gap-3 p-5">
        {methods.length === 0 ? (
          <p className="py-6 text-center font-bold text-on-surface-variant">{t.noCarriersYet}</p>
        ) : (
          methods.map((method) => (
            <article key={method.id} className="grid gap-4 rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-4 text-start lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <h5 className="text-lg font-black text-on-surface">{method.name}</h5>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${method.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
                    {method.enabled ? t.carrierEnabled : t.carrierStopped}
                  </span>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">{t.code}: {method.code}</p>
                <div className="mt-3 flex flex-wrap justify-start gap-2 text-sm font-bold text-on-surface-variant">
                  <span className="rounded-full bg-surface-container-low px-3 py-1">{t.carrierFee(`${formatPrice(Number(method.fee), t.numberLocale)} ${t.currency}`)}</span>
                  {method.isPickup
                    ? <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">{t.pickupFromStoreLabel}</span>
                    : null}
                  {method.freeShippingEnabled && method.freeShippingMinimum
                    ? <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">{t.freeShippingFrom(`${formatPrice(Number(method.freeShippingMinimum), t.numberLocale)} ${t.currency}`)}</span>
                    : null}
                  {method.eta ? <span className="rounded-full bg-surface-container-low px-3 py-1">{method.eta}</span> : null}
                  {method.description ? <span className="rounded-full bg-surface-container-low px-3 py-1">{method.description}</span> : null}
                  {normalizeDeliveryLocations(method).length ? <span className="rounded-full bg-primary-container px-3 py-1 text-on-primary-container">{t.deliverTo(normalizeDeliveryLocations(method).map(formatLocation).join(t.addressSeparator))}</span> : <span className="rounded-full bg-surface-container-low px-3 py-1">{t.deliverToAll}</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-col">
                <Link className="secondary-button flex h-11 w-full items-center justify-center p-0 text-[0px] lg:w-11" title={t.edit} aria-label={t.editCarrier(method.name)} href={`/dashboard/shipping/${method.id}`}>
                  <FiEdit3 aria-hidden="true" className="h-5 w-5" />
                </Link>
                <button className="secondary-button h-11 w-full p-0 text-[0px] lg:w-11" type="button" title={method.enabled ? t.disableAction : t.enableAction} aria-label={t.toggleCarrier(method.enabled ? t.disableAction : t.enableAction, method.name)} onClick={() => toggleEnabled(method)}>
                  {method.enabled ? <FiEyeOff aria-hidden="true" className="h-5 w-5" /> : <FiEye aria-hidden="true" className="h-5 w-5" />}
                </button>
                <button className="flex h-11 w-full items-center justify-center rounded-lg border border-error/30 p-0 text-[0px] font-bold text-error hover:bg-error-container/40 lg:w-11" type="button" title={t.delete} aria-label={t.deleteCarrier(method.name)} onClick={() => handleDelete(method)}>
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
  const { t } = useI18n();
  const isSaudiArabia = locationDraft.country === "SA";
  const saRegionNames = Object.keys(saRegions);
  const cityOptions = isSaudiArabia && locationDraft.region ? saRegions[locationDraft.region] ?? [] : [];

  return (
    <div className="grid gap-3 rounded-2xl bg-surface-container-low p-4">
      <div className="grid gap-3 lg:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">{t.country}</span>
          <select className="input-field px-4 py-3" value={locationDraft.country} onChange={(event) => onChange({ country: event.target.value, region: "", city: "" })}>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label} ({country.value})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">{t.regionOrState}</span>
          {isSaudiArabia ? (
            <select className="input-field px-4 py-3" value={locationDraft.region} onChange={(event) => onChange({ ...locationDraft, region: event.target.value, city: "" })}>
              <option value="">{t.allCountry}</option>
              {saRegionNames.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          ) : (
            <input className="input-field px-4 py-3 text-start" value={locationDraft.region} onChange={(event) => onChange({ ...locationDraft, region: event.target.value, city: "" })} />
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">{t.cityOrProvince}</span>
          {isSaudiArabia && locationDraft.region ? (
            <select className="input-field px-4 py-3" value={locationDraft.city} onChange={(event) => onChange({ ...locationDraft, city: event.target.value })}>
              <option value="">{t.allRegion}</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input className="input-field px-4 py-3 text-start" disabled={!locationDraft.region.trim()} value={locationDraft.city} onChange={(event) => onChange({ ...locationDraft, city: event.target.value })} />
          )}
        </label>

        <div className="flex items-end">
          <button className="primary-button w-full px-5 py-3" type="button" onClick={onAdd}>
            {t.addLocation}
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
    <span className="inline-flex items-center gap-1 text-start text-sm font-bold text-on-surface">
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

function formatPrice(value: number, locale: string) {
  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
