"use client";

import { FormEvent, useState } from "react";
import { ApiError, checkStoreUsernameAvailability, updateMyStoreUsername } from "@/lib/api";

export function StoreUsernameManager({ initialUsername }: { initialUsername?: string | null }) {
  const [storeUsername, setStoreUsername] = useState(initialUsername ?? "");
  const [message, setMessage] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCheck() {
    setMessage("");
    setAvailable(null);
    setIsChecking(true);

    try {
      const token = readCookie("nmoo_access_token");
      const result = await checkStoreUsernameAvailability(storeUsername, token);
      setStoreUsername(result.storeUsername);
      setAvailable(result.available);
      setMessage(result.available ? "اسم المتجر متاح." : "اسم المتجر مستخدم، اختر اسم آخر.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر فحص اسم المتجر.");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const user = await updateMyStoreUsername(storeUsername, token);
      setStoreUsername(user.storeUsername ?? "");
      setAvailable(true);
      setMessage(`تم حفظ رابط المتجر: /${user.storeUsername}`);
    } catch (error) {
      setAvailable(false);
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ اسم المتجر.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard-panel p-5 text-right" id="store-username">
      <h4 className="text-xl font-black text-on-surface">رابط المتجر</h4>
      <p className="mt-2 text-sm leading-7 text-on-surface-variant">اختر اسم فريد لمتجرك. سيظهر للعملاء كرابط مباشر مثل nomu.com/mystore.</p>
      <form className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]" dir="ltr" onSubmit={handleSubmit}>
        <input
          className="input-field px-4 py-3 text-left"
          maxLength={32}
          minLength={3}
          pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
          placeholder="mystore"
          required
          value={storeUsername}
          onChange={(event) => {
            setStoreUsername(event.target.value.toLowerCase());
            setAvailable(null);
            setMessage("");
          }}
        />
        <button className="secondary-button px-5 py-3" disabled={isChecking || !storeUsername} type="button" onClick={handleCheck}>
          {isChecking ? "Checking..." : "Check"}
        </button>
        <button className="primary-button px-5 py-3" disabled={isSaving || available === false} type="submit">
          {isSaving ? "Saving..." : "Save"}
        </button>
      </form>
      {message ? <p className={`mt-3 text-sm font-bold ${available === false ? "text-error" : "text-primary"}`}>{message}</p> : null}
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
