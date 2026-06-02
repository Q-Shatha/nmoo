import { ApiError, getMyShippingMethods } from "@/lib/api";
import { DashboardShell, DashboardUnavailable } from "../DashboardShell";
import { loadVendorDashboardBase } from "../dashboard-data";
import { ShippingMethodManager } from "../ShippingMethodManager";

export default async function DashboardShippingPage() {
  const data = await loadPageData();

  return (
    <DashboardShell
      active="shipping"
      title="الشحن"
      description="إدارة شركات الشحن المتاحة لمتجرك"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
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
      shippingMethods: await getMyShippingMethods(base.token),
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل شركات الشحن.",
    };
  }
}
