import { ApiError, getMyDiscountCodes, getMyProducts } from "@/lib/api";
import { DashboardShell, DashboardUnavailable } from "../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../dashboard-data";
import { DiscountCodeManager } from "../DiscountCodeManager";

export default async function DashboardDiscountsPage() {
  const data = await loadPageData();

  return (
    <DashboardShell
      active="discounts"
      title="التخفيضات"
      description="إدارة أكواد التخفيض وحدود استخدامها"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? <DiscountCodeManager initialCodes={data.discountCodes} products={data.products} /> : <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />}
    </DashboardShell>
  );
}

async function loadPageData() {
  const base = await loadVendorDashboardBase();

  if (!base.ok) {
    return base;
  }

  try {
    const [discountCodes, products] = await Promise.all([
      getMyDiscountCodes(base.token),
      getMyProducts(base.token),
    ]);
    return {
      ok: true as const,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      discountCodes,
      products,
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل أكواد التخفيض.",
    };
  }
}
