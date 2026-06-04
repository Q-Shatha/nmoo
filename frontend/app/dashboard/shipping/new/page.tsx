import { DashboardShell, DashboardUnavailable } from "../../DashboardShell";
import { loadVendorDashboardBase } from "../../dashboard-data";
import { ShippingMethodForm } from "../../ShippingMethodForm";

export default async function NewShippingMethodPage() {
  const base = await loadVendorDashboardBase();

  return (
    <DashboardShell
      active="shipping"
      title="إضافة شركة شحن"
      description="أضف شركة شحن جديدة وحدد مناطق التوصيل وخيارات الدفع الخاصة بها"
      userName={base.ok ? base.user.name : "التاجر"}
      logoUrl={base.ok ? base.theme.logoUrl : null}
    >
      {base.ok ? <ShippingMethodForm /> : <DashboardUnavailable message={base.message} needsLogin={base.needsLogin} />}
    </DashboardShell>
  );
}
