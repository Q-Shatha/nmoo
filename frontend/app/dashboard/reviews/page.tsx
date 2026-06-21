import { ApiError, getDashboardReviews, Review } from "@/lib/api";
import { DashboardShell, DashboardUnavailable } from "../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../dashboard-data";
import { ReviewModerationPanel } from "./ReviewModerationPanel";

export default async function DashboardReviewsPage() {
  const data = await loadPageData();

  return (
    <DashboardShell
      active="reviews"
      title="التقييمات"
      description="راجع تقييمات العملاء وانشر ما تراه مناسباً"
      userName={data.ok ? data.userName : "التاجر"}
      logoUrl={data.ok ? data.logoUrl : null}
      storeHref={data.ok ? data.storeHref : undefined}
    >
      {data.ok ? (
        <ReviewModerationPanel
          token={data.token}
          initialReviews={data.reviews}
        />
      ) : (
        <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />
      )}
    </DashboardShell>
  );
}

async function loadPageData() {
  const base = await loadVendorDashboardBase("/dashboard/reviews");
  if (!base.ok) return base;

  try {
    return {
      ok: true as const,
      token: base.token,
      userName: base.user.name,
      logoUrl: base.theme.logoUrl,
      storeHref: getVendorStoreHref(base.user),
      reviews: await getDashboardReviews(base.token),
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل التقييمات.",
    };
  }
}
