"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, createStorePage, StorePage, updateStorePage } from "@/lib/api";
import { DashboardAccordion } from "./DashboardAccordion";
import { useI18n } from "@/lib/i18n/context";

export function StorePageForm({ page }: { page?: StorePage }) {
  const router = useRouter();
  const { t } = useI18n();
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [published, setPublished] = useState(page?.published ?? true);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const input = {
        title,
        slug: slug || undefined,
        content,
        published,
      };

      if (page) {
        await updateStorePage(page.id, input, token);
      } else {
        await createStorePage(input, token);
      }

      router.push("/dashboard/settings#store-pages");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.storePageSaveError);
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-start">
        <h4 className="text-xl font-black text-on-surface">{page ? t.storePageFormEditTitle : t.storePageFormAddTitle}</h4>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.storePageFormDesc}</p>
      </div>

      <form className="grid gap-5 p-5 text-start" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <RequiredLabel>{t.storePageTitleLabel}</RequiredLabel>
            <input className="input-field px-4 py-3 text-start" required value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-on-surface">{t.storePageSlugLabel}</span>
            <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder="return-policy" value={slug} onChange={(event) => setSlug(event.target.value)} />
          </label>
        </div>

        <DashboardAccordion title={t.storePageContentTitle} description={t.storePageContentDesc} defaultOpen>
        <label className="grid gap-2">
          <RequiredLabel>{t.storePageContentLabel}</RequiredLabel>
          <textarea className="input-field min-h-60 px-4 py-3 text-start leading-8" required value={content} onChange={(event) => setContent(event.target.value)} />
        </label>
        </DashboardAccordion>

        <label className="flex items-center justify-end gap-2 text-sm font-bold text-on-surface">
          <span>{t.storePagePublished}</span>
          <input checked={published} className="h-4 w-4" type="checkbox" onChange={(event) => setPublished(event.target.checked)} />
        </label>

        {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link className="secondary-button px-6 py-3 text-center" href="/dashboard/settings#store-pages">
            {t.cancelPageForm}
          </Link>
          <button className="primary-button px-8 py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? t.savingPageForm : t.savePageForm}
          </button>
        </div>
      </form>
    </section>
  );
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

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
