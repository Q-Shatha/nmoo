import { ApiError, getMyShippingMethods } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { DashboardShell, DashboardUnavailable } from "../../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../../dashboard-data";
import { ShippingMethodForm } from "../../ShippingMethodForm";

type PageProps = {
  params: Promise<{ methodId: string }>;
};

export default async function EditShippingMethodPage({ params }: PageProps) {
  const { methodId } = await params;
  const t = await getT();
  const data = await loadPageData(methodId, t.shippingMethodNotFound, t.shippingMethodLoadError);

  return (
    <DashboardShell
      active="shipping"
      title={t.editShippingMethod}
      description={t.editShippingPageDesc}
      userName={data.ok ? data.userName : t.defaultMerchant}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <ShippingMethodForm method={data.method} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

async function loadPageData(methodId: string, notFoundMsg: string, loadErrorMsg: string) {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    const methods = await getMyShippingMethods(base.token);
    const method = methods.find((item) => item.id === methodId);

    if (!method) {
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
      method,
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : loadErrorMsg,
    };
  }
}
