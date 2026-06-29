import { redirect } from "next/navigation";
import { getT } from "@/lib/i18n/server";
import { PublicHeader } from "../../components/PublicHeader";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import Link from "next/link";

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; plan?: string; message?: string }>;
}) {
  const params = await searchParams;
  const t = await getT();
  const success = params.status === "paid";
  const plan = params.plan ?? "free";

  if (success) {
    // TODO: notify backend of successful payment
  }

  return (
    <>
      <PublicHeader hideCart hideLogo />
      <main className="app-container flex min-h-screen items-center justify-center py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-10 text-center shadow-xl">
          {success ? (
            <>
              <HiCheckCircle className="mx-auto text-6xl text-primary" />
              <h1 className="mt-4 text-2xl font-black text-on-surface">تم الدفع بنجاح 🎉</h1>
              <p className="mt-3 text-on-surface-variant">تم تفعيل اشتراكك. يمكنك الآن البدء في إعداد متجرك.</p>
              <Link href="/dashboard" className="primary-button mt-8 inline-block px-8 py-3">
                الذهاب للوحة التحكم
              </Link>
            </>
          ) : (
            <>
              <HiXCircle className="mx-auto text-6xl text-error" />
              <h1 className="mt-4 text-2xl font-black text-on-surface">فشلت عملية الدفع</h1>
              <p className="mt-3 text-on-surface-variant">
                {params.message ?? "حدث خطأ أثناء الدفع. يرجى المحاولة مرة أخرى."}
              </p>
              <Link
                href={`/subscribe/plans?plan=${plan}`}
                className="primary-button mt-8 inline-block px-8 py-3"
              >
                حاول مرة أخرى
              </Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
