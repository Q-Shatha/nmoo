"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  HiSparkles,
  HiShoppingBag,
  HiChartBar,
  HiArrowLeft,
  HiCheckCircle,
  HiLightningBolt,
  HiGlobe,
  HiShieldCheck,
  HiUsers,
  HiTag,
  HiCreditCard,
  HiColorSwatch,
  HiStar,
  HiTruck,
  HiCollection,
  HiPhotograph,
  HiLink,
  HiCog,
  HiCash,
} from "react-icons/hi";
import { useI18n } from "@/lib/i18n/context";

/* ─── animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const { t } = useI18n();
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(target / 60);
        const id = setInterval(() => {
          start = Math.min(start + step, target);
          setValue(start);
          if (start >= target) clearInterval(id);
        }, 16);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{value.toLocaleString(t.numberLocale)}{suffix}</span>;
}

function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} style={style} />;
}

const barData = [35, 58, 42, 74, 62, 88, 76];
const days   = ["1", "2", "3", "4", "5", "6", "7"];

/* ════════════════════ HERO ════════════════════ */
export function LandingHero() {
  const { t } = useI18n();
  const [barVisible, setBarVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setBarVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const trustBadges = [
    { icon: HiGlobe,         label: t.landingGlobal },
    { icon: HiLink,          label: t.landingUniqueUrl },
    { icon: HiShieldCheck,   label: t.landingSecurePayment },
    { icon: HiLightningBolt, label: t.landingFastLaunch },
  ];

  const orderStatuses = [
    { id: "#4821", status: t.landingOrderStatusCompleted, amount: "$320", dot: "bg-emerald-500", country: "🇸🇦" },
    { id: "#4820", status: t.landingOrderStatusShipping,  amount: "$175", dot: "bg-blue-400",    country: "🇦🇪" },
    { id: "#4819", status: t.landingOrderStatusProcessing,amount: "$540", dot: "bg-amber-400",   country: "🇺🇸" },
  ];

  const dashboardStats = [
    { label: t.landingSalesLabel,    value: "12,450", unit: "$",  bg: "bg-primary-container/30", text: "text-primary" },
    { label: t.landingOrdersLabel,   value: "184",    unit: "",   bg: "bg-violet-100",           text: "text-violet-600" },
    { label: t.landingCustomersLabel,value: "937",    unit: "",   bg: "bg-emerald-100",          text: "text-emerald-600" },
  ];

  return (
    <section className="relative py-20 lg:py-32">
      <Orb className="h-[600px] w-[600px] bg-primary-container/30" style={{ top: "-10%", right: "-8%" }} />
      <Orb className="h-[400px] w-[400px] bg-violet-300/15" style={{ bottom: "0", left: "-6%" }} />

      <div className="app-container relative grid grid-cols-1 items-center gap-16 lg:grid-cols-2">

        {/* ── text ── */}
        <div className="order-1 max-w-2xl text-start lg:order-2"
          style={{ animation: "heroFadeIn 0.8s cubic-bezier(.22,1,.36,1) both" }}>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-container/25 px-4 py-2 text-sm font-bold text-primary backdrop-blur-sm">
            <HiGlobe className="text-base" />
            {t.landingBadge}
          </div>

          <h1 className="section-title text-5xl leading-tight md:text-6xl lg:text-7xl">
            {t.landingHeroTitle1}
            <br />
            <span className="hero-gradient-text">{t.landingHeroTitle2}</span>
          </h1>

          <p className="section-copy mt-6 text-lg leading-loose">
            {t.landingHeroDesc}
          </p>

          {/* unique URL showcase */}
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-start">
            <HiLink className="shrink-0 text-xl text-primary" />
            <div>
              <p className="text-xs text-on-surface-variant">{t.landingUrlLabel}</p>
              <p className="font-mono text-sm font-bold text-on-surface" dir="ltr">
                nmoo.store/<span className="text-primary">your-store-name</span>
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <Link href="/register" className="primary-button group relative overflow-hidden px-8 py-4 text-lg">
              <span className="relative z-10 flex items-center gap-2">
                {t.landingOpenFree}
                <HiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              </span>
              <span className="btn-shimmer" aria-hidden />
            </Link>
            <Link href="/register" className="secondary-button px-8 py-4 text-lg">
              {t.landingViewExample}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-5">
            {trustBadges.map((tb) => (
              <span key={tb.label} className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant">
                <tb.icon className="text-primary" />
                {tb.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── dashboard mockup ── */}
        <div className="order-2 lg:order-1"
          style={{ animation: "heroSlideUp 0.9s 0.15s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="panel relative overflow-hidden p-1.5 shadow-2xl shadow-primary/10">
            <div className="overflow-hidden rounded-[14px] bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-outline-variant/20 bg-white/60 px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <p className="text-sm font-bold text-on-surface">{t.landingDashboardTitle}</p>
                <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{t.landingDashboardActive}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4">
                {dashboardStats.map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
                    <p className="text-xs text-on-surface-variant">{s.label}</p>
                    <p className={`mt-1 text-xl font-extrabold ${s.text}`}>
                      {s.value}{s.unit && <span className="ms-1 text-xs font-semibold">{s.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>

              <div ref={barRef} className="mx-4 mb-4 rounded-xl bg-surface-container-low p-4">
                <p className="mb-3 text-start text-xs font-semibold text-on-surface-variant">{t.landingWeeklySales}</p>
                <div className="flex h-28 items-end gap-1.5">
                  {barData.map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="w-full rounded-t-lg bg-primary transition-all duration-700 ease-out"
                        style={{ height: barVisible ? `${h}%` : "0%", transitionDelay: `${i * 80}ms`, opacity: barVisible ? 1 : 0 }} />
                      <span className="text-[10px] text-on-surface-variant">{days[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-outline-variant/15 px-4 pb-4 pt-3">
                <p className="mb-2 text-start text-xs font-bold text-on-surface-variant">{t.landingRecentOrders}</p>
                {orderStatuses.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-1.5 text-xs">
                    <span className="flex items-center gap-1 font-mono text-on-surface-variant">{o.country} {o.amount}</span>
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className={`h-1.5 w-1.5 rounded-full ${o.dot}`} />
                      {o.status}
                    </span>
                    <span className="font-bold text-primary">{o.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-3 -left-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-xl shadow-black/10"
              style={{ animation: "floatBadge 3s ease-in-out infinite" }}>
              <HiShoppingBag className="text-xl text-primary" />
              <div className="text-start">
                <p className="text-[11px] text-on-surface-variant">{t.landingNewOrder}</p>
                <p className="text-sm font-bold text-on-surface">{t.landingNewProducts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ STATS ════════════════════ */
export function LandingStats() {
  const { t } = useI18n();

  const stats = [
    { target: 150,    suffix: "+",  label: t.landingStatCountries,    icon: HiGlobe },
    { target: 5000,   suffix: "+",  label: t.landingStatMerchants,    icon: HiUsers },
    { target: 120000, suffix: "+",  label: t.landingStatOrders,       icon: HiShoppingBag },
    { target: 98,     suffix: "%",  label: t.landingStatSatisfaction, icon: HiStar },
  ];

  return (
    <section className="border-y border-outline-variant/25 bg-white/50 py-10 backdrop-blur-sm">
      <div className="app-container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="mb-2 flex justify-center">
                <s.icon className="text-2xl text-primary/60" />
              </div>
              <p className="text-4xl font-extrabold text-primary">
                <Counter target={s.target} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ HOW IT WORKS ════════════════════ */
export function LandingHowItWorks() {
  const { t } = useI18n();

  const steps = [
    { n: "1", title: t.landingStep1Title, desc: t.landingStep1Desc, icon: HiUsers },
    { n: "2", title: t.landingStep2Title, desc: t.landingStep2Desc, icon: HiColorSwatch },
    { n: "3", title: t.landingStep3Title, desc: t.landingStep3Desc, icon: HiLink },
    { n: "4", title: t.landingStep4Title, desc: t.landingStep4Desc, icon: HiShoppingBag },
  ];

  return (
    <section className="bg-surface-container-lowest py-24">
      <div className="app-container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
            <HiLightningBolt />
            {t.landingHowBadge}
          </div>
          <h2 className="section-title text-3xl md:text-4xl">{t.landingHowTitle}</h2>
          <p className="section-copy mt-4 text-lg">{t.landingHowDesc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center"
              style={{ animation: `heroSlideUp 0.7s ${i * 100}ms cubic-bezier(.22,1,.36,1) both` }}>
              {i < steps.length - 1 && (
                <div className="absolute left-0 top-8 hidden h-px w-full bg-gradient-to-l from-transparent via-primary-container to-transparent lg:block" />
              )}
              <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                <s.icon className="text-2xl" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-black text-white">{s.n}</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-on-surface">{s.title}</h3>
              <p className="leading-7 text-sm text-on-surface-variant">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ DASHBOARD FEATURES ════════════════════ */
export function LandingDashboardFeatures() {
  const { t } = useI18n();

  const panels = [
    {
      icon: HiCollection,
      color: "bg-violet-100 text-violet-600",
      title: t.landingFeat1Title,
      desc: t.landingFeat1Desc,
      points: [t.landingFeat1P1, t.landingFeat1P2, t.landingFeat1P3, t.landingFeat1P4],
    },
    {
      icon: HiShoppingBag,
      color: "bg-emerald-100 text-emerald-600",
      title: t.landingFeat2Title,
      desc: t.landingFeat2Desc,
      points: [t.landingFeat2P1, t.landingFeat2P2, t.landingFeat2P3, t.landingFeat2P4],
    },
    {
      icon: HiChartBar,
      color: "bg-blue-100 text-blue-600",
      title: t.landingFeat3Title,
      desc: t.landingFeat3Desc,
      points: [t.landingFeat3P1, t.landingFeat3P2, t.landingFeat3P3, t.landingFeat3P4],
    },
    {
      icon: HiTag,
      color: "bg-amber-100 text-amber-600",
      title: t.landingFeat4Title,
      desc: t.landingFeat4Desc,
      points: [t.landingFeat4P1, t.landingFeat4P2, t.landingFeat4P3, t.landingFeat4P4],
    },
    {
      icon: HiColorSwatch,
      color: "bg-pink-100 text-pink-600",
      title: t.landingFeat5Title,
      desc: t.landingFeat5Desc,
      points: [t.landingFeat5P1, t.landingFeat5P2, t.landingFeat5P3, t.landingFeat5P4],
    },
    {
      icon: HiTruck,
      color: "bg-teal-100 text-teal-600",
      title: t.landingFeat6Title,
      desc: t.landingFeat6Desc,
      points: [t.landingFeat6P1, t.landingFeat6P2, t.landingFeat6P3, t.landingFeat6P4],
    },
    {
      icon: HiCreditCard,
      color: "bg-indigo-100 text-indigo-600",
      title: t.landingFeat7Title,
      desc: t.landingFeat7Desc,
      points: [t.landingFeat7P1, t.landingFeat7P2, t.landingFeat7P3, t.landingFeat7P4],
    },
    {
      icon: HiStar,
      color: "bg-orange-100 text-orange-600",
      title: t.landingFeat8Title,
      desc: t.landingFeat8Desc,
      points: [t.landingFeat8P1, t.landingFeat8P2, t.landingFeat8P3, t.landingFeat8P4],
    },
    {
      icon: HiPhotograph,
      color: "bg-rose-100 text-rose-600",
      title: t.landingFeat9Title,
      desc: t.landingFeat9Desc,
      points: [t.landingFeat9P1, t.landingFeat9P2, t.landingFeat9P3, t.landingFeat9P4],
    },
  ];

  return (
    <section className="py-24">
      <div className="app-container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
            <HiCog />
            {t.landingFeaturesBadge}
          </div>
          <h2 className="section-title text-3xl md:text-4xl">{t.landingFeaturesTitle}</h2>
          <p className="section-copy mt-4 text-lg">
            {t.landingFeaturesDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {panels.map((p, i) => (
            <article
              key={p.title}
              className="panel group relative overflow-hidden border border-outline-variant/30 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8"
              style={{ animation: `heroSlideUp 0.6s ${i * 60}ms cubic-bezier(.22,1,.36,1) both` }}
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${p.color}`}>
                <p.icon className="text-xl" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-on-surface">{p.title}</h3>
              <p className="mb-4 text-sm leading-7 text-on-surface-variant">{p.desc}</p>
              <ul className="space-y-1.5">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <HiCheckCircle className="shrink-0 text-base text-primary/70" />
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ GLOBAL SECTION ════════════════════ */
export function LandingGlobal() {
  const { t } = useI18n();

  const countries = [
    { flag: "🇸🇦", name: t.landingCountrySA },
    { flag: "🇦🇪", name: t.landingCountryAE },
    { flag: "🇰🇼", name: t.landingCountryKW },
    { flag: "🇶🇦", name: t.landingCountryQA },
    { flag: "🇧🇭", name: t.landingCountryBH },
    { flag: "🇴🇲", name: t.landingCountryOM },
    { flag: "🇪🇬", name: t.landingCountryEG },
    { flag: "🇯🇴", name: t.landingCountryJO },
    { flag: "🇩🇪", name: t.landingCountryDE },
    { flag: "🇺🇸", name: t.landingCountryUS },
    { flag: "🇬🇧", name: t.landingCountryGB },
    { flag: "🇫🇷", name: t.landingCountryFR },
  ];

  const globalPoints = [
    t.landingGlobalP1,
    t.landingGlobalP2,
    t.landingGlobalP3,
    t.landingGlobalP4,
    t.landingGlobalP5,
  ];

  return (
    <section className="bg-surface-container-lowest py-24">
      <div className="app-container">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* text */}
          <div className="text-start">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
              <HiGlobe />
              {t.landingGlobalBadge}
            </div>
            <h2 className="section-title text-3xl md:text-4xl">
              {t.landingGlobalTitle}
            </h2>
            <p className="section-copy mt-4 text-lg leading-loose">
              {t.landingGlobalDesc}
            </p>
            <ul className="mt-6 space-y-3">
              {globalPoints.map((pt) => (
                <li key={pt} className="flex items-center gap-3 text-on-surface-variant">
                  <HiCheckCircle className="shrink-0 text-xl text-primary" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* flags grid */}
          <div className="grid grid-cols-4 gap-3">
            {countries.map((c) => (
              <div key={c.name}
                className="panel flex flex-col items-center gap-1.5 rounded-2xl p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <span className="text-3xl">{c.flag}</span>
                <span className="text-xs font-semibold text-on-surface-variant">{c.name}</span>
              </div>
            ))}
            <div className="col-span-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 p-4">
              <p className="text-sm font-bold text-primary">{t.landingMoreCountries}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ UNIQUE URL SECTION ════════════════════ */
export function LandingUniqueURL() {
  const { t } = useI18n();

  const examples = [
    { name: t.landingUrlShopName1, url: "nmoo.store/layla-fashion" },
    { name: t.landingUrlShopName2, url: "nmoo.store/mohammed-tech" },
    { name: t.landingUrlShopName3, url: "nmoo.store/elite-perfumes" },
  ];

  const urlPoints = [
    t.landingUrlP1,
    t.landingUrlP2,
    t.landingUrlP3,
    t.landingUrlP4,
    t.landingUrlP5,
  ];

  return (
    <section className="py-24">
      <div className="app-container">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* URLs showcase */}
          <div className="space-y-4">
            {examples.map((e, i) => (
              <div key={e.name}
                className="panel flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-x-1 hover:shadow-md"
                style={{ animation: `heroSlideUp 0.6s ${i * 100}ms cubic-bezier(.22,1,.36,1) both` }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/30 text-2xl font-black text-primary">
                  {e.name.charAt(0)}
                </div>
                <div className="flex-1 text-start">
                  <p className="font-bold text-on-surface">{e.name}</p>
                  <p className="font-mono text-sm text-primary" dir="ltr">{e.url}</p>
                </div>
                <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {t.landingUrlActiveLabel}
                </div>
              </div>
            ))}

            <div className="panel flex items-center gap-4 border-2 border-dashed border-primary/30 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-black text-primary">+</div>
              <div className="flex-1 text-start">
                <p className="font-bold text-primary">{t.landingUrlYourStore}</p>
                <p className="font-mono text-sm text-on-surface-variant" dir="ltr">nmoo.store/<span className="text-primary">{t.landingUrlYourStoreLabel}</span></p>
              </div>
            </div>
          </div>

          {/* text */}
          <div className="text-start">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
              <HiLink />
              {t.landingUrlBadge}
            </div>
            <h2 className="section-title text-3xl md:text-4xl">
              {t.landingUrlTitle}
            </h2>
            <p className="section-copy mt-4 text-lg leading-loose">
              {t.landingUrlDesc}
            </p>
            <ul className="mt-6 space-y-3">
              {urlPoints.map((pt) => (
                <li key={pt} className="flex items-center gap-3 text-on-surface-variant">
                  <HiCheckCircle className="shrink-0 text-xl text-primary" />
                  {pt}
                </li>
              ))}
            </ul>
            <Link href="/register" className="primary-button mt-8 inline-flex items-center gap-2 px-8 py-4 text-lg">
              {t.landingUrlCta}
              <HiArrowLeft />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ PRICING TEASER ════════════════════ */
export function LandingPricing() {
  const { t } = useI18n();

  const plans = [
    {
      name: t.landingPlan1Name,
      price: "$0",
      period: t.landingPlan1Period,
      color: "border-outline-variant/30",
      badge: "",
      features: [t.landingPlan1F1, t.landingPlan1F2, t.landingPlan1F3, t.landingPlan1F4, t.landingPlan1F5],
      cta: t.landingPlan1Cta,
      ctaClass: "secondary-button",
    },
    {
      name: t.landingPlan2Name,
      price: "$19",
      period: t.landingPlan2Period,
      color: "border-primary",
      badge: t.landingPlan2Badge,
      features: [t.landingPlan2F1, t.landingPlan2F2, t.landingPlan2F3, t.landingPlan2F4, t.landingPlan2F5, t.landingPlan2F6],
      cta: t.landingPlan2Cta,
      ctaClass: "primary-button",
    },
    {
      name: t.landingPlan3Name,
      price: "$49",
      period: t.landingPlan3Period,
      color: "border-secondary",
      badge: "",
      features: [t.landingPlan3F1, t.landingPlan3F2, t.landingPlan3F3, t.landingPlan3F4, t.landingPlan3F5, t.landingPlan3F6],
      cta: t.landingPlan3Cta,
      ctaClass: "secondary-button",
    },
  ];

  return (
    <section className="bg-surface-container-lowest py-24">
      <div className="app-container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
            <HiCash />
            {t.landingPricingBadge}
          </div>
          <h2 className="section-title text-3xl md:text-4xl">{t.landingPricingTitle}</h2>
          <p className="section-copy mt-4 text-lg">{t.landingPricingDesc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`panel relative flex flex-col gap-6 border-2 p-8 ${plan.color} ${plan.badge ? "shadow-xl shadow-primary/10" : ""}`}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">{plan.badge}</span>
                </div>
              )}
              <div className="text-center">
                <p className="text-lg font-bold text-on-surface">{plan.name}</p>
                <p className="mt-2 text-4xl font-extrabold text-primary">
                  {plan.price}
                  <span className="text-base font-normal text-on-surface-variant"> {plan.period}</span>
                </p>
              </div>
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <HiCheckCircle className="shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`${plan.ctaClass} py-3 text-center`}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ CTA ════════════════════ */
export function LandingCTA() {
  const { t } = useI18n();

  return (
    <section className="py-20">
      <div className="app-container">
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 text-center md:p-16">
          <Orb className="h-72 w-72 bg-primary/30" style={{ top: "-20%", left: "10%" }} />
          <Orb className="h-56 w-56 bg-violet-400/20" style={{ bottom: "-15%", right: "8%" }} />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
              <HiSparkles />
              {t.landingCtaBadge}
            </div>
            <h2 className="section-title text-3xl text-white md:text-4xl">
              {t.landingCtaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-loose text-white/70">
              {t.landingCtaDesc}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-secondary transition-all duration-200 hover:bg-white/90 hover:shadow-lg hover:shadow-white/20">
                {t.landingCtaPrimary}
                <HiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
              <Link href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20">
                {t.landingCtaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
