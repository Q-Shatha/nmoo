import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getStorePage } from "@/lib/api";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";

type StorePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePageView({ params }: StorePageProps) {
  const { id } = await params;
  const page = await loadPage(id);

  return (
    <>
      <PublicHeader
        active="store"
        storeHref={page.vendor?.storeUsername ? `/${page.vendor.storeUsername}/storefront` : `/vendors/${page.vendorId}/storefront`}
        profileHref={page.vendor?.storeUsername ? `/${page.vendor.storeUsername}` : `/vendors/${page.vendorId}`}
        vendorId={page.vendorId}
        storeLogoUrl={page.vendor?.theme?.logoUrl}
      />
      <main className="app-container min-h-screen pt-8" dir="rtl">
        <article className="panel mx-auto max-w-4xl p-6 text-right md:p-10">
          <p className="chip px-4 py-2 text-sm">{page.vendor?.name ?? "متجر نمو"}</p>
          <h1 className="mt-5 text-4xl font-black text-primary">{page.title}</h1>
          <p className="mt-3 text-sm text-on-surface-variant">آخر تحديث: {formatDate(page.updatedAt)}</p>
          <div className="mt-8 whitespace-pre-line text-lg leading-10 text-on-surface-variant">{page.content}</div>
          <Link className="secondary-button mt-8 px-6 py-3" href={page.vendor?.storeUsername ? `/${page.vendor.storeUsername}` : `/vendors/${page.vendorId}`}>
            العودة للمتجر
          </Link>
        </article>
      </main>
      <PublicFooter theme={page.vendor?.theme} />
    </>
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
