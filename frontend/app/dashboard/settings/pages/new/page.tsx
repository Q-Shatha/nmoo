import { DashboardShell, DashboardUnavailable } from "../../../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../../../dashboard-data";
import { StorePageForm } from "../../../StorePageForm";

export default async function NewStorePagePage() {
  const base = await loadVendorDashboardBase();

  return (
    <DashboardShell
      active="settings"
      title="إضافة صفحة للمتجر"
      description="أضف صفحة تظهر في الفوتر مثل سياسة الاسترجاع أو تعريف المتجر"
      userName={base.ok ? base.user.name : "التاجر"}
      logoUrl={base.ok ? base.theme.logoUrl : null}
      storeHref={base.ok ? getVendorStoreHref(base.user) : undefined}
    >
      {base.ok ? <StorePageForm /> : <DashboardUnavailable message={base.message} needsLogin={base.needsLogin} />}
    </DashboardShell>
  );
}
