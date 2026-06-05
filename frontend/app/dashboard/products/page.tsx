import { ApiError, getMyCategories, getMyProducts } from "@/lib/api";
import { DashboardProductManager } from "../DashboardProductManager";
import { DashboardShell, DashboardUnavailable } from "../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../dashboard-data";

export default async function DashboardProductsPage() {
  const data = await loadPageData();

  return (
    <DashboardShell
      active="products"
      title="المنتجات"
      description="إضافة وتعديل وحذف منتجات المتجر"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <DashboardProductManager categories={data.categories} initialProducts={data.products} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

async function loadPageData() {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    const [categories, products] = await Promise.all([getMyCategories(base.token), getMyProducts(base.token)]);

    return {
      ok: true as const,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      categories,
      products,
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل المنتجات.",
    };
  }
}
