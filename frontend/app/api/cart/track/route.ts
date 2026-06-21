import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const body = await req.json();
    await fetch(`${API_BASE}/cart/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    // fire-and-forget — never fail the caller
  }

  return NextResponse.json({ ok: true });
}
