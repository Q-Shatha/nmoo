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
  const params = searchParams ? await searchParams : {};

  return (
    <>
      <PublicHeader />
      <main className="app-container flex min-h-screen items-center justify-center pt-8">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-primary-container/30 p-8 text-right lg:p-10">
            <p className="chip px-4 py-2 text-sm">nmoo نمو</p>
            <h1 className="section-title mt-6 text-3xl md:text-4xl">تسجيل الدخول</h1>
            <p className="section-copy mt-4">ادخل إلى لوحة التحكم لإدارة المنتجات والطلبات ومتابعة بيانات متجرك.</p>
            <div className="mt-8 rounded-xl bg-surface-container-lowest/75 p-5 text-sm leading-7 text-on-surface-variant">
              <p className="font-bold text-on-surface">حسابات تجريبية:</p>
              <p>التاجر: vendor@nmoo.test</p>
              <p>العميل: buyer@nmoo.test</p>
              <p>كلمة المرور: Nmoo12345</p>
            </div>
          </div>
          <LoginForm initialMessage={params.error} nextPath={params.next ?? ""} />
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
