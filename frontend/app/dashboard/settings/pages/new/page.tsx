import { getT } from "@/lib/i18n/server";
import { DashboardShell, DashboardUnavailable } from "../../../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../../../dashboard-data";
import { StorePageForm } from "../../../StorePageForm";

export default async function NewStorePagePage() {
  const t = await getT();
  const base = await loadVendorDashboardBase();

  return (
    <DashboardShell
      active="settings"
      title={t.newStorePageTitle}
      description={t.newStorePageDesc}
      userName={base.ok ? base.user.name : t.defaultMerchant}
      logoUrl={base.ok ? base.theme.logoUrl : null}
      storeHref={base.ok ? getVendorStoreHref(base.user) : undefined}
    >
      {base.ok ? <StorePageForm /> : <DashboardUnavailable message={base.message} needsLogin={base.needsLogin} />}
    </DashboardShell>
  );
}
