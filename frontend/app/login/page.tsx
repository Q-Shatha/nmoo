import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, t] = await Promise.all([
    searchParams ? searchParams : Promise.resolve({}),
    getT(),
  ]);

  return (
    <>
      <PublicHeader hideLogo />
      <main className="app-container flex min-h-screen items-center justify-center pt-8">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-primary-container/30 p-8 text-start lg:p-10">
            <p className="chip px-4 py-2 text-sm">{t.loginPageChip}</p>
            <h1 className="section-title mt-6 text-3xl md:text-4xl">{t.loginTitle}</h1>
            <p className="section-copy mt-4">{t.loginSubtitle}</p>
            <div className="mt-8 rounded-xl bg-surface-container-lowest/75 p-5 text-sm leading-7 text-on-surface-variant">
              <p className="font-bold text-on-surface">{t.demoAccounts}</p>
              <p>{t.vendorAccount}</p>
              <p>{t.buyerAccount}</p>
              <p>{t.loginPassword}</p>
            </div>
          </div>
          <LoginForm initialMessage={(params as { error?: string }).error} nextPath={(params as { next?: string }).next ?? ""} />
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
