import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getStorePage } from "@/lib/api";
import { getStoreTemplate } from "@/lib/store-templates";
import { themeToStyle } from "@/lib/theme";
import { getLocale, getT } from "@/lib/i18n/server";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";

type StorePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePageView({ params }: StorePageProps) {
  const { id } = await params;
  const [page, t, locale] = await Promise.all([loadPage(id), getT(), getLocale()]);
  const isEn = locale === "en";
  const isAr = locale === "ar";
  const displayTitle = isEn ? (page.titleEn || page.title) : isAr ? (page.titleAr || page.title) : page.title;
  const displayContent = isEn ? (page.contentEn || page.content) : isAr ? (page.contentAr || page.content) : page.content;
  const template = getStoreTemplate(page.vendor?.theme?.templateId);

  return (
    <div className={`min-h-screen text-on-surface ${template.className}`} style={page.vendor?.theme ? { ...themeToStyle(page.vendor.theme), backgroundColor: "var(--color-background)" } : undefined}>
      <PublicHeader
        active="store"
        storeHref={page.vendor?.storeUsername ? `/${page.vendor.storeUsername}/storefront` : `/vendors/${page.vendorId}/storefront`}
        profileHref={page.vendor?.storeUsername ? `/${page.vendor.storeUsername}` : `/vendors/${page.vendorId}`}
        vendorId={page.vendorId}
        storeLogoUrl={page.vendor?.theme?.logoUrl}
      />
      <main className="app-container min-h-screen pt-8">
        <article className="panel mx-auto max-w-4xl p-6 text-start md:p-10">
          <p className="chip px-4 py-2 text-sm">{page.vendor?.name ?? t.storePagesDefaultStore}</p>
          <h1 className="mt-5 text-4xl font-black text-primary">{displayTitle}</h1>
          <p className="mt-3 text-sm text-on-surface-variant">{t.storePagesLastUpdated(formatDate(page.updatedAt))}</p>
          <div className="mt-8 whitespace-pre-line text-lg leading-10 text-on-surface-variant">{displayContent}</div>
          <Link className="secondary-button mt-8 px-6 py-3" href={page.vendor?.storeUsername ? `/${page.vendor.storeUsername}` : `/vendors/${page.vendorId}`}>
            {t.storePagesBackToStore}
          </Link>
        </article>
      </main>
      <PublicFooter theme={page.vendor?.theme} />
    </div>
  );
}

async function loadPage(id: string) {
  try {
    return await getStorePage(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
  }).format(new Date(value));
}
