import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";
import { VendorRegisterForm } from "./VendorRegisterForm";
import { HiCheckCircle, HiShoppingBag } from "react-icons/hi";

const PLAN_INFO = {
  free:     { nameAr: "المجانية",  nameEn: "Free",     priceAr: "٠ ريال",    priceEn: "$0",  color: "text-on-surface" },
  standard: { nameAr: "القياسية", nameEn: "Standard",  priceAr: "٤٥ ريال",  priceEn: "$12", color: "text-primary" },
  premium:  { nameAr: "المميزة",  nameEn: "Premium",   priceAr: "٩٠ ريال",  priceEn: "$24", color: "text-secondary" },
} as const;

type Plan = keyof typeof PLAN_INFO;

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; locale?: string }>;
}) {
  const params = await searchParams;
  const plan = (params.plan ?? "free") as Plan;
  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.free;
  const t = await getT();

  const benefits = [
    t.landingGlobal,
    t.landingUniqueUrl,
    t.landingFastLaunch,
    t.landingStatLanguages,
  ];

  return (
    <>
      <PublicHeader hideLogo />
      <main className="app-container flex min-h-screen items-center justify-center py-16">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* ── left panel ── */}
          <div className="bg-secondary-container p-8 text-start text-on-secondary-container lg:p-10">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
              <HiShoppingBag />
              {t.vendorAccountType}
            </div>

            <h1 className="mt-6 text-3xl font-black md:text-4xl">{t.createNewAccountTitle}</h1>
            <p className="mt-4 leading-8 text-on-secondary-container/80">{t.registerDesc}</p>

            {/* selected plan badge */}
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-on-secondary-container/60">
                {t.landingPricingBadge}
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                <span className="text-on-secondary-container">{planInfo.nameAr}</span>
                <span className="mx-2 text-on-secondary-container/40">·</span>
                <span className="text-on-secondary-container/80">{planInfo.priceAr}</span>
                <span className="text-sm font-normal text-on-secondary-container/60"> / شهر</span>
              </p>
              <p className="mt-0.5 text-sm text-on-secondary-container/60">
                {planInfo.nameEn} · {planInfo.priceEn} / month
              </p>
            </div>

            <ul className="mt-6 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-on-secondary-container/80">
                  <HiCheckCircle className="shrink-0 text-base text-on-secondary-container/60" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* ── right panel: registration form ── */}
          <VendorRegisterForm plan={plan} />
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
