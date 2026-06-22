import { ApiError, getMyShippingMethods } from "@/lib/api";
import { DashboardShell, DashboardUnavailable } from "../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../dashboard-data";
import { ShippingMethodManager } from "../ShippingMethodManager";
import { getT } from "@/lib/i18n/server";

export default async function DashboardShippingPage() {
  const [data, t] = await Promise.all([loadPageData(), getT()]);

  return (
    <DashboardShell
      active="shipping"
      title={t.shipping}
      description={t.shippingDesc}
      userName={data.ok ? data.userName : t.defaultMerchant}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <ShippingMethodManager initialMethods={data.shippingMethods} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

async function loadPageData() {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    return {
      ok: true as const,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      shippingMethods: await getMyShippingMethods(base.token),
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "Failed to load carriers.",
    };
  }
}
