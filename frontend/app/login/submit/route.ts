import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";
const demoAccounts = {
  vendor: "vendor@nmoo.test",
  buyer: "buyer@nmoo.test",
} as const;

type AuthResponse = {
  accessToken: string;
  user: {
    role: "BUYER" | "VENDOR" | "ADMIN";
  };
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const demo = String(formData.get("demo") ?? "");
  const email = demo in demoAccounts ? demoAccounts[demo as keyof typeof demoAccounts] : String(formData.get("email") ?? "");
  const password = demo in demoAccounts ? "Nmoo12345" : String(formData.get("password") ?? "");
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? ""));

  try {
    const response = await fetch(new URL("/api/auth/login", API_BASE_URL), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return redirectToLogin(request, nextPath, "تعذر تسجيل الدخول. تأكد من البيانات وحاول مرة أخرى.");
    }

    const payload = (await response.json()) as AuthResponse;
    const fallbackPath = payload.user.role === "BUYER" ? "/" : "/dashboard";
    const redirectResponse = NextResponse.redirect(new URL(nextPath || fallbackPath, getRequestOrigin(request)), 303);
    redirectResponse.cookies.set("nmoo_access_token", payload.accessToken, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return redirectResponse;
  } catch {
    return redirectToLogin(request, nextPath, "تعذر الاتصال بالخادم. حاول مرة أخرى.");
  }
}

function redirectToLogin(request: NextRequest, nextPath: string, error: string) {
  const url = new URL("/login", getRequestOrigin(request));
  if (nextPath) {
    url.searchParams.set("next", nextPath);
  }
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

function sanitizeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "";
  }

  return value;
}

function getRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    return new URL(referer).origin;
  }

  const host = request.headers.get("host") ?? request.nextUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "") ?? "http";
  return `${protocol}://${host}`;
}
