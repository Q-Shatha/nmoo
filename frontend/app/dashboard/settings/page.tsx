import { ApiError, getMyStorePages } from "@/lib/api";
import { DashboardShell, DashboardUnavailable } from "../DashboardShell";
import { getVendorStoreHref, loadVendorDashboardBase } from "../dashboard-data";
import { StorePageManager } from "../StorePageManager";
import { StoreLifecycleManager } from "../StoreLifecycleManager";
import { StoreUsernameManager } from "../StoreUsernameManager";
import { ThemeManager } from "../ThemeManager";

export default async function DashboardSettingsPage() {
  const data = await loadPageData();

  return (
    <DashboardShell
      active="settings"
      title="إعدادات المتجر"
      description="رابط المتجر، الهوية البصرية، وصفحات المتجر"
      userName={data.ok ? data.user.name : "التاجر"}
      logoUrl={data.ok ? data.theme.logoUrl : null}
      storeHref={data.ok ? getVendorStoreHref(data.user) : undefined}
    >
      {data.ok ? (
        <>
          <StoreUsernameManager initialUsername={data.user.storeUsername} />
          <ThemeManager initialTheme={data.theme} />
          <StorePageManager initialPages={data.storePages} />
          <StoreLifecycleManager initialStatus={data.theme.storeStatus} />
        </>
      ) : (
        <DashboardUnavailable message={data.message} needsLogin={data.needsLogin} />
      )}
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
      user: base.user,
      theme: base.theme,
      storePages: await getMyStorePages(base.token),
    };
  } catch (error) {
    return {
      ok: false as const,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل إعدادات المتجر.",
    };
  }
}
