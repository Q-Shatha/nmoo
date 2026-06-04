import { ApiError, getMyShippingMethods } from "@/lib/api";
import { DashboardShell, DashboardUnavailable } from "../../DashboardShell";
import { loadVendorDashboardBase } from "../../dashboard-data";
import { ShippingMethodForm } from "../../ShippingMethodForm";

type PageProps = {
  params: Promise<{ methodId: string }>;
};

export default async function EditShippingMethodPage({ params }: PageProps) {
  const { methodId } = await params;
  const data = await loadPageData(methodId);

  return (
    <DashboardShell
      active="shipping"
      title="تعديل شركة الشحن"
      description="عدّل بيانات شركة الشحن ومناطق التوصيل وخيار الدفع عند الاستلام"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
    >
      {data.ok ? <ShippingMethodForm method={data.method} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

async function loadPageData(methodId: string) {
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
        message: "شركة الشحن غير موجودة.",
      };
    }

    return {
      ok: true as const,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      method,
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل شركة الشحن.",
    };
  }
}
