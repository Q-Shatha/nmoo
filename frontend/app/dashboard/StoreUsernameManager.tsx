"use client";

import { FormEvent, useState } from "react";
import { ApiError, checkStoreUsernameAvailability, updateMyStoreUsername } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function StoreUsernameManager({ initialUsername }: { initialUsername?: string | null }) {
  const { t } = useI18n();
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
      setMessage(result.available ? t.storeNameAvailable : t.storeNameTaken);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.storeNameCheckError);
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
      setMessage(t.storeUrlSaved(user.storeUsername ?? ""));
    } catch (error) {
      setAvailable(false);
      setMessage(error instanceof ApiError ? error.message : t.storeUrlSaveError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard-panel p-5 text-start" id="store-username">
      <h4 className="text-xl font-black text-on-surface">{t.storeUrlTitle}</h4>
      <p className="mt-2 text-sm leading-7 text-on-surface-variant">{t.storeUrlDesc}</p>
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
          {isChecking ? t.checkingLabel : t.checkLabel}
        </button>
        <button className="primary-button px-5 py-3" disabled={isSaving || available === false} type="submit">
          {isSaving ? t.savingLabel : t.saveLabel}
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
