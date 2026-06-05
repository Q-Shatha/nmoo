import { ApiError, getMyCategories } from "@/lib/api";
import { DashboardShell, DashboardUnavailable } from "../../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../../dashboard-data";
import { AddProductForm } from "./AddProductForm";

export default async function NewProductPage() {
  const data = await loadPageData();

  return (
    <DashboardShell
      active="products"
      title="إضافة منتج"
      description="أدخل بيانات المنتج والصور والكمية من صفحة مخصصة"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <AddProductForm categories={data.categories} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
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
      categories: await getMyCategories(base.token),
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل صفحة إضافة المنتج.",
    };
  }
}
