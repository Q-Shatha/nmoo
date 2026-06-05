import { cookies } from "next/headers";
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

export async function loadVendorDashboardBase(): Promise<VendorDashboardBase> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      needsLogin: true,
      message: "سجل الدخول بحساب التاجر حتى تفتح لوحة التحكم.",
    };
  }

  try {
    const [user, theme] = await Promise.all([getMe(token), getMyTheme(token)]);

    if (user.role === "BUYER") {
      return {
        ok: false,
        needsLogin: false,
        message: "لوحة التحكم مخصصة للتجار فقط.",
      };
    }

    return {
      ok: true,
      token,
      user,
      theme,
    };
  } catch (error) {
    return {
      ok: false,
      needsLogin: error instanceof ApiError && error.status === 401,
      message: error instanceof ApiError ? error.message : "تعذر تحميل بيانات لوحة التحكم.",
    };
  }
}

export function getVendorStoreHref(user: Awaited<ReturnType<typeof getMe>>) {
  return user.storeUsername ? `/${user.storeUsername}` : `/vendors/${user.id}`;
}
