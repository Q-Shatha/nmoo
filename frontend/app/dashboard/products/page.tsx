import { ApiError, getMyCategories, getMyProducts } from "@/lib/api";
import { DashboardProductManager } from "../DashboardProductManager";
import { DashboardShell, DashboardUnavailable } from "../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../dashboard-data";
import { getT } from "@/lib/i18n/server";

export default async function DashboardProductsPage() {
  const [data, t] = await Promise.all([loadPageData(), getT()]);

  return (
    <DashboardShell
      active="products"
      title={t.products}
      description={t.productsDesc}
      userName={data.ok ? data.userName : t.defaultMerchant}
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
      message: error instanceof ApiError ? error.message : "Failed to load products.",
    };
  }
}
