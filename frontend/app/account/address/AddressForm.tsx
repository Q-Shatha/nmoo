"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { AddressInput, ApiError, ApiUser, updateMyAddress } from "@/lib/api";
import { countries, defaultSaudiRegion, saRegions } from "@/lib/location-data";

export function AddressForm({ user }: { user: ApiUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [country, setCountry] = useState(user.country ?? "SA");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? "");
  const [region, setRegion] = useState(user.region ?? defaultSaudiRegion);
  const [city, setCity] = useState(user.city ?? saRegions[defaultSaudiRegion][0]);
  const [district, setDistrict] = useState(user.district ?? "");
  const [street, setStreet] = useState(user.street ?? "");
  const [buildingNumber, setBuildingNumber] = useState(user.buildingNumber ?? "");
  const [postalCode, setPostalCode] = useState(user.postalCode ?? "");
  const [nationalAddress, setNationalAddress] = useState(user.nationalAddress ?? "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSaudi = country === "SA";
  const cityOptions = useMemo(() => saRegions[region] ?? [], [region]);

  function handleCountryChange(nextCountry: string) {
    setCountry(nextCountry);

    if (nextCountry === "SA") {
      setRegion(defaultSaudiRegion);
      setCity(saRegions[defaultSaudiRegion][0]);
      return;
    }

    setRegion("");
    setCity("");
    setNationalAddress("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const token = readCookie("nmoo_access_token");

    if (!token) {
      router.push("/login?next=/account/address");
      return;
    }

    const payload: AddressInput = {
      country,
      phoneNumber,
      region,
      city,
      district,
      street,
      buildingNumber,
      postalCode,
      nationalAddress: isSaudi ? nationalAddress : undefined,
    };

    try {
      await updateMyAddress(payload, token);
      const next = searchParams.get("next") ?? "/account";
      router.push(next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ العنوان. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel grid gap-5 p-6 text-right" dir="rtl" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <RequiredLabel>البلد</RequiredLabel>
          <select className="input-field px-4 py-3 text-right" dir="rtl" required value={country} onChange={(event) => handleCountryChange(event.target.value)}>
            {countries.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <RequiredLabel>رقم الجوال</RequiredLabel>
          <input
            className="input-field px-4 py-3 text-right"
            dir="ltr"
            inputMode="tel"
            placeholder="+966501234567"
            required
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </label>

        {isSaudi ? (
          <>
            <label className="grid gap-2">
              <RequiredLabel>المنطقة</RequiredLabel>
              <select
                className="input-field px-4 py-3 text-right"
                dir="rtl"
                required
                value={region}
                onChange={(event) => {
                  const nextRegion = event.target.value;
                  setRegion(nextRegion);
                  setCity(saRegions[nextRegion]?.[0] ?? "");
                }}
              >
                {Object.keys(saRegions).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <RequiredLabel>المدينة</RequiredLabel>
              <select className="input-field px-4 py-3 text-right" dir="rtl" required value={city} onChange={(event) => setCity(event.target.value)}>
                {cityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="grid gap-2">
              <RequiredLabel>المنطقة</RequiredLabel>
              <input className="input-field px-4 py-3 text-right" dir="rtl" required value={region} onChange={(event) => setRegion(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <RequiredLabel>المدينة</RequiredLabel>
              <input className="input-field px-4 py-3 text-right" dir="rtl" required value={city} onChange={(event) => setCity(event.target.value)} />
            </label>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <RequiredLabel>الحي</RequiredLabel>
          <input className="input-field px-4 py-3 text-right" dir="rtl" required value={district} onChange={(event) => setDistrict(event.target.value)} />
        </label>
        <label className="grid gap-2">
          <RequiredLabel>الشارع</RequiredLabel>
          <input className="input-field px-4 py-3 text-right" dir="rtl" required value={street} onChange={(event) => setStreet(event.target.value)} />
        </label>
        <label className="grid gap-2">
          <RequiredLabel>رقم المبنى أو البيت</RequiredLabel>
          <input className="input-field px-4 py-3 text-right" dir="rtl" required value={buildingNumber} onChange={(event) => setBuildingNumber(event.target.value)} />
        </label>
        <label className="grid gap-2">
          <RequiredLabel>الرمز البريدي</RequiredLabel>
          <input className="input-field px-4 py-3 text-right" dir="ltr" inputMode="numeric" required value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
        </label>
      </div>

      {isSaudi ? (
        <label className="grid gap-2">
          <RequiredLabel>العنوان الوطني</RequiredLabel>
          <textarea
            className="input-field min-h-28 px-4 py-3 text-right"
            dir="rtl"
            placeholder="مثال: RDBA1234"
            required
            value={nationalAddress}
            onChange={(event) => setNationalAddress(event.target.value)}
          />
        </label>
      ) : null}

      {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

      <button className="primary-button py-4 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? "جاري حفظ العنوان..." : "حفظ العنوان"}
      </button>
    </form>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex flex-row-reverse items-center justify-end gap-1 text-right text-sm font-bold text-on-surface" dir="rtl">
      {children}
      <span aria-hidden="true" className="text-error">
        *
      </span>
    </span>
  );
}
