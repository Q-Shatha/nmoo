"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, createStorePage, StorePage, updateStorePage } from "@/lib/api";
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
      <button
        type="button"
        title="إضافة لغة"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-outline-variant/50 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        onClick={() => setOpen((v) => !v)}
      >
        <FiPlus className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute start-0 top-10 z-20 min-w-[130px] rounded-xl border border-outline-variant/30 bg-surface shadow-lg">
          {available.map((lang) => (
            <button
              key={lang.code}
              type="button"
              dir="ltr"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low"
              onClick={() => { onAdd(lang.code); setOpen(false); }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function StorePageForm({ page }: { page?: StorePage }) {
  const router = useRouter();
  const { t } = useI18n();
  const [title, setTitle] = useState(page?.title ?? "");
  const [titleAr, setTitleAr] = useState(page?.titleAr ?? "");
  const [titleEn, setTitleEn] = useState(page?.titleEn ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [contentAr, setContentAr] = useState(page?.contentAr ?? "");
  const [contentEn, setContentEn] = useState(page?.contentEn ?? "");
  const [published, setPublished] = useState(page?.published ?? true);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [addedLangs, setAddedLangs] = useState<string[]>(() => {
    const langs: string[] = [];
    if (page?.titleAr || page?.contentAr) langs.push("ar");
    if (page?.titleEn || page?.contentEn) langs.push("en");
    return langs;
  });

  function removeLang(lang: string) {
    setAddedLangs((current) => current.filter((l) => l !== lang));
    if (lang === "ar") { setTitleAr(""); setContentAr(""); }
    if (lang === "en") { setTitleEn(""); setContentEn(""); }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const input = {
        title,
        titleAr: addedLangs.includes("ar") ? titleAr || undefined : undefined,
        titleEn: addedLangs.includes("en") ? titleEn || undefined : undefined,
        slug: slug || undefined,
        content,
        contentAr: addedLangs.includes("ar") ? contentAr || undefined : undefined,
        contentEn: addedLangs.includes("en") ? contentEn || undefined : undefined,
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
        {/* Default section */}
        <div className="rounded-xl border border-outline-variant/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">Default</span>
            <span className="text-xs text-on-surface-variant">{t.defaultLangHint}</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <RequiredLabel>{t.storePageTitleLabel}</RequiredLabel>
              <input className="input-field px-4 py-3 text-start" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-on-surface">{t.storePageSlugLabel}</span>
              <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder="return-policy" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </label>
          </div>
          <div className="mt-4">
            <DashboardAccordion title={t.storePageContentTitle} description={t.storePageContentDesc} defaultOpen>
              <label className="grid gap-2">
                <RequiredLabel>{t.storePageContentLabel}</RequiredLabel>
                <textarea className="input-field min-h-60 px-4 py-3 text-start leading-8" required value={content} onChange={(e) => setContent(e.target.value)} />
              </label>
            </DashboardAccordion>
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
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error"
                  onClick={() => removeLang(lang)}
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-on-surface">{t.storePageTitleLabel}</span>
                  <input
                    className="input-field px-4 py-3 text-start"
                    dir={isAr ? "rtl" : "ltr"}
                    value={isAr ? titleAr : titleEn}
                    onChange={(e) => isAr ? setTitleAr(e.target.value) : setTitleEn(e.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-on-surface">{t.storePageContentLabel}</span>
                  <textarea
                    className="input-field min-h-60 px-4 py-3 text-start leading-8"
                    dir={isAr ? "rtl" : "ltr"}
                    value={isAr ? contentAr : contentEn}
                    onChange={(e) => isAr ? setContentAr(e.target.value) : setContentEn(e.target.value)}
                  />
                </label>
              </div>
            </div>
          );
        })}

        <AddLangButton addedLangs={addedLangs} onAdd={(lang) => setAddedLangs((current) => [...current, lang])} />

        <label className="flex items-center justify-end gap-2 text-sm font-bold text-on-surface">
          <span>{t.storePagePublished}</span>
          <input checked={published} className="h-4 w-4" type="checkbox" onChange={(e) => setPublished(e.target.checked)} />
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
      <span aria-hidden="true" className="text-error">*</span>
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
