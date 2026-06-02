import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getMe } from "@/lib/api";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";
import { AddressForm } from "./AddressForm";

type AddressData =
  | {
      ok: true;
      user: Awaited<ReturnType<typeof getMe>>;
    }
  | {
      ok: false;
      message: string;
    };

export default async function AddressPage() {
  const data = await loadAccount();

  return (
    <>
      <PublicHeader />
      <main className="app-container min-h-screen pt-8">
        <section className="mx-auto max-w-4xl">
          <div className="mb-8 text-right">
            <p className="chip px-4 py-2 text-sm">عنوان العميل</p>
            <h1 className="section-title mt-4 text-4xl">إعداد عنوان الشحن</h1>
            <p className="section-copy mt-3">أدخل بيانات العنوان التفصيلية. العنوان الوطني يظهر فقط عند اختيار السعودية.</p>
          </div>

          {data.ok ? <AddressForm user={data.user} /> : <Unavailable message={data.message} />}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <section className="panel p-8 text-center">
      <h2 className="text-2xl font-black text-primary">تحتاج تسجيل دخول</h2>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/account/address">
        تسجيل الدخول
      </Link>
    </section>
  );
}

async function loadAccount(): Promise<AddressData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      message: "سجل الدخول أولا حتى تضيف عنوانك أو تعدله.",
    };
  }

  try {
    return {
      ok: true,
      user: await getMe(token),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل بيانات الحساب.",
    };
  }
}
