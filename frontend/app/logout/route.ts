import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.set("nmoo_access_token", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  redirect("/login");
}
