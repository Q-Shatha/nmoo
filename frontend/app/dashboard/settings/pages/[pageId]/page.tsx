import { ApiError, getMyStorePages } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { DashboardShell, DashboardUnavailable } from "../../../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../../../dashboard-data";
import { StorePageForm } from "../../../StorePageForm";

type PageProps = {
  params: Promise<{ pageId: string }>;
};

export default async function EditStorePagePage({ params }: PageProps) {
  const { pageId } = await params;
  const t = await getT();
  const data = await loadPageData(pageId, t.storePageNotFound, t.storePageLoadError);

  return (
    <DashboardShell
      active="settings"
      title={t.editStorePageTitle}
      description={t.editStorePageDesc}
      userName={data.ok ? data.userName : t.defaultMerchant}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <StorePageForm page={data.page} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

async function loadPageData(pageId: string, notFoundMsg: string, loadErrorMsg: string) {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    const pages = await getMyStorePages(base.token);
    const page = pages.find((item) => item.id === pageId);

    if (!page) {
      return {
        ok: false as const,
        needsLogin: false,
        message: notFoundMsg,
      };
    }

    return {
      ok: true as const,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      page,
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : loadErrorMsg,
    };
  }
}
