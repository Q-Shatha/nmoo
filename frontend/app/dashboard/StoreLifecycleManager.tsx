"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { ApiError, deleteMyStore, StoreStatus, updateMyStoreStatus } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type StoreLifecycleManagerProps = {
  initialStatus?: StoreStatus;
};

export function StoreLifecycleManager({ initialStatus = "ACTIVE" }: StoreLifecycleManagerProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [status, setStatus] = useState<StoreStatus>(initialStatus);
  const [message, setMessage] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [isPending, startTransition] = useTransition();

  const isPaused = status === "PAUSED";
  const isDeleted = status === "DELETED";

  function handleStatusChange(nextStatus: Exclude<StoreStatus, "DELETED">) {
    setMessage("");
    startTransition(async () => {
      try {
        const theme = await updateMyStoreStatus(nextStatus, readToken());
        setStatus(theme.storeStatus ?? nextStatus);
        setMessage(nextStatus === "PAUSED" ? t.storePausedMsg : t.storeResumedMsg);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : t.storeStatusUpdateError);
      }
    });
  }

  function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (deleteText.trim() !== t.deleteStoreConfirmText) {
      setMessage(t.deleteStoreTypeHint);
      return;
    }

    setMessage("");
    startTransition(async () => {
      try {
        await deleteMyStore(readToken());
        document.cookie = "nmoo_access_token=; Max-Age=0; path=/";
        router.push("/account");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : t.storeDeleteError);
      }
    });
  }

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-start">
        <h4 className="text-xl font-black text-on-surface">{t.storeStatusTitle}</h4>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.storeStatusDesc}</p>
      </div>

      <div className="grid gap-5 p-5 text-start lg:grid-cols-2">
        <article className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface-variant">{t.currentStatusLabel}</p>
              <h5 className="mt-2 text-2xl font-black text-on-surface">{formatStoreStatus(status, t)}</h5>
            </div>
            <span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${isPaused ? "bg-amber-100 text-amber-800" : isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              {formatStoreStatus(status, t)}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            {t.storePauseWarning}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {isPaused ? (
              <button className="primary-button px-6 py-3" disabled={isPending || isDeleted} type="button" onClick={() => handleStatusChange("ACTIVE")}>
                {t.resumeStore}
              </button>
            ) : (
              <button className="secondary-button px-6 py-3" disabled={isPending || isDeleted} type="button" onClick={() => handleStatusChange("PAUSED")}>
                {t.pauseStore}
              </button>
            )}
          </div>
        </article>

        <form className="rounded-2xl border border-red-200 bg-red-50 p-5" onSubmit={handleDelete}>
          <h5 className="text-xl font-black text-red-800">{t.deleteStorePermanentTitle}</h5>
          <p className="mt-2 text-sm leading-7 text-red-700">
            {t.deleteStorePermanentDesc}
          </p>
          <label className="mt-4 grid gap-2">
            <span className="text-sm font-bold text-red-800">{t.deleteStoreTypeLabel}</span>
            <input
              className="input-field border-red-200 bg-white px-4 py-3 text-start"
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
            />
          </label>
          <button className="mt-4 inline-flex rounded-xl bg-red-700 px-6 py-3 font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending || isDeleted} type="submit">
            {t.deleteStorePermanentButton}
          </button>
        </form>
      </div>

      {message ? <p className="mx-5 mb-5 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}
    </section>
  );
}

function formatStoreStatus(status: StoreStatus | undefined, t: ReturnType<typeof useI18n>["t"]) {
  if (status === "PAUSED") {
    return t.storeStatusPaused;
  }
  if (status === "DELETED") {
    return t.storeStatusDeleted;
  }
  return t.storeStatusActive;
}

function readToken() {
  const token = document.cookie
    .split("; ")
    .find((item) => item.startsWith("nmoo_access_token="))
    ?.split("=")[1];

  return token ? decodeURIComponent(token) : "";
}
