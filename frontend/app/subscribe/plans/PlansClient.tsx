"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiCheckCircle, HiStar, HiLightningBolt, HiSparkles } from "react-icons/hi";
import { useI18n } from "@/lib/i18n/context";
import { MoyasarForm } from "./MoyasarForm";
import { StripeForm } from "./StripeForm";
import { PayPalForm } from "./PayPalForm";

type PlanKey = "free" | "standard" | "premium";

const PLANS = [
  {
    key: "free" as PlanKey,
    nameAr: "المجانية",
    nameEn: "Free",
    priceAr: "٠",
    priceEn: "0",
    currencyAr: "ريال",
    currencyEn: "$",
    period: "/ شهر",
    periodEn: "/ month",
    color: "border-outline-variant/40",
    highlightColor: "",
    icon: HiLightningBolt,
    features: {
      ar: ["حتى 8 منتجات", "لغة واحدة للمتجر", "تصنيفات وإضافات للمنتجات", "شركتا شحن كحد أقصى", "كودا خصم كحد أقصى", "صفحتان للمتجر كحد أقصى"],
      en: ["Up to 8 products", "One store language", "Product categories & add-ons", "Up to 2 shipping carriers", "Up to 2 discount codes", "Up to 2 store pages"],
    },
  },
  {
    key: "standard" as PlanKey,
    nameAr: "القياسية",
    nameEn: "Standard",
    priceAr: "٤٥",
    priceEn: "12",
    currencyAr: "ريال",
    currencyEn: "$",
    period: "/ شهر",
    periodEn: "/ month",
    color: "border-primary",
    highlightColor: "shadow-xl shadow-primary/15",
    icon: HiStar,
    badge: "الأكثر شيوعاً",
    badgeEn: "Most popular",
    features: {
      ar: ["منتجات غير محدودة", "لغتان للصفحة", "5 شركات شحن", "أكواد خصم غير محدودة", "رابط متجر خاص ومميز", "تخصيص ألوان الصفحة", "تغيير قالب المتجر", "جميع وسائل الدفع (PayPal, Apple Pay…)", "الاستلام من المتجر", "شريط إعلاني", "صفحات متجر غير محدودة"],
      en: ["Unlimited products", "Two store languages", "Up to 5 shipping carriers", "Unlimited discount codes", "Custom store link", "Store color customization", "Change store template", "All payment methods (PayPal, Apple Pay…)", "In-store pickup", "Announcement bar", "Unlimited store pages"],
    },
  },
  {
    key: "premium" as PlanKey,
    nameAr: "المميزة",
    nameEn: "Premium",
    priceAr: "٩٠",
    priceEn: "24",
    currencyAr: "ريال",
    currencyEn: "$",
    period: "/ شهر",
    periodEn: "/ month",
    color: "border-secondary",
    highlightColor: "shadow-xl shadow-secondary/10",
    icon: HiSparkles,
    features: {
      ar: ["منتجات غير محدودة", "أكواد خصم غير محدودة", "الاستلام من المتجر", "صفحات متجر غير محدودة", "جميع وسائل الدفع (PayPal, Apple Pay…)", "لغات غير محدودة للمتجر", "شركات شحن غير محدودة", "قوالب حصرية للباقة المميزة", "دعم فني 24/7", "إضافة مشرفين والتحكم بصلاحياتهم", "والمزيد من المزايا..."],
      en: ["Unlimited products", "Unlimited discount codes", "In-store pickup", "Unlimited store pages", "All payment methods (PayPal, Apple Pay…)", "Unlimited store languages", "Unlimited shipping carriers", "Exclusive premium templates", "24/7 technical support", "Add supervisors & manage permissions", "And much more..."],
    },
  },
];

