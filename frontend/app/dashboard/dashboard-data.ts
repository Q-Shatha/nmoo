import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, getMe, getMyTheme } from "@/lib/api";

export type VendorDashboardBase =
  | {
      ok: true;
      token: string;
      user: Awaited<ReturnType<typeof getMe>>;
      theme: Awaited<ReturnType<typeof getMyTheme>>;
    }
  | {
      ok: false;
      message: string;
      needsLogin: boolean;
    };

export async function loadVendorDashboardBase(nextPath = "/dashboard"): Promise<VendorDashboardBase> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  try {
    const [user, theme] = await Promise.all([getMe(token), getMyTheme(token)]);

    if (user.role === "BUYER") {
      return {
        ok: false,
        needsLogin: false,
        message: "VENDOR_ONLY",
      };
    }

    return {
      ok: true,
      token,
      user,
      theme,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    }

    return {
      ok: false,
      needsLogin: false,
      message: error instanceof ApiError ? error.message : "LOAD_ERROR",
    };
  }
}

export function getVendorStoreHref(user: Awaited<ReturnType<typeof getMe>>) {
  return user.storeUsername ? `/${user.storeUsername}` : `/vendors/${user.id}`;
}
