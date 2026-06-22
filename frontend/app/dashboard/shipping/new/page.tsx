import { getT } from "@/lib/i18n/server";
import { DashboardShell, DashboardUnavailable } from "../../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../../dashboard-data";
import { ShippingMethodForm } from "../../ShippingMethodForm";

export default async function NewShippingMethodPage() {
  const t = await getT();
  const base = await loadVendorDashboardBase();

  return (
    <DashboardShell
      active="shipping"
      title={t.addShippingMethod2}
      description={t.newShippingPageDesc}
      userName={base.ok ? base.user.name : t.defaultMerchant}
      logoUrl={base.ok ? base.theme.logoUrl : null}
      storeHref={base.ok ? getVendorStoreHref(base.user) : undefined}
    >
      {base.ok ? <ShippingMethodForm /> : <DashboardUnavailable message={base.message} needsLogin={base.needsLogin} />}
    </DashboardShell>
  );
}