export function PlansClient({ selectedPlan }: { selectedPlan: string }) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const router = useRouter();
  const [chosen, setChosen] = useState<PlanKey>((selectedPlan as PlanKey) ?? "free");
  const [showPayment, setShowPayment] = useState<"card" | "paypal" | null>(null);
  const [isSaudi, setIsSaudi] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => setIsSaudi(data.country_code === "SA"))
      .catch(() => setIsSaudi(true)); // fallback to Moyasar
  }, []);

  function handleSubscribe(method: "card" | "paypal") {
    if (chosen === "free") {
      router.push("/dashboard");
      return;
    }
    setShowPayment(method);
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isChosen = chosen === plan.key;
          const Icon = plan.icon;
          const features = isAr ? plan.features.ar : plan.features.en;

          return (
            <button
              key={plan.key}
              type="button"
              onClick={() => setChosen(plan.key)}
              className={`panel relative flex flex-col gap-5 border-2 p-7 text-start transition-all duration-200 ${plan.color} ${plan.highlightColor} ${isChosen ? "ring-2 ring-primary ring-offset-2" : "opacity-80 hover:opacity-100"}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                    {isAr ? plan.badge : plan.badgeEn}
                  </span>
                </div>
              )}

              {/* header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-on-surface">{isAr ? plan.nameAr : plan.nameEn}</p>
                  <p className="mt-1 text-3xl font-extrabold text-primary" dir={isAr ? "rtl" : "ltr"}>
                    {isAr ? (
                      <>{plan.priceAr} <span className="text-base font-normal text-on-surface-variant">{plan.currencyAr}</span></>
                    ) : (
                      <><span className="text-base font-normal text-on-surface-variant">{plan.currencyEn}</span>{plan.priceEn}</>
                    )}
                    <span className="text-sm font-normal text-on-surface-variant"> {isAr ? plan.period : plan.periodEn}</span>
                  </p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isChosen ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"} transition-colors`}>
                  <Icon className="text-lg" />
                </div>
              </div>

              {/* features */}
              <ul className="flex-1 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <HiCheckCircle className="mt-0.5 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* selection indicator */}
              <div className={`rounded-xl py-2 text-center text-sm font-bold transition-colors ${isChosen ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>
                {isChosen ? (isAr ? "✓ مختار" : "✓ Selected") : (isAr ? "اختر هذه الباقة" : "Select plan")}
              </div>
            </button>
          );
        })}
      </div>

      {/* payment summary + confirm */}
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-lg">
        {(() => {
          const plan = PLANS.find((p) => p.key === chosen)!;
          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface">{isAr ? "الباقة المختارة" : "Selected plan"}</span>
                <span className="font-bold text-primary">{isAr ? plan.nameAr : plan.nameEn}</span>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
                <span className="text-lg font-bold text-on-surface">{isAr ? "المجموع" : "Total"}</span>
                <span className="text-2xl font-extrabold text-primary">
                  {isAr ? `${plan.priceAr} ${plan.currencyAr}` : `${plan.currencyEn}${plan.priceEn}`}
                  <span className="text-sm font-normal text-on-surface-variant"> {isAr ? plan.period : plan.periodEn}</span>
                </span>
              </div>
              {!showPayment ? (
                <>
                  {chosen === "free" ? (
                    <button onClick={() => handleSubscribe("card")} className="primary-button w-full py-4 text-base">
                      {isAr ? "ابدأ مجانًا" : "Start for free"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* Card / Moyasar */}
                      <button
                        onClick={() => handleSubscribe("card")}
                        className="primary-button w-full py-3 text-base"
                      >
                        {isSaudi
                          ? (isAr ? "ادفع بالبطاقة • SAR" : "Pay by card • SAR")
                          : (isAr ? "ادفع بالبطاقة • USD" : "Pay by card • USD")}
                      </button>

                      {/* PayPal — للجميع */}
                      <button
                        onClick={() => handleSubscribe("paypal")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#FFC43A] bg-[#FFC43A] py-3 font-bold text-[#003087] transition hover:bg-[#f0b429]"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#003087]" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.826l-1.182 7.496h3.09c.457 0 .848-.332.92-.784l.038-.199.733-4.648.047-.257a.932.932 0 0 1 .92-.784h.58c3.753 0 6.691-1.524 7.547-5.932.36-1.847.174-3.39-.297-4.687z"/>
                        </svg>
                        {isAr ? "ادفع بـ PayPal" : "Pay with PayPal"}
                      </button>

                      <p className="text-center text-xs text-on-surface-variant">
                        {isAr ? "دفع آمن ومشفر" : "Secure & encrypted payment"}
                      </p>
                    </div>
                  )}
                </>
              ) : showPayment === "paypal" ? (
                <PayPalForm plan={chosen} isAr={isAr} />
              ) : isSaudi ? (
                <MoyasarForm plan={chosen} isAr={isAr} />
              ) : (
                <StripeForm plan={chosen} isAr={isAr} />
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
