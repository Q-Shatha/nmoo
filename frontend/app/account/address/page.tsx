import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getMe } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";
import { AddressForm } from "./AddressForm";

type AddressData =
  | { ok: true; user: Awaited<ReturnType<typeof getMe>> }
  | { ok: false; message: string };

type T = Awaited<ReturnType<typeof getT>>;

export default async function AddressPage() {
  const t = await getT();
  const data = await loadAccount(t);

  return (
    <>
      <PublicHeader />
      <main className="app-container min-h-screen pt-8">
        <section className="mx-auto max-w-4xl">
          <div className="mb-8 text-start">
            <p className="chip px-4 py-2 text-sm">{t.addressPageChip}</p>
            <h1 className="section-title mt-4 text-4xl">{t.addressPageTitle}</h1>
            <p className="section-copy mt-3">{t.addressPageDesc}</p>
          </div>

          {data.ok ? <AddressForm user={data.user} /> : <Unavailable message={data.message} t={t} />}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

function Unavailable({ message, t }: { message: string; t: T }) {
  return (
    <section className="panel p-8 text-center">
      <h2 className="text-2xl font-black text-primary">{t.loginRequiredAddress}</h2>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/account/address">
        {t.loginBtn}
      </Link>
    </section>
  );
}

async function loadAccount(t: T): Promise<AddressData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return { ok: false, message: t.loginFirstAddress };
  }

  try {
    return { ok: true, user: await getMe(token) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : t.failedToLoadAddressAccount,
    };
  }
}
