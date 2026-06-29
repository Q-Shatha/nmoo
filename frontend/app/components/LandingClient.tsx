"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  HiSparkles,
  HiShoppingBag,
  HiChartBar,
  HiArrowLeft,
  HiArrowRight,
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
  HiSwitchHorizontal,
  HiMail,
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

/* ════════════════════ HERO ════════════════════ */
export function LandingHero() {
  const { t, locale } = useI18n();
  const isEn = locale === "en";

  const trustBadges = [
    { icon: HiGlobe,         label: t.landingGlobal },
    { icon: HiLink,          label: t.landingUniqueUrl },
    { icon: HiLightningBolt, label: t.landingFastLaunch },
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

          <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-start">
            <Link href="/register" className="primary-button group relative w-full overflow-hidden px-6 py-4 text-base sm:w-auto sm:px-8 sm:text-lg" style={{ alignSelf: "flex-start" }}>
              {isEn ? (
                <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap" dir="ltr">
                  <span>{t.landingOpenFree}</span>
                  <HiArrowRight className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap" dir="rtl">
                  <span>{t.landingOpenFree}</span>
                  <HiArrowLeft className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              )}
              <span className="btn-shimmer" aria-hidden />
            </Link>
            <Link href="/register" className="secondary-button px-8 py-4 text-lg" style={{ alignSelf: "flex-start" }}>
              {t.landingViewExample}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-start gap-5">
            {trustBadges.map((tb) => (
              <span key={tb.label} className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant">
                <tb.icon className="text-primary" />
                {tb.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── store mockup ── */}
        <div className="order-2 lg:order-1"
          style={{ animation: "heroSlideUp 0.9s 0.15s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="relative">
          <div className="panel p-1.5 shadow-2xl shadow-primary/10">
            <div className="rounded-[14px] bg-surface-container-lowest">

              {/* browser chrome */}
              <div className="flex items-center gap-2 border-b border-outline-variant/15 bg-surface-container-low/60 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <div className="flex flex-1 items-center gap-1.5 rounded-md bg-surface-container px-3 py-1">
                  <HiLink className="shrink-0 text-xs text-on-surface-variant/50" />
                  <span className="font-mono text-xs text-on-surface-variant/60" dir="ltr">
                    nmoo.store/<span className="text-primary font-semibold">zaynah</span>
                  </span>
                </div>
              </div>

              {/* store banner */}
              <div className="relative h-32 overflow-hidden bg-surface-container">
                <img
                  src="http://localhost:5000/api/assets/cHJvZHVjdHMvODFkNjUzZGMtN2E0NS00ODU3LTg5YjQtOTVhYmI3YzBjZDY1LzA1NDQyOGJiLTU4NzctNDJlYy1iYTM1LTAwZWEwOWU2NDMzNi5qcGc"
                  alt="store banner"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* store header card — mirrors real store layout */}
              <div className="relative mx-3 -mt-6 rounded-2xl bg-white p-4 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    {/* Shop / Store policy tabs */}
                    <div className="flex gap-2">
                      <span className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-on-primary">{locale === "en" ? "Shop" : "المتجر"}</span>
                      <span className="rounded-lg bg-surface-container px-4 py-1.5 text-xs font-bold text-on-surface-variant">{locale === "en" ? "Store policy" : "سياسة المتجر"}</span>
                    </div>
                    <div>
                      <p className="text-lg font-black text-on-surface">{locale === "en" ? "Zaynah" : "زينة"}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-on-surface-variant">
                        {locale === "en"
                          ? "We offer you a carefully curated shopping experience combining product quality..."
                          : "نقدم لك تجربة تسوق مختارة بعناية تجمع بين جودة المنتجات..."}
                      </p>
                    </div>
                  </div>
                  {/* logo */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm">
                    <img
                      src="http://localhost:5000/api/assets/cHJvZHVjdHMvODFkNjUzZGMtN2E0NS00ODU3LTg5YjQtOTVhYmI3YzBjZDY1LzRmMWY5YzE4LWIwZTItNDg1YS04ZDdmLTA3NTVkNDVkNDZkYy5wbmc"
                      alt="logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* products grid */}
              <div className="grid grid-cols-2 gap-3 p-4">
                {[
                  { img: "http://localhost:5000/api/assets/cHJvZHVjdHMvODFkNjUzZGMtN2E0NS00ODU3LTg5YjQtOTVhYmI3YzBjZDY1LzE2YjdkYmEyLWMwMzYtNDY4ZS1hNDMzLWQ1Njc4Nzc3MjI5Ni5qcGc", nameAr: "ورد الماتشا", nameEn: "Matcha Rose", price: "6", badge: null },
                  { img: "http://localhost:5000/api/assets/cHJvZHVjdHMvODFkNjUzZGMtN2E0NS00ODU3LTg5YjQtOTVhYmI3YzBjZDY1LzdkNzQ2YTczLWEzYjEtNDM2OS04NzNlLWRiODRkMDRkYzY4MS53ZWJw", nameAr: "ادوات الماتشا", nameEn: "Matcha Tools Set", price: "71", oldPrice: "79", badge: "Sale" },
                  { img: "http://localhost:5000/api/assets/cHJvZHVjdHMvODFkNjUzZGMtN2E0NS00ODU3LTg5YjQtOTVhYmI3YzBjZDY1L2QyZWJjNWIzLWY0NjMtNDJiYi1iNzY5LWY3MjlhNzI1NGJiMC5qcGc", nameAr: "كوب ماتشا", nameEn: "Matcha Cup", price: "25", badge: null },
                  { img: "http://localhost:5000/api/assets/cHJvZHVjdHMvODFkNjUzZGMtN2E0NS00ODU3LTg5YjQtOTVhYmI3YzBjZDY1L2ZlMzAwOWY5LTQ1NGQtNGM2ZS1hNzQzLWFlMWVlYjYxMWFmNi5wbmc", nameAr: "حليب فانيلا نادك", nameEn: "Nadec Vanilla Milk", price: "20", oldPrice: "25", badge: "Sale" },
                ].map((p) => (
                  <div key={p.nameAr} className="overflow-hidden rounded-xl border border-outline-variant/15 bg-white">
                    <div className="relative h-24 overflow-hidden bg-surface-container-low">
                      <img src={p.img} alt={locale === "en" ? p.nameEn : p.nameAr} className="h-full w-full object-cover" />
                      {p.badge && (
                        <span className="absolute end-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">{p.badge}</span>
                      )}
                    </div>
                    <div className="p-2.5 text-start">
                      <div className="flex items-center justify-between">
                        <div>
                          {p.oldPrice && <span className="me-1 text-[10px] text-on-surface-variant line-through">{p.oldPrice}</span>}
                          <span className="text-sm font-black text-primary">{p.price} {locale === "en" ? "SAR" : "ر.س"}</span>
                        </div>
                        <button className="rounded-lg bg-primary px-2 py-1 text-[10px] font-bold text-on-primary">
                          {locale === "en" ? "+ Add" : "+ أضف"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

            {/* floating order badge — outside panel so it's not clipped */}
            <div className="absolute -bottom-4 -left-4 z-10 rounded-2xl bg-white p-3 shadow-xl shadow-black/10"
              style={{ animation: "floatBadge 3s ease-in-out infinite", minWidth: "180px" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container/40">
                  <HiShoppingBag className="text-base text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-sm font-black text-on-surface">{t.landingNewProducts}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">● {t.landingDashboardActive}</span>
                </div>
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
    { target: 250, suffix: "+",       label: t.landingStatCountries, icon: HiGlobe },
    { target: 5,  suffix: "",        label: t.landingStatMinutes,   icon: HiLightningBolt },
    { target: 24, suffix: "/7",      label: t.landingStatSupport,   icon: HiShieldCheck },
    { display: "0%",                   label: t.landingStatLanguages, icon: HiShieldCheck },
  ] as { display?: string; target?: number; suffix?: string; label: string; icon: React.ElementType }[];

  return (
    <section className="border-y border-outline-variant/25 bg-white/50 py-10 backdrop-blur-sm">
      <div className="app-container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="mb-2 flex justify-center">
                <s.icon className="text-2xl text-primary/60" />
              </div>
              <p className="text-4xl font-extrabold text-primary">
                {s.display ? s.display : <Counter target={s.target!} suffix={s.suffix} />}
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
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: "#63927b" }}>{s.n}</span>
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
function FeatureRow({
  icon: Icon,
  color,
  accentBg,
  accentOrb,
  title,
  desc,
  points,
  mockup,
  floatCards,
  reverse,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentBg: string;
  accentOrb: string;
  title: string;
  desc: string;
  points: string[];
  mockup: React.ReactNode;
  floatCards?: React.ReactNode;
  reverse: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isAlt = index % 2 === 1;

  return (
    <div className={`${isAlt ? "bg-surface-container-lowest" : ""}`}>
      <div
        ref={ref}
        className="app-container grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20"
      >
        {/* ── text side ── */}
        <div
          className={`text-start ${reverse ? "lg:order-2" : "lg:order-1"}`}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : `translateX(${reverse ? "40px" : "-40px"})`,
            transition: "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {/* animated icon */}
          <div className="relative mb-6 inline-flex">
            <span
              className={`absolute -inset-3 rounded-3xl ${accentOrb}`}
              style={{ animation: "iconRing 2.8s ease-in-out infinite" }}
              aria-hidden
            />
            <div
              className={`relative inline-flex h-16 w-16 items-center justify-center rounded-2xl ${color} shadow-xl`}
              style={{ animation: "iconFloat 3.2s ease-in-out infinite" }}
            >
              <span style={{ animation: "iconPop 3.2s ease-in-out infinite", display: "inline-flex" }}>
                <Icon className="text-3xl" />
              </span>
            </div>
          </div>

          <h3 className="section-title text-2xl md:text-3xl lg:text-4xl">{title}</h3>
          <p className="section-copy mt-4 text-lg leading-loose">{desc}</p>

          <ul className="mt-8 space-y-4">
            {points.map((pt, j) => (
              <li
                key={j}
                className="flex items-start gap-3 text-on-surface-variant"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(12px)",
                  transition: `opacity 0.5s ${0.2 + j * 0.08}s, transform 0.5s ${0.2 + j * 0.08}s`,
                }}
              >
                <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${accentBg} shadow-sm`}>
                  <HiCheckCircle className="text-sm text-primary" />
                </span>
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── mockup side ── */}
        <div
          className={`relative ${reverse ? "lg:order-1" : "lg:order-2"}`}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : `translateX(${reverse ? "-40px" : "40px"})`,
            transition: "opacity 0.7s 0.12s cubic-bezier(.22,1,.36,1), transform 0.7s 0.12s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {/* glow orb behind mockup */}
          <div className={`absolute inset-8 rounded-full ${accentOrb} blur-3xl opacity-30`} aria-hidden />

          {/* browser frame */}
          <div className="panel relative overflow-hidden rounded-2xl shadow-2xl shadow-black/15">
            {/* browser chrome */}
            <div className="flex items-center gap-3 border-b border-outline-variant/15 bg-surface-container-low px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5">
                <HiShieldCheck className="text-[11px] text-emerald-500" />
                <span className="font-mono text-xs text-on-surface-variant" dir="ltr">nmoo.store/dashboard</span>
              </div>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="text-xs" />
              </div>
            </div>
            <div>{mockup}</div>
          </div>

          {/* floating cards */}
          {floatCards}
        </div>
      </div>
    </div>
  );
}

function FloatCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={`absolute z-10 flex items-center gap-2.5 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3 shadow-xl shadow-black/10 ${className}`}
      style={{ animation: `floatBadge 3.5s ${delay}s ease-in-out infinite` }}
    >
      {children}
    </div>
  );
}

export function LandingDashboardFeatures() {
  const { t, locale } = useI18n();

  const panels = [
    {
      icon: HiCollection,
      color: "bg-violet-100 text-violet-600",
      accentBg: "bg-violet-50",
      accentOrb: "bg-violet-200",
      title: t.landingFeat1Title,
      desc: t.landingFeat1Desc,
      points: [t.landingFeat1P1, t.landingFeat1P2, t.landingFeat1P3, t.landingFeat1P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-products.png" alt="products" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -start-6" delay={0}>
            <span className="text-xl">🛍️</span>
            <div>
              <p className="text-[11px] text-on-surface-variant">{t.landingNewOrder}</p>
              <p className="text-sm font-black text-on-surface">+{(120).toLocaleString()} {t.currency}</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-5 -end-4" delay={1.2}>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-base">📦</span>
            <div>
              <p className="text-[11px] font-bold text-emerald-600">{t.landingFeat1P3}</p>
              <p className="text-xs text-on-surface-variant">245 {t.landingStatOrders}</p>
            </div>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiShoppingBag,
      color: "bg-emerald-100 text-emerald-600",
      accentBg: "bg-emerald-50",
      accentOrb: "bg-emerald-200",
      title: t.landingFeat2Title,
      desc: t.landingFeat2Desc,
      points: [t.landingFeat2P1, t.landingFeat2P2, t.landingFeat2P3, t.landingFeat2P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-orders.png" alt="orders" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -end-6" delay={0.3}>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-xl">✅</span>
            <div>
              <p className="text-xs font-bold text-emerald-600">{t.statusCompleted ?? "مكتمل"}</p>
              <p className="text-[11px] text-on-surface-variant">#8821 · 320 {t.currency}</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-4 -start-5" delay={1.8}>
            <span className="text-xl">🚀</span>
            <p className="text-sm font-black text-on-surface">184 {t.landingOrdersLabel}</p>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiChartBar,
      color: "bg-blue-100 text-blue-600",
      accentBg: "bg-blue-50",
      accentOrb: "bg-blue-200",
      title: t.landingFeat3Title,
      desc: t.landingFeat3Desc,
      points: [t.landingFeat3P1, t.landingFeat3P2, t.landingFeat3P3, t.landingFeat3P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-analytics.png" alt="analytics" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -start-6" delay={0}>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-base font-black">↑</span>
            <div>
              <p className="text-[11px] text-on-surface-variant">{t.landingFeat3P1}</p>
              <p className="text-sm font-black text-blue-600">+12.4%</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-5 -end-4" delay={1.5}>
            <span className="text-xl">📈</span>
            <div>
              <p className="text-[11px] text-on-surface-variant">{t.landingSalesLabel}</p>
              <p className="text-sm font-black text-on-surface">24,500 {t.currency}</p>
            </div>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiTag,
      color: "bg-amber-100 text-amber-600",
      accentBg: "bg-amber-50",
      accentOrb: "bg-amber-200",
      title: t.landingFeat4Title,
      desc: t.landingFeat4Desc,
      points: [t.landingFeat4P1, t.landingFeat4P2, t.landingFeat4P3, t.landingFeat4P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-discounts.png" alt="discounts" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -end-5" delay={0.5}>
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-[11px] font-bold text-amber-600">SAVE20</p>
              <p className="text-[11px] text-on-surface-variant">45 {t.landingFeat4P1}</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-4 -start-5" delay={2}>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black text-sm">%</span>
            <p className="text-sm font-black text-on-surface">50% OFF</p>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiColorSwatch,
      color: "bg-pink-100 text-pink-600",
      accentBg: "bg-pink-50",
      accentOrb: "bg-pink-200",
      title: t.landingFeat5Title,
      desc: t.landingFeat5Desc,
      points: [t.landingFeat5P1, t.landingFeat5P2, t.landingFeat5P3, t.landingFeat5P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-themes.png" alt="store design" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -start-6" delay={0}>
            <div className="flex gap-1">
              {["#6366f1","#ec4899","#14b8a6","#f59e0b"].map(c => (
                <div key={c} className="h-5 w-5 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <p className="text-xs font-bold text-on-surface">{t.landingFeat5P3}</p>
          </FloatCard>
          <FloatCard className="-top-4 -end-5" delay={1.3}>
            <span className="text-xl">✨</span>
            <p className="text-sm font-black text-on-surface">Boutique</p>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiTruck,
      color: "bg-teal-100 text-teal-600",
      accentBg: "bg-teal-50",
      accentOrb: "bg-teal-200",
      title: t.landingFeat6Title,
      desc: t.landingFeat6Desc,
      points: [t.landingFeat6P1, t.landingFeat6P2, t.landingFeat6P3, t.landingFeat6P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-shipping.png" alt="shipping" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -end-5" delay={0.2}>
            <span className="text-xl">🚀</span>
            <div>
              <p className="text-[11px] font-bold text-teal-600">{t.landingFeat6P1}</p>
              <p className="text-[11px] text-on-surface-variant">{t.landingFeat6P4}</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-4 -start-5" delay={1.6}>
            <span className="text-xl">🌍</span>
            <div>
              <p className="text-xs font-bold text-on-surface">{t.landingGlobal}</p>
              <p className="text-[11px] text-on-surface-variant">{t.landingFeat6P3}</p>
            </div>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiCreditCard,
      color: "bg-indigo-100 text-indigo-600",
      accentBg: "bg-indigo-50",
      accentOrb: "bg-indigo-200",
      title: t.landingFeat7Title,
      desc: t.landingFeat7Desc,
      points: [t.landingFeat7P1, t.landingFeat7P2, t.landingFeat7P3, t.landingFeat7P4],
      mockup: <PaymentsMockup t={t} />,
      floatCards: (
        <>
          <FloatCard className="-top-4 -end-4" delay={1.1}>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 text-lg">🔒</span>
            <p className="text-xs font-bold text-on-surface">{t.landingSecurePayment}</p>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiStar,
      color: "bg-orange-100 text-orange-600",
      accentBg: "bg-orange-50",
      accentOrb: "bg-orange-200",
      title: t.landingFeat8Title,
      desc: t.landingFeat8Desc,
      points: [t.landingFeat8P1, t.landingFeat8P2, t.landingFeat8P3, t.landingFeat8P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-reviews.png" alt="reviews" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -end-5" delay={0.4}>
            <span className="text-lg text-amber-400">★★★★★</span>
            <div>
              <p className="text-sm font-black text-on-surface">4.8</p>
              <p className="text-[11px] text-on-surface-variant">127 {t.landingFeat8P4}</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-4 -start-4" delay={1.9}>
            <span className="text-xl">💬</span>
            <p className="text-xs font-bold text-on-surface">{t.landingFeat8P1?.slice(0, 18)}...</p>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiPhotograph,
      color: "bg-rose-100 text-rose-600",
      accentBg: "bg-rose-50",
      accentOrb: "bg-rose-200",
      title: t.landingFeat9Title,
      desc: t.landingFeat9Desc,
      points: [t.landingFeat9P1, t.landingFeat9P2, t.landingFeat9P3, t.landingFeat9P4],
      mockup: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/screenshots/dashboard-pages.png" alt="store pages" className="w-full" loading="lazy" />
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -start-6" delay={0.7}>
            <span className="text-xl">📄</span>
            <div>
              <p className="text-xs font-bold text-on-surface">{t.landingFeat9P1}</p>
              <p className="text-[11px] font-mono text-on-surface-variant" dir="ltr">/about</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-4 -end-4" delay={2.1}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">✓</span>
            <p className="text-xs font-bold text-emerald-600">{t.carrierEnabled ?? "نشط"}</p>
          </FloatCard>
        </>
      ),
    },
    {
      icon: HiSwitchHorizontal,
      color: "bg-cyan-100 text-cyan-600",
      accentBg: "bg-cyan-50",
      accentOrb: "bg-cyan-200",
      title: t.landingFeat10Title,
      desc: t.landingFeat10Desc,
      points: [t.landingFeat10P1, t.landingFeat10P2, t.landingFeat10P3, t.landingFeat10P4],
      mockup: (
        <div className="w-full overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface shadow-sm">
          {/* product card header */}
          <div className="flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest px-4 py-3">
            <span className="text-sm font-bold text-on-surface">ورد الماتشا / Matcha Rose</span>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">AR</span>
              <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-bold text-secondary">EN</span>
            </div>
          </div>
          {/* two language columns */}
          <div className="grid grid-cols-2 divide-x divide-outline-variant/20" dir="ltr">
            {/* English side - always left */}
            <div className="p-4 text-left" dir="ltr">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-secondary">English</p>
              <p className="text-sm font-bold text-on-surface">Matcha Rose</p>
              <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">Fresh rose for decorating matcha drinks</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant">Decor</span>
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant">Matcha</span>
              </div>
            </div>
            {/* Arabic side - always right */}
            <div className="p-4 text-right" dir="rtl">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-primary">العربية</p>
              <p className="text-sm font-bold text-on-surface">ورد الماتشا</p>
              <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">وردة طازجة لتزيين مشروبات الماتشا</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant">زينة</span>
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant">ماتشا</span>
              </div>
            </div>
          </div>
          {/* customer preview strip */}
          <div className="border-t border-outline-variant/20 bg-surface-container-lowest px-4 py-2.5">
            <p className="text-[10px] text-on-surface-variant">👤 {locale === "ar" ? "ما يراه العميل" : "What the customer sees"}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] text-on-surface-variant">🌐</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">AR</span>
              <span className="text-[11px] font-bold text-on-surface">ورد الماتشا</span>
              <span className="mx-1 text-on-surface-variant">→</span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">EN</span>
              <span className="text-[11px] font-bold text-on-surface">Matcha Rose</span>
            </div>
          </div>
        </div>
      ),
      floatCards: (
        <>
          <FloatCard className="-bottom-5 -end-5" delay={0.6}>
            <span className="text-xl">🌐</span>
            <div>
              <p className="text-[11px] font-bold text-cyan-600">AR → EN</p>
              <p className="text-[11px] text-on-surface-variant">{t.landingFeat10P3}</p>
            </div>
          </FloatCard>
          <FloatCard className="-top-4 -start-5" delay={1.7}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 font-bold text-sm">Aa</span>
            <p className="text-xs font-bold text-on-surface">{t.landingFeat10P4}</p>
          </FloatCard>
        </>
      ),
    },
  ];

  return (
    <section>
      {/* section header */}
      <div className="app-container pt-24 pb-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
            <HiCog />
            {t.landingFeaturesBadge}
          </div>
          <h2 className="section-title text-3xl md:text-4xl">{t.landingFeaturesTitle}</h2>
          <p className="section-copy mt-4 text-lg">{t.landingFeaturesDesc}</p>
        </div>
      </div>

      {panels.map((p, i) => (
        <FeatureRow
          key={p.title}
          icon={p.icon}
          color={p.color}
          accentBg={p.accentBg}
          accentOrb={p.accentOrb}
          title={p.title}
          desc={p.desc}
          points={p.points}
          mockup={p.mockup}
          floatCards={p.floatCards}
          reverse={i % 2 === 1}
          index={i}
        />
      ))}

      <style>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-3deg); }
        }
        @keyframes iconRing {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes iconPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
}

/* ════════════════════ SPINNING EARTH ════════════════════ */
function SpinningEarth({ size = 380 }: { size?: number }) {
  const [t, setT] = useState(0);
  const [active, setActive] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const loop = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      setT((now - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [active]);

  const period = 44;
  const imgRatio = 740 / 357;
  const imgW = size * imgRatio;
  const TH = size / 2 / imgW;

  const rotFrac = t / period;
  const fracX = ((rotFrac % 1) + 1) % 1;
  const x = (-fracX * 50).toFixed(4);
  const floatY = (-(1 - Math.cos((2 * Math.PI * t) / 7)) * 4).toFixed(2);

  const loopSec = 14;
  const ph = (t % loopSec) / loopSec;
  let zoom = 1, zop = 1;
  if (ph < 0.12) { const k = ph / 0.12; const e = 1 - Math.pow(1 - k, 3); zoom = 0.18 + 0.82 * e; zop = Math.min(1, k * 1.5); }
  else if (ph > 0.88) { const k = (ph - 0.88) / 0.12; const e = k * k * k; zoom = 1 - 0.82 * e; zop = Math.max(0, 1 - k * 1.25); }

  const center = ((size / 2) / imgW + fracX) % 1;
  const cloudFrac = ((t / (period * 2.2)) % 1 + 1) % 1;
  const ccx = (-cloudFrac * 50).toFixed(4);

  const cloudDefs = [
    { l: 6, top: 20, f: 0.36, img: 1, op: 0.55 }, { l: 19, top: 42, f: 0.30, img: 2, op: 0.46 },
    { l: 32, top: 13, f: 0.40, img: 3, op: 0.50 }, { l: 43, top: 56, f: 0.28, img: 1, op: 0.44 },
    { l: 13, top: 66, f: 0.32, img: 1, op: 0.40 }, { l: 26, top: 30, f: 0.26, img: 2, op: 0.40 },
    { l: 47, top: 26, f: 0.34, img: 3, op: 0.48 },
  ];
  const clouds: { src: string; left: number; top: number; w: number; op: number }[] = [];
  cloudDefs.forEach((c) => {
    const w = Math.round(c.f * size);
    clouds.push({ src: `/earth-assets/cloud${c.img}.png`, left: c.l, top: c.top, w, op: c.op });
    clouds.push({ src: `/earth-assets/cloud${c.img}.png`, left: c.l + 50, top: c.top, w, op: c.op });
  });

  const cities = [
    { lon: -74.8, lat: 40.4 }, { lon: -118.2, lat: 34 }, { lon: -87.6, lat: 41.8 }, { lon: -105, lat: 39.7 },
    { lon: -99.1, lat: 19.4 }, { lon: -43.2, lat: -22.9 }, { lon: -58.4, lat: -34.6 }, { lon: 31.2, lat: 30 },
    { lon: 36.8, lat: -1.3 }, { lon: 46.7, lat: 24.7 }, { lon: 39.2, lat: 21.5 }, { lon: 49.9, lat: 25.8 },
    { lon: 47.9, lat: 29.4 }, { lon: 55.8, lat: 24.8 }, { lon: 54.3, lat: 23.8 }, { lon: 51.4, lat: 24.8 },
    { lon: 50.4, lat: 25.8 }, { lon: 58.2, lat: 22.8 }, { lon: 44.4, lat: 33.3 }, { lon: 35.9, lat: 31.9 },
    { lon: 0.2, lat: 51.6 }, { lon: 2.3, lat: 48.9 }, { lon: -3.7, lat: 40.4 }, { lon: 13.4, lat: 52.5 },
    { lon: 4.9, lat: 52.4 }, { lon: 18.3, lat: 57.1 }, { lon: 8.5, lat: 47.4 }, { lon: 12.6, lat: 55.7 },
    { lon: 51.4, lat: 35.7 }, { lon: 77.2, lat: 28.6 }, { lon: 116.4, lat: 39.9 }, { lon: 139.7, lat: 35.7 },
    { lon: 127, lat: 37.5 }, { lon: 37.6, lat: 55.8 }, { lon: 28.98, lat: 41 }, { lon: 121.5, lat: 31.2 },
    { lon: 151.2, lat: -33.9 }, { lon: 101.7, lat: 3.1 },
  ];
  const wrap = (v: number) => { v = ((v % 1) + 1) % 1; return v > 0.5 ? v - 1 : v; };
  const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
  const VIS = TH * 0.66;

  type Pin = { left: number; top: number; op: number; strikeY: number; sx: number; sy: number };
  const pins: Pin[] = [];
  cities.forEach((c) => {
    const fx = (c.lon + 180) / 360;
    const fy = (90 - c.lat) / 180;
    const delta = wrap(fx - center);
    if (Math.abs(delta) >= VIS) return;
    const xpx = size / 2 + delta * imgW;
    const ypx = fy * size;
    const tEntry = (VIS - delta) * period;
    const tToExit = (delta + VIS) * period;
    const te = tEntry - 1.0;
    if (te <= 0) return;
    const ep = Math.max(0, Math.min(1, te / 0.95));
    let strikeY = 0, sx = 1, sy = 1;
    if (ep < 0.6) { strikeY = -85 * (1 - easeOut(ep / 0.6)); }
    else { const q = (ep - 0.6) / 0.4; const env = Math.sin(q * Math.PI); sy = 1 - 0.36 * env; sx = 1 + 0.32 * env; }
    const op = Math.max(0, Math.min(1, te / 0.30)) * Math.max(0, Math.min(1, tToExit / 2.0));
    pins.push({ left: xpx, top: ypx, op, strikeY, sx, sy });
  });

  return (
    <div ref={wrapRef} style={{ filter: "saturate(0.82)" }}>
      <div style={{ position: "relative", width: size, height: size, transformOrigin: "50% 50%", transform: `translateY(${floatY}px) scale(${zoom.toFixed(3)})`, opacity: zop, willChange: "transform, opacity" }}>
        <div style={{ position: "absolute", inset: "-9%", borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(110,190,240,0) 56%, rgba(110,190,240,.30) 69%, rgba(110,190,240,0) 84%)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: "#2573b3", boxShadow: "0 26px 64px -16px rgba(6,34,64,.6)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "max-content", display: "flex", willChange: "transform", transform: `translateX(${x}%)` }}>
            <img src="/earth-assets/earth-map.png" alt="" draggable={false} style={{ height: "100%", width: "auto", display: "block", userSelect: "none", filter: "saturate(1.12) contrast(1.06) brightness(1.02)" }} />
            <img src="/earth-assets/earth-map.png" alt="" draggable={false} style={{ height: "100%", width: "auto", display: "block", userSelect: "none", marginLeft: -1, filter: "saturate(1.12) contrast(1.06) brightness(1.02)" }} />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "200%", pointerEvents: "none", transform: `translateX(${ccx}%)`, zIndex: 2 }}>
            {clouds.map((cl, i) => (
              <img key={i} src={cl.src} alt="" draggable={false} style={{ position: "absolute", left: cl.left + "%", top: cl.top + "%", width: cl.w, opacity: cl.op, transform: "translate(-50%,-50%)", userSelect: "none", filter: "blur(0.3px)" }} />
            ))}
          </div>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", boxShadow: "inset 0 0 16px 2px rgba(150,210,255,.5)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle at 30% 26%, rgba(255,255,255,.40), rgba(255,255,255,0) 46%), linear-gradient(108deg, rgba(2,12,30,0) 44%, rgba(3,14,34,.42) 74%, rgba(1,8,24,.66) 100%)", boxShadow: "inset 0 0 50px 10px rgba(2,18,42,.5), inset -16px -18px 60px rgba(1,12,30,.5)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9 }}>
          {pins.map((p, i) => (
            <div key={i} style={{ position: "absolute", left: p.left.toFixed(1) + "px", top: p.top.toFixed(1) + "px", opacity: p.op, willChange: "transform, opacity" }}>
              <div style={{ transform: `translateY(${p.strikeY.toFixed(1)}px)` }}>
                <div style={{ position: "relative", width: 23, height: 30, transformOrigin: "50% 100%", transform: `translate(-50%,-100%) scale(${p.sx.toFixed(3)},${p.sy.toFixed(3)})` }}>
                  <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 0, top: 0, width: 23, height: 30, filter: "drop-shadow(0 3px 4px rgba(18,2,2,.5))" }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 1C7.58 1 4 4.58 4 9c0 5.25 8 14 8 14s8-8.75 8-14c0-4.42-3.58-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" fill="#884A70" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
              {t.landingGlobalTitle.split(/(بكل دولة في العالم|in every country in the world)/i).map((part, i) =>
                /بكل دولة في العالم|in every country in the world/i.test(part)
                  ? <span key={i} style={{ background: "linear-gradient(135deg, #884a70, #63927b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{part}</span>
                  : <span key={i}>{part}</span>
              )}
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

          {/* Globe */}
          <div className="flex items-center justify-center">
            <SpinningEarth size={380} />
          </div>

        </div>
      </div>
    </section>
  );
}

/* ════════════════════ UNIQUE URL SECTION ════════════════════ */
export function LandingUniqueURL() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

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
            <div className="panel flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/30 text-2xl font-black text-primary">ز</div>
              <div className="flex-1 text-start">
                <p className="font-bold text-on-surface">زينة</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="font-mono text-sm text-primary" dir="ltr">nmoo.store/zaynah</p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{t.landingUrlActiveLabel}</span>
                </div>
              </div>
            </div>

            <div className="panel flex items-center gap-4 border-2 border-dashed border-primary/30 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-black text-primary">+</div>
              <div className="flex-1 text-start">
                <p className="font-bold text-primary">{t.landingUrlYourStore}</p>
                <p className={`mt-0.5 font-mono text-sm text-on-surface-variant ${isAr ? "text-right" : "text-left"}`} dir="ltr">
                  nmoo.store/<span className="text-primary">{t.landingUrlYourStoreLabel}</span>
                </p>
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
            <Link href="/register" className="primary-button group mt-8 inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-4 text-base sm:px-8 sm:text-lg" dir={isAr ? "rtl" : "ltr"}>
              <span>{t.landingUrlCta}</span>
              {isAr ? (
                <HiArrowLeft className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
              ) : (
                <HiArrowRight className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ PRICING TEASER ════════════════════ */
export function LandingPricing() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  const plans = [
    {
      name: t.landingPlan1Name,
      priceAr: "٠ ريال",
      priceEn: "$0",
      period: t.landingPlan1Period,
      color: "border-outline-variant/30",
      badge: "",
      planKey: "free",
      features: [
        t.landingPlan1F1, t.landingPlan1F2, t.landingPlan1F3,
        t.landingPlan1F4, t.landingPlan1F5, t.landingPlan1F6,
      ].map((text) => ({ text })),
      cta: t.landingPlan1Cta,
      ctaClass: "secondary-button",
    },
    {
      name: t.landingPlan2Name,
      priceAr: "٤٥ ريال",
      priceEn: "$12",
      period: t.landingPlan2Period,
      color: "border-primary",
      badge: t.landingPlan2Badge,
      planKey: "standard",
      features: [
        t.landingPlan2F1, t.landingPlan2F2, t.landingPlan2F3, t.landingPlan2F4,
        t.landingPlan2F5, t.landingPlan2F6, t.landingPlan2F7, t.landingPlan2F8,
        t.landingPlan2F9, t.landingPlan2F10, t.landingPlan2F11,
      ].map((text) => ({ text })),
      cta: t.landingPlan2Cta,
      ctaClass: "primary-button",
    },
    {
      name: t.landingPlan3Name,
      priceAr: "٩٠ ريال",
      priceEn: "$24",
      period: t.landingPlan3Period,
      color: "border-secondary",
      badge: "",
      planKey: "premium",
      features: [
        t.landingPlan3F1, t.landingPlan3F2, t.landingPlan3F3,
        t.landingPlan3F4, t.landingPlan3F5, t.landingPlan3F6,
        t.landingPlan3F7, t.landingPlan3F8, t.landingPlan3F9,
        t.landingPlan3F10, t.landingPlan3F11,
      ].map((text) => ({ text })),
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
                  {isAr ? plan.priceAr : plan.priceEn}
                  <span className="text-base font-normal text-on-surface-variant"> {plan.period}</span>
                </p>
              </div>
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <HiCheckCircle className="mt-0.5 shrink-0 text-primary" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/subscribe?plan=${plan.planKey}`} className={`${plan.ctaClass} py-3 text-center`}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ FEATURE MOCKUP COMPONENTS ════════════════════ */
type MockupProps = { t: ReturnType<typeof useI18n>["t"] };

function ProductsMockup({ t }: MockupProps) {
  return (
    <div className="p-5">
      {/* search + add button row */}
      <div className="mb-4 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2">
          <HiCollection className="text-on-surface-variant" />
          <div className="h-3 w-24 rounded bg-outline-variant/30" />
        </div>
        <div className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white">+ {t.landingFeat1P1.split(" ")[0]}</div>
      </div>
      {/* product cards grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: "👕", price: `120 ${t.currency}`, badge: "bg-emerald-100 text-emerald-700", stock: "45" },
          { emoji: "👟", price: `280 ${t.currency}`, badge: "bg-emerald-100 text-emerald-700", stock: "12" },
          { emoji: "👜", price: `450 ${t.currency}`, badge: "bg-amber-100 text-amber-700", stock: "3" },
          { emoji: "🕶️", price: `95 ${t.currency}`, badge: "bg-red-100 text-red-600", stock: "0" },
          { emoji: "⌚", price: `890 ${t.currency}`, badge: "bg-emerald-100 text-emerald-700", stock: "28" },
          { emoji: "💍", price: `320 ${t.currency}`, badge: "bg-emerald-100 text-emerald-700", stock: "7" },
        ].map((item, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest">
            <div className="flex h-20 items-center justify-center bg-surface-container text-3xl">{item.emoji}</div>
            <div className="p-2.5">
              <div className="mb-1 h-2 w-3/4 rounded bg-outline-variant/30" />
              <p className="text-xs font-black text-primary">{item.price}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badge}`}>{item.stock}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersMockup({ t }: MockupProps) {
  const orders = [
    { flag: "🇸🇦", id: "#8821", amount: `320 ${t.currency}`, badge: "bg-emerald-100 text-emerald-700", status: t.statusCompleted ?? "مكتمل" },
    { flag: "🇦🇪", id: "#8820", amount: `175 ${t.currency}`, badge: "bg-blue-100 text-blue-700", status: t.statusShipped ?? "مشحون" },
    { flag: "🇺🇸", id: "#8819", amount: `540 ${t.currency}`, badge: "bg-amber-100 text-amber-700", status: t.statusProcessing ?? "جاري" },
    { flag: "🇰🇼", id: "#8818", amount: `210 ${t.currency}`, badge: "bg-slate-100 text-slate-600", status: t.statusPending ?? "معلق" },
    { flag: "🇪🇬", id: "#8817", amount: `670 ${t.currency}`, badge: "bg-emerald-100 text-emerald-700", status: t.statusCompleted ?? "مكتمل" },
  ];
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-2">
          {["الكل","جارية","مكتملة"].map((tab, i) => (
            <span key={i} className={`rounded-xl px-3 py-1 text-xs font-bold ${i === 0 ? "bg-primary text-white" : "text-on-surface-variant"}`}>{tab}</span>
          ))}
        </div>
        <div className="h-7 w-20 rounded-xl border border-outline-variant/20 bg-surface-container" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-outline-variant/15">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 border-b border-outline-variant/10 bg-surface-container-low px-4 py-2 text-[11px] font-bold text-on-surface-variant">
          <span>#</span><span>{t.customer ?? "العميل"}</span><span>{t.amount ?? "المبلغ"}</span><span>{t.status ?? "الحالة"}</span>
        </div>
        {orders.map((o) => (
          <div key={o.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 border-b border-outline-variant/8 px-4 py-2.5 last:border-0 text-xs">
            <span className="font-mono font-bold text-primary">{o.id}</span>
            <span className="text-on-surface">{o.flag}</span>
            <span className="font-bold text-on-surface">{o.amount}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${o.badge}`}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsMockup({ t }: MockupProps) {
  const bars = [38, 55, 45, 72, 60, 88, 74];
  return (
    <div className="p-4">
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: t.landingFeat3P1 ?? "المبيعات", value: "24,500", unit: t.currency, color: "text-primary", bg: "bg-primary-container/20" },
          { label: t.landingFeat3P2 ?? "الطلبات", value: "847", unit: "", color: "text-violet-600", bg: "bg-violet-50" },
          { label: t.landingFeat3P3 ?? "العملاء", value: "1,240", unit: "", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
            <p className="text-[10px] text-on-surface-variant">{s.label}</p>
            <p className={`mt-0.5 text-base font-black ${s.color}`}>{s.value}<span className="ms-0.5 text-[10px] font-normal">{s.unit}</span></p>
            <p className="text-[10px] font-bold text-emerald-500">↑ 12.4%</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-outline-variant/15 p-3">
        <p className="mb-2 text-[11px] font-semibold text-on-surface-variant">{t.landingWeeklySales ?? "المبيعات الأسبوعية"}</p>
        <div className="flex h-24 items-end gap-1">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t-md bg-primary transition-all duration-700"
                style={{ height: `${h}%`, opacity: 0.7 + i * 0.04 }}
              />
              <span className="text-[9px] text-on-surface-variant">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscountsMockup({ t }: MockupProps) {
  const codes = [
    { code: "SAVE20", value: "20%", type: "percent", used: 45, max: 100, badge: "bg-amber-100 text-amber-700" },
    { code: "WELCOME", value: `50 ${t.currency}`, type: "fixed", used: 12, max: 50, badge: "bg-violet-100 text-violet-700" },
    { code: "FLASH50", value: "50%", type: "percent", used: 8, max: 20, badge: "bg-red-100 text-red-600" },
  ];
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-on-surface">{t.landingFeat4Title}</p>
        <div className="rounded-xl bg-primary px-3 py-1 text-xs font-bold text-white">+ {"كود جديد"}</div>
      </div>
      <div className="grid gap-2.5">
        {codes.map(c => (
          <div key={c.code} className="relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-4">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary" />
            </div>
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl font-black text-amber-600">
                {c.type === "percent" ? "%" : t.currency}
              </div>
              <div className="flex-1">
                <p className="font-mono text-sm font-black text-on-surface">{c.code}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(c.used / c.max) * 100}%` }} />
                </div>
                <p className="mt-0.5 text-[10px] text-on-surface-variant">{c.used}/{c.max}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-black ${c.badge}`}>{c.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemesMockup({ t }: MockupProps) {
  const themes = [
    { name: "Classic", primary: "#6366f1", accent: "#818cf8", selected: false },
    { name: "Boutique", primary: "#ec4899", accent: "#f472b6", selected: true },
    { name: "Gallery", primary: "#14b8a6", accent: "#2dd4bf", selected: false },
    { name: "Minimal", primary: "#64748b", accent: "#94a3b8", selected: false },
    { name: "Market", primary: "#f59e0b", accent: "#fbbf24", selected: false },
  ];
  return (
    <div className="p-4">
      <p className="mb-3 text-sm font-bold text-on-surface">{t.landingFeat5Title}</p>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {themes.map(th => (
          <div key={th.name} className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${th.selected ? "shadow-lg" : "border-outline-variant/20"}`}
            style={{ borderColor: th.selected ? th.primary : undefined }}>
            {/* mini store preview */}
            <div className="h-16 p-1.5" style={{ background: th.primary + "15" }}>
              <div className="h-2 rounded" style={{ background: th.primary }} />
              <div className="mt-1 h-1 w-3/4 rounded" style={{ background: th.primary + "60" }} />
              <div className="mt-2 grid grid-cols-2 gap-0.5">
                <div className="h-4 rounded" style={{ background: th.accent + "40" }} />
                <div className="h-4 rounded" style={{ background: th.accent + "40" }} />
              </div>
            </div>
            <div className="bg-white px-1.5 py-1">
              <p className="text-center text-[9px] font-bold text-slate-700">{th.name}</p>
            </div>
            {th.selected && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: th.primary }}>
                <HiCheckCircle className="text-[10px]" />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* color palette row */}
      <div className="rounded-xl border border-outline-variant/15 p-3">
        <p className="mb-2 text-[11px] text-on-surface-variant">{t.landingFeat5P3 ?? "الألوان"}</p>
        <div className="flex gap-2">
          {["#ec4899","#f472b6","#1e293b","#f8fafc","#6366f1","#f59e0b"].map(c => (
            <div key={c} className="h-7 w-7 cursor-pointer rounded-lg border-2 border-white shadow" style={{ background: c }} />
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-outline-variant text-on-surface-variant text-xs">+</div>
        </div>
      </div>
    </div>
  );
}

function ShippingMockup({ t }: MockupProps) {
  const carriers = [
    { name: t.landingFeat6P1 ?? "توصيل سريع", price: `15 ${t.currency}`, days: "1-2", active: true, icon: "🚀", zones: ["🇸🇦","🇦🇪","🇰🇼"] },
    { name: t.landingFeat6P2 ?? "توصيل عادي", price: `8 ${t.currency}`, days: "3-5", active: true, icon: "📦", zones: ["🇸🇦","🇦🇪"] },
    { name: t.landingFeat6P3 ?? "شحن مجاني", price: `0 ${t.currency}`, days: "5-7", active: false, icon: "🎁", zones: ["🇸🇦"] },
  ];
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-on-surface">{t.landingFeat6Title}</p>
        <HiTruck className="text-xl text-teal-500" />
      </div>
      <div className="grid gap-2.5">
        {carriers.map(c => (
          <div key={c.name} className={`rounded-2xl border p-3.5 transition-all ${c.active ? "border-outline-variant/20 bg-surface-container-lowest" : "border-outline-variant/10 bg-surface-container/40 opacity-60"}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-on-surface">{c.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.active ? (t.carrierEnabled ?? "نشط") : (t.carrierStopped ?? "متوقف")}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-xs text-on-surface-variant">⏱ {c.days} {t.landingFeat6P4 ?? "أيام"}</p>
                  <div className="flex gap-0.5">{c.zones.map(z => <span key={z} className="text-sm">{z}</span>)}</div>
                </div>
              </div>
              <p className="text-sm font-black text-primary">{c.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentsMockup({ t }: MockupProps) {
  const methods = [
    { name: "Visa", icon: "💳", color: "bg-blue-50 border-blue-200" },
    { name: "Mastercard", icon: "💳", color: "bg-red-50 border-red-200" },
    { name: t.landingFeat7P1 ?? "تحويل بنكي", icon: "🏦", color: "bg-emerald-50 border-emerald-200" },
    { name: t.landingFeat7P2 ?? "الدفع عند الاستلام", icon: "💵", color: "bg-amber-50 border-amber-200" },
  ];
  const txns = [
    { id: "#9931", amount: `+320 ${t.currency}`, cls: "text-emerald-600" },
    { id: "#9930", amount: `+175 ${t.currency}`, cls: "text-emerald-600" },
    { id: "#9929", amount: `-50 ${t.currency}`, cls: "text-red-500" },
    { id: "#9928", amount: `+890 ${t.currency}`, cls: "text-emerald-600" },
  ];
  return (
    <div className="p-4">
      <p className="mb-3 text-xs font-bold text-on-surface-variant">{t.landingFeat7Title}</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {methods.map(m => (
          <div key={m.name} className={`flex items-center gap-2 rounded-xl border p-2.5 ${m.color}`}>
            <span className="text-xl">{m.icon}</span>
            <p className="text-xs font-bold text-on-surface">{m.name}</p>
            <div className="ms-auto h-4 w-4 rounded-full border-2 border-emerald-500 bg-emerald-50" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-outline-variant/15">
        <div className="border-b border-outline-variant/10 bg-surface-container-low px-3 py-2 text-[11px] font-bold text-on-surface-variant">
          {t.landingFeat7P3 ?? "آخر المعاملات"}
        </div>
        {txns.map((tx, i) => (
          <div key={tx.id} className={`flex items-center justify-between px-3 py-2 text-xs ${i < txns.length - 1 ? "border-b border-outline-variant/8" : ""}`}>
            <span className="font-mono font-bold text-primary">{tx.id}</span>
            <div className="h-1.5 w-16 rounded-full bg-surface-container" />
            <span className={`font-black ${tx.cls}`}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsMockup({ t }: MockupProps) {
  const reviews = [
    { name: "محمد أ.", rating: 5, text: t.landingFeat8P1 ?? "منتج ممتاز جداً", badge: "bg-emerald-100 text-emerald-700", status: t.statusCompleted ?? "منشور", flag: "🇸🇦" },
    { name: "سارة م.", rating: 4, text: t.landingFeat8P2 ?? "جودة عالية وتوصيل سريع", badge: "bg-amber-100 text-amber-600", status: t.statusPending ?? "انتظار", flag: "🇦🇪" },
    { name: "أحمد ك.", rating: 5, text: t.landingFeat8P3 ?? "تجربة شراء رائعة", badge: "bg-emerald-100 text-emerald-700", status: t.statusCompleted ?? "منشور", flag: "🇰🇼" },
  ];
  return (
    <div className="p-4">
      {/* rating summary */}
      <div className="mb-4 flex items-center gap-4 rounded-2xl bg-surface-container-low p-3">
        <div className="text-center">
          <p className="text-3xl font-black text-amber-400">4.8</p>
          <div className="flex gap-0.5">{"★★★★★".split("").map((s,i)=><span key={i} className="text-sm text-amber-400">{s}</span>)}</div>
        </div>
        <div className="flex-1 space-y-1">
          {[5,4,3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant">{n}★</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                <div className="h-full rounded-full bg-amber-400" style={{ width: n === 5 ? "80%" : n === 4 ? "15%" : "5%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* review cards */}
      <div className="grid gap-2">
        {reviews.map(r => (
          <div key={r.name} className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/30 text-xs font-black text-primary">{r.flag}</div>
                <div>
                  <p className="text-xs font-bold text-on-surface">{r.name}</p>
                  <span>{"★".repeat(r.rating)}</span>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.badge}`}>{r.status}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-on-surface-variant">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PagesMockup({ t }: MockupProps) {
  const pages = [
    { title: t.landingFeat9P1 ?? "من نحن", slug: "/about", icon: "📄", active: true, sections: 3 },
    { title: t.landingFeat9P2 ?? "تواصل معنا", slug: "/contact", icon: "📬", active: true, sections: 2 },
    { title: t.landingFeat9P3 ?? "سياسة الإرجاع", slug: "/returns", icon: "↩️", active: false, sections: 4 },
    { title: t.landingFeat9P4 ?? "الأسئلة الشائعة", slug: "/faq", icon: "❓", active: true, sections: 6 },
  ];
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-on-surface">{t.landingFeat9Title}</p>
        <div className="rounded-xl bg-primary px-3 py-1 text-xs font-bold text-white">+ {t.landingFeat9P1?.split(" ")[0] ?? "صفحة"}</div>
      </div>
      <div className="grid gap-2">
        {pages.map(p => (
          <div key={p.title} className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${p.active ? "border-outline-variant/20 bg-surface-container-lowest" : "border-outline-variant/10 bg-surface-container/40"}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-lg">{p.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">{p.title}</p>
              <p className="font-mono text-[10px] text-on-surface-variant" dir="ltr">/{p.slug.replace("/","")} · {p.sections} {t.landingFeat9P3?.split(" ")[0] ?? "أقسام"}</p>
            </div>
            <div className={`h-2.5 w-2.5 rounded-full ${p.active ? "bg-emerald-400" : "bg-slate-300"}`} />
            <button className="rounded-lg border border-outline-variant/20 px-2.5 py-1 text-[10px] font-bold text-on-surface-variant hover:bg-surface-container-low">
              {t.edit ?? "تعديل"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════ CTA ════════════════════ */
export function LandingCTA() {
  const { t, locale } = useI18n();
  const isEn = locale === "en";

  return (
    <section className="py-20">
      <div className="app-container">
        <div className="relative overflow-hidden rounded-3xl p-10 text-center md:p-20"
          style={{ background: "linear-gradient(135deg, #092327 0%, #1a3d35 50%, #2d1422 100%)" }}>

          {/* glow blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-80 w-80 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }} />
            <div className="absolute -bottom-20 -right-10 h-96 w-96 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
            <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }} />
          </div>

          {/* grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative">
            {/* badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-white backdrop-blur-sm">
              <HiSparkles className="text-yellow-300" />
              {t.landingCtaBadge}
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
              {t.landingCtaTitle}
            </h2>

            <p className="mt-5 w-full text-base leading-relaxed text-white/60 md:text-lg">
              {t.landingCtaDesc}
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-7 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 sm:px-9 sm:text-lg"
                dir={isEn ? "ltr" : "rtl"}
                style={{ background: "linear-gradient(135deg, #884a70, #092327)" }}>
                <span className="absolute inset-0 translate-x-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0" />
                <span className="relative whitespace-nowrap">{t.landingCtaPrimary}</span>
                {isEn ? (
                  <HiArrowRight className="relative shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                ) : (
                  <HiArrowLeft className="relative shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
                )}
              </Link>
              <Link href="/register"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-9 py-4 text-lg font-bold text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white">
                {t.landingCtaSecondary}
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/35">
              {isEn ? "No credit card required · Free to start" : "لا يلزم بطاقة ائتمان · مجاني للبدء"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ SUPPORT STORY ════════════════════ */
export function LandingSupportStory() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <section className="border-t border-outline-variant/20 py-16">
      <div className="app-container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 text-4xl">🌱</div>
          <h2 className="text-xl font-extrabold text-on-surface">
            {isEn ? "A solo project — built with passion" : "مشروع فردي"}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            {isEn
              ? "This is a solo project built by a recent graduate who couldn't find a suitable job after finishing university, so she decided to start her own project. If this project gets enough support, I plan to add more features, more languages, and keep improving the experience for everyone."
              : "هذا الموقع مشروع فردي، أنشأته خريجة لم تجد عملاً مناسباً بعد التخرج فقررت تبدأ مشروعها الخاص، إذا حصل المشروع على دعم كافٍ أخطط لإضافة المزيد من المميزات واللغات والاستمرار في تحسين التجربة للجميع."}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="https://paypal.me/QShatha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#0070BA] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <HiCash className="h-5 w-5" />
              paypal.me/QShatha
            </a>
            <a
              href="mailto:shathalvu@gmail.com"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-outline-variant/40 bg-surface-container px-6 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <HiMail className="h-5 w-5 text-primary" />
              shathalvu@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
