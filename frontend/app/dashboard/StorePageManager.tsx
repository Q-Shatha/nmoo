"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiEdit3, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { TbFileSearch } from "react-icons/tb";
import { ApiError, createStorePage, deleteStorePage, StorePage, updateStorePage } from "@/lib/api";

type StorePageDraft = {
  title: string;
  slug: string;
  content: string;
  published: boolean;
};

const emptyDraft: StorePageDraft = {
  title: "",
  slug: "",
  content: "",
  published: true,
};

export function StorePageManager({ initialPages }: { initialPages: StorePage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [draft, setDraft] = useState<StorePageDraft>(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function startEdit(page: StorePage) {
    setEditingId(page.id);
    setDraft({
      title: page.title,
      slug: page.slug,
      content: page.content,
      published: page.published,
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId("");
    setDraft(emptyDraft);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const input = {
        title: draft.title,
        slug: draft.slug || undefined,
        content: draft.content,
        published: draft.published,
      };

      if (editingId) {
        const updated = await updateStorePage(editingId, input, token);
        setPages((current) => current.map((page) => (page.id === updated.id ? updated : page)));
        setMessage("تم تحديث صفحة المتجر.");
      } else {
        const created = await createStorePage(input, token);
        setPages((current) => [created, ...current]);
        setMessage("تمت إضافة صفحة المتجر.");
      }

      resetForm();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ صفحة المتجر.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(page: StorePage) {
    const confirmed = window.confirm(`حذف صفحة "${page.title}"؟`);

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      await deleteStorePage(page.id, token);
      setPages((current) => current.filter((item) => item.id !== page.id));
      if (editingId === page.id) {
        resetForm();
      }
      setMessage("تم حذف الصفحة.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حذف الصفحة.");
    }
  }

  async function togglePublished(page: StorePage) {
    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      const updated = await updateStorePage(page.id, { published: !page.published }, token);
      setPages((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر تغيير حالة النشر.");
    }
  }

  return (
    <section id="store-pages" className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-right">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link className="primary-button px-6 py-3 text-center" href="/dashboard/settings/pages/new">
            إضافة صفحة
          </Link>
          <h4 className="text-xl font-black text-on-surface">مدونة وصفحات المتجر</h4>
        </div>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">أضف صفحات مثل سياسة الاسترجاع أو شرح عام عن المتجر. الصفحات المنشورة تظهر في الفوتر آخر الموقع.</p>
      </div>

      {false ? <form className="grid gap-4 border-b border-outline-variant/15 p-5 text-right" dir="rtl" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <RequiredLabel>عنوان الصفحة</RequiredLabel>
            <input className="input-field px-4 py-3 text-right" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-on-surface">الرابط المختصر</span>
            <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder="return-policy" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
          </label>
        </div>

        <label className="grid gap-2">
          <RequiredLabel>المحتوى</RequiredLabel>
          <textarea className="input-field min-h-44 px-4 py-3 text-right leading-8" required value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} />
        </label>

        <label className="flex items-center justify-end gap-2 text-sm font-bold text-on-surface">
          <span>منشورة في الفوتر</span>
          <input checked={draft.published} className="h-4 w-4" type="checkbox" onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {editingId ? (
            <button className="secondary-button px-6 py-3" type="button" onClick={resetForm}>
              إلغاء التعديل
            </button>
          ) : null}
          <button className="primary-button px-8 py-3 disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "إضافة صفحة"}
          </button>
        </div>
      </form> : null}

      {message ? <p className="mx-5 mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <div className="grid gap-3 p-5">
        {pages.length === 0 ? (
          <p className="py-6 text-center font-bold text-on-surface-variant">لا توجد صفحات بعد.</p>
        ) : (
          pages.map((page) => (
            <article key={page.id} className="grid gap-4 rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-4 text-right lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${page.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {page.published ? "منشورة" : "مسودة"}
                  </span>
                  <h5 className="text-lg font-black text-on-surface">{page.title}</h5>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">الرابط: {page.slug}</p>
                <p className="mt-3 line-clamp-2 leading-7 text-on-surface-variant">{page.content}</p>
              </div>
              <div className="grid grid-cols-4 gap-2 lg:flex lg:flex-col">
                <a className="secondary-button flex h-11 w-full items-center justify-center p-0 text-[0px] lg:w-11" href={`/store-pages/${page.id}`} target="_blank" title="عرض" aria-label={`عرض ${page.title}`}>
                  <TbFileSearch aria-hidden="true" className="h-6 w-6" />
                </a>
                <Link className="secondary-button flex h-11 w-full items-center justify-center p-0 text-[0px] lg:w-11" title="تعديل" aria-label={`تعديل ${page.title}`} href={`/dashboard/settings/pages/${page.id}`}>
                  <FiEdit3 aria-hidden="true" className="h-5 w-5" />
                </Link>
                <button className="secondary-button h-11 w-full p-0 text-[0px] lg:w-11" type="button" title={page.published ? "إخفاء" : "نشر"} aria-label={`${page.published ? "إخفاء" : "نشر"} ${page.title}`} onClick={() => togglePublished(page)}>
                  {page.published ? <FiEyeOff aria-hidden="true" className="h-5 w-5" /> : <FiEye aria-hidden="true" className="h-5 w-5" />}
                </button>
                <button className="flex h-11 w-full items-center justify-center rounded-lg border border-error/30 p-0 text-[0px] font-bold text-error hover:bg-error-container/40 lg:w-11" type="button" title="حذف" aria-label={`حذف ${page.title}`} onClick={() => handleDelete(page)}>
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

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
