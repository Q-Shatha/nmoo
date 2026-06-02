import Link from "next/link";
import { PublicFooter } from "./components/PublicFooter";
import { PublicHeader } from "./components/PublicHeader";

const features = [
  {
    stat: "01",
    title: "إطلاق متجر سريع",
    description: "واجهة جاهزة ومنظمة لإضافة المنتجات واستقبال الطلبات بدون تعقيد.",
  },
  {
    stat: "02",
    title: "إدارة يومية سهلة",
    description: "تابع المبيعات والطلبات والعملاء من لوحة تحكم واحدة واضحة.",
  },
  {
    stat: "03",
    title: "تجربة شراء عربية",
    description: "تصميم من اليمين لليسار، نصوص واضحة، وأزرار مهيأة للشراء السريع.",
  },
];

export default function Home() {
  return (
    <>
      <PublicHeader active="home" />

      <main className="pt-8">
        <section className="hero-gradient py-16 lg:py-24">
          <div className="app-container grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="order-2 lg:order-1">
              <div className="panel overflow-hidden p-4 shadow-2xl">
                <div className="aspect-[4/3] rounded-xl bg-surface-container-lowest p-5">
                  <div className="flex h-full flex-col rounded-lg border border-outline-variant/20 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-primary">لوحة المتجر</p>
                        <p className="text-xs text-on-surface-variant">تحديث مباشر للطلبات</p>
                      </div>
                      <div className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                        نشط
                      </div>
                    </div>
                    <div className="grid flex-1 grid-cols-5 gap-4 p-5">
                      <div className="col-span-2 space-y-3">
                        <div className="rounded-xl bg-primary-container/30 p-4">
                          <p className="text-sm text-on-surface-variant">المبيعات</p>
                          <p className="mt-2 text-2xl font-bold text-primary">12,450 ر.س</p>
                        </div>
                        <div className="rounded-xl bg-secondary-container/25 p-4">
                          <p className="text-sm text-on-surface-variant">الطلبات</p>
                          <p className="mt-2 text-2xl font-bold text-secondary">184</p>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-end gap-2 rounded-xl bg-surface-container-low p-4">
                        {[35, 58, 42, 74, 62, 88].map((height) => (
                          <span
                            key={height}
                            className="flex-1 rounded-t-lg bg-primary"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 max-w-2xl text-right lg:order-2">
              <div className="chip mb-5 px-4 py-2 text-sm">
                مستقبل التجارة الإلكترونية بين يديك
              </div>
              <h1 className="section-title text-4xl md:text-6xl">
                ابدأ تجارة أحلامك اليوم
              </h1>
              <p className="section-copy mt-6 max-w-2xl text-lg">
                منصة nmoo نمو توفر لك كل ما تحتاجه لإطلاق متجرك الإلكتروني في دقائق:
                إدارة منتجات، متابعة طلبات، وتجربة شراء مرتبة تساعد عملاءك على الوصول
                لما يريدون بسرعة.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/register" className="primary-button px-8 py-4 text-lg">
                  ابدأ مجانا
                </Link>
                <Link href="/register" className="secondary-button px-8 py-4 text-lg">
                  شاهد المتجر
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest py-16">
          <div className="app-container">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="section-title text-3xl md:text-4xl">
                واجهة واحدة لكل مراحل البيع
              </h2>
              <p className="section-copy mt-4 text-lg">
                نفس اللغة البصرية في المتجر ولوحة التحكم، حتى يشعر المستخدم أن كل شيء
                منظم ومألوف.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="panel p-7">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container/35 text-lg font-bold text-primary">
                    {feature.stat}
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-on-surface">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-on-surface-variant">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="app-container">
            <div className="rounded-2xl bg-primary-container/25 p-8 text-center md:p-12">
              <h2 className="section-title text-3xl">جاهز لإطلاق مشروعك؟</h2>
              <p className="section-copy mx-auto mt-4 max-w-2xl text-lg">
                جرّب المتجر ولوحة التحكم بنفس التصميم المتناسق، وابدأ بتطوير تجربتك
                خطوة بخطوة.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register" className="primary-button w-full px-8 py-4 sm:w-auto">
                  ابدأ كتاجر
                </Link>
                <Link href="/register" className="secondary-button w-full px-8 py-4 sm:w-auto">
                  تصفح المتجر
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
