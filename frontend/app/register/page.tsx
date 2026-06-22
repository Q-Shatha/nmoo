import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  const t = await getT();

  return (
    <>
      <PublicHeader />
      <main className="app-container flex min-h-screen items-center justify-center pt-8">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-secondary-container p-8 text-start text-on-secondary-container lg:p-10">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold">{t.registerPageChip}</p>
            <h1 className="mt-6 text-3xl font-black md:text-4xl">{t.createNewAccountTitle}</h1>
            <p className="mt-4 leading-8 text-on-secondary-container/80">
              {t.registerDesc}
            </p>
          </div>
          <RegisterForm />
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
