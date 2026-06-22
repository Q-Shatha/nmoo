import { ApiError, getMyCategories, getMyProducts } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { DashboardShell, DashboardUnavailable } from "../../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../../dashboard-data";
import { EditProductForm } from "./EditProductForm";

type EditProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params;
  const t = await getT();
  const data = await loadPageData(productId, t.editProductPageError, t.productNotFoundOrForbidden);

  return (
    <DashboardShell
      active="products"
      title={t.editProductPageTitle}
      description={t.editProductPageDesc}
      userName={data.ok ? data.userName : t.defaultMerchant}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <EditProductForm categories={data.categories} product={data.product} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

async function loadPageData(productId: string, errorMessage: string, notFoundMessage: string) {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    const [categories, products] = await Promise.all([getMyCategories(base.token), getMyProducts(base.token)]);
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return {
        ok: false as const,
        needsLogin: false,
        message: notFoundMessage,
      };
    }

    return {
      ok: true as const,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      categories,
      product,
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : errorMessage,
    };
  }
}
