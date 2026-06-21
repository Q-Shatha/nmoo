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

/* ─── animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
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
  return <span ref={ref}>{value.toLocaleString("ar-SA")}{suffix}</span>;
}

function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} style={style} />;
}

const barData = [35, 58, 42, 74, 62, 88, 76];
const days   = ["أ", "ث", "ر", "خ", "ج", "س", "ح"];

/* ════════════════════ HERO ════════════════════ */
export function LandingHero() {
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

  return (
    <section className="relative py-20 lg:py-32">
      <Orb className="h-[600px] w-[600px] bg-primary-container/30" style={{ top: "-10%", right: "-8%" }} />
      <Orb className="h-[400px] w-[400px] bg-violet-300/15" style={{ bottom: "0", left: "-6%" }} />

      <div className="app-container relative grid grid-cols-1 items-center gap-16 lg:grid-cols-2">

        {/* ── text ── */}
        <div className="order-1 max-w-2xl text-right lg:order-2"
          style={{ animation: "heroFadeIn 0.8s cubic-bezier(.22,1,.36,1) both" }}>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-container/25 px-4 py-2 text-sm font-bold text-primary backdrop-blur-sm">
            <HiGlobe className="text-base" />
            منصة تجارة إلكترونية عالمية
          </div>

          <h1 className="section-title text-5xl leading-tight md:text-6xl lg:text-7xl">
            متجرك الخاص
            <br />
            <span className="hero-gradient-text">بكل دولة في العالم</span>
          </h1>

          <p className="section-copy mt-6 text-lg leading-loose">
            مع <span className="font-bold text-primary">nmoo نمو</span> تفتح متجرك
            الإلكتروني بـ <span className="font-bold text-on-surface">رابطك المميز الخاص</span>،
            وتبيع لعملائك في أي مكان حول العالم — بلا حدود، بلا تعقيد.
          </p>

          {/* unique URL showcase */}
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-right">
            <HiLink className="shrink-0 text-xl text-primary" />
            <div>
              <p className="text-xs text-on-surface-variant">رابطك المميز الخاص</p>
              <p className="font-mono text-sm font-bold text-on-surface" dir="ltr">
                nmoo.store/<span className="text-primary">your-store-name</span>
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <Link href="/register" className="primary-button group relative overflow-hidden px-8 py-4 text-lg">
              <span className="relative z-10 flex items-center gap-2">
                افتح متجرك مجانًا
                <HiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              </span>
              <span className="btn-shimmer" aria-hidden />
            </Link>
            <Link href="/register" className="secondary-button px-8 py-4 text-lg">
              شاهد مثال متجر
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-5">
            {[
              { icon: HiGlobe,       label: "عالمي بكل الدول" },
              { icon: HiLink,        label: "رابط خاص لكل متجر" },
              { icon: HiShieldCheck, label: "دفع آمن" },
              { icon: HiLightningBolt, label: "إطلاق سريع" },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant">
                <t.icon className="text-primary" />
                {t.label}
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
                <p className="text-sm font-bold text-on-surface">لوحة تحكم متجرك</p>
                <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">نشط ●</div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  { label: "المبيعات",  value: "12,450", unit: "$",  bg: "bg-primary-container/30", text: "text-primary" },
                  { label: "الطلبات",   value: "184",    unit: "",   bg: "bg-violet-100",           text: "text-violet-600" },
                  { label: "العملاء",   value: "937",    unit: "",   bg: "bg-emerald-100",          text: "text-emerald-600" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
                    <p className="text-xs text-on-surface-variant">{s.label}</p>
                    <p className={`mt-1 text-xl font-extrabold ${s.text}`}>
                      {s.value}{s.unit && <span className="ms-1 text-xs font-semibold">{s.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>

              <div ref={barRef} className="mx-4 mb-4 rounded-xl bg-surface-container-low p-4">
                <p className="mb-3 text-right text-xs font-semibold text-on-surface-variant">مبيعات هذا الأسبوع (USD)</p>
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
                <p className="mb-2 text-right text-xs font-bold text-on-surface-variant">آخر الطلبات</p>
                {[
                  { id: "#4821", status: "مكتمل",       amount: "$320", dot: "bg-emerald-500", country: "🇸🇦" },
                  { id: "#4820", status: "قيد التوصيل", amount: "$175", dot: "bg-blue-400",    country: "🇦🇪" },
                  { id: "#4819", status: "معالجة",       amount: "$540", dot: "bg-amber-400",  country: "🇺🇸" },
                ].map((o) => (
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
              <div className="text-right">
                <p className="text-[11px] text-on-surface-variant">طلب جديد 🇩🇪</p>
                <p className="text-sm font-bold text-on-surface">+3 منتجات</p>
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
  return (
    <section className="border-y border-outline-variant/25 bg-white/50 py-10 backdrop-blur-sm">
      <div className="app-container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { target: 150,    suffix: "+",  label: "دولة حول العالم",   icon: HiGlobe },
            { target: 5000,   suffix: "+",  label: "تاجر نشط",          icon: HiUsers },
            { target: 120000, suffix: "+",  label: "طلب مكتمل",         icon: HiShoppingBag },
            { target: 98,     suffix: "%",  label: "رضا التجار",        icon: HiStar },
          ].map((s) => (
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
  const steps = [
    { n: "١", title: "سجّل حسابك", desc: "أنشئ حسابك في دقيقة واحدة فقط — لا يلزم بطاقة ائتمانية.", icon: HiUsers },
    { n: "٢", title: "خصّص متجرك", desc: "اختر اسمك المميز وادخل منتجاتك وصوّرها — كل شيء من لوحة تحكم واحدة.", icon: HiColorSwatch },
    { n: "٣", title: "شارك رابطك", desc: "رابطك الخاص جاهز فوراً — شاركه مع عملائك في أي مكان بالعالم.", icon: HiLink },
    { n: "٤", title: "استقبل الطلبات", desc: "طلبات العملاء تصلك مباشرة وتتابعها من لوحة تحكمك أينما كنت.", icon: HiShoppingBag },
  ];

  return (
    <section className="bg-surface-container-lowest py-24">
      <div className="app-container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
            <HiLightningBolt />
            كيف تبدأ؟
          </div>
          <h2 className="section-title text-3xl md:text-4xl">افتح متجرك في 4 خطوات</h2>
          <p className="section-copy mt-4 text-lg">لا تحتاج خبرة تقنية — المنصة تساعدك كل خطوة بالطريق.</p>
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
  const panels = [
    {
      icon: HiCollection,
      color: "bg-violet-100 text-violet-600",
      title: "إدارة المنتجات",
      desc: "أضف منتجاتك بصور عالية الجودة، حدد الأسعار، المخزون، الخيارات (مقاس، لون، نوع) — كل شيء من شاشة واحدة بسيطة.",
      points: ["رفع صور متعددة لكل منتج", "خيارات وتنويعات غير محدودة", "إدارة المخزون تلقائياً", "تصنيف المنتجات بفئات"],
    },
    {
      icon: HiShoppingBag,
      color: "bg-emerald-100 text-emerald-600",
      title: "متابعة الطلبات",
      desc: "كل طلب يصلك بإشعار فوري. تابع حالة التوصيل، اطبع الفواتير، وتواصل مع العميل مباشرة.",
      points: ["إشعارات فورية لكل طلب", "تتبع حالة الطلب (جديد ← شحن ← مكتمل)", "طباعة الفواتير والبوالص", "تاريخ كامل لكل عميل"],
    },
    {
      icon: HiChartBar,
      color: "bg-blue-100 text-blue-600",
      title: "تقارير المبيعات",
      desc: "تقارير بصرية تفاعلية تُظهر أداء متجرك — أكثر المنتجات مبيعاً، أوقات الذروة، ومصادر الزوار.",
      points: ["تقارير يومية وأسبوعية وشهرية", "أكثر المنتجات مبيعاً", "مبيعات حسب الدولة", "تحليل سلوك العملاء"],
    },
    {
      icon: HiTag,
      color: "bg-amber-100 text-amber-600",
      title: "كوبونات الخصم",
      desc: "أنشئ كوبونات خصم لعملائك بنسب أو قيم ثابتة، وحدد مدة صلاحيتها وعدد مرات الاستخدام.",
      points: ["خصم بنسبة مئوية أو قيمة ثابتة", "تحديد تاريخ انتهاء الصلاحية", "تقييد عدد مرات الاستخدام", "ربط الكوبون بمنتج معين"],
    },
    {
      icon: HiColorSwatch,
      color: "bg-pink-100 text-pink-600",
      title: "تصميم المتجر",
      desc: "خصّص مظهر متجرك بالكامل — الألوان، الشعار، قالب العرض — حتى يعكس هوية علامتك التجارية.",
      points: ["5 قوالب احترافية للاختيار", "ألوان مخصصة لعلامتك التجارية", "رفع شعار ولافتة المتجر", "معاينة مباشرة قبل النشر"],
    },
    {
      icon: HiTruck,
      color: "bg-teal-100 text-teal-600",
      title: "طرق الشحن",
      desc: "حدد مناطق التوصيل والأسعار لكل منطقة، أو أضف شحن مجاني للطلبات التي تتجاوز حداً معيناً.",
      points: ["شحن لأي دولة في العالم", "تسعير مختلف لكل منطقة", "شحن مجاني بشرط حد أدنى", "خيار الاستلام من المتجر"],
    },
    {
      icon: HiCreditCard,
      color: "bg-indigo-100 text-indigo-600",
      title: "الاشتراكات والدفع",
      desc: "قبول الدفع الإلكتروني من عملائك بسهولة تامة، مع خيارات دفع متعددة تناسب جميع الدول.",
      points: ["بطاقات ائتمانية (Visa / Mastercard)", "دفع محلي حسب الدولة", "تقسيط للعملاء", "فواتير إلكترونية تلقائية"],
    },
    {
      icon: HiStar,
      color: "bg-orange-100 text-orange-600",
      title: "تقييمات العملاء",
      desc: "اعرض تقييمات عملائك على صفحات المنتجات لزيادة الثقة وتحسين معدل التحويل.",
      points: ["تقييم بالنجوم لكل منتج", "تعليقات ومراجعات مفصلة", "موافقة التاجر على نشر التقييم", "إحصائيات متوسط التقييم"],
    },
    {
      icon: HiPhotograph,
      color: "bg-rose-100 text-rose-600",
      title: "صفحات المتجر",
      desc: "أنشئ صفحات ثابتة داخل متجرك مثل صفحة عنّا، سياسة الإرجاع، وسياسة الخصوصية.",
      points: ["محرر نصوص سهل الاستخدام", "صفحة عنّا وتواصل معنا", "سياسة الإرجاع والاستبدال", "سياسة الخصوصية والشروط"],
    },
  ];

  return (
    <section className="py-24">
      <div className="app-container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
            <HiCog />
            لوحة التحكم
          </div>
          <h2 className="section-title text-3xl md:text-4xl">كل ما يحتاجه متجرك في مكان واحد</h2>
          <p className="section-copy mt-4 text-lg">
            لوحة تحكم متكاملة تغطي كل جانب من جوانب إدارة متجرك الإلكتروني.
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
  const countries = [
    { flag: "🇸🇦", name: "السعودية" },
    { flag: "🇦🇪", name: "الإمارات" },
    { flag: "🇰🇼", name: "الكويت" },
    { flag: "🇶🇦", name: "قطر" },
    { flag: "🇧🇭", name: "البحرين" },
    { flag: "🇴🇲", name: "عُمان" },
    { flag: "🇪🇬", name: "مصر" },
    { flag: "🇯🇴", name: "الأردن" },
    { flag: "🇩🇪", name: "ألمانيا" },
    { flag: "🇺🇸", name: "أمريكا" },
    { flag: "🇬🇧", name: "بريطانيا" },
    { flag: "🇫🇷", name: "فرنسا" },
  ];

  return (
    <section className="bg-surface-container-lowest py-24">
      <div className="app-container">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* text */}
          <div className="text-right">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
              <HiGlobe />
              بيع للعالم كله
            </div>
            <h2 className="section-title text-3xl md:text-4xl">
              متجرك يصل لكل زاوية في العالم
            </h2>
            <p className="section-copy mt-4 text-lg leading-loose">
              لا تقتصر على دولتك — منصة nmoo نمو تتيح لك البيع لأي شخص في أي
              مكان على الكرة الأرضية. تعدد العملات وطرق الدفع المحلية لكل دولة
              كلها جاهزة لك.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "عملة متعددة تتحول تلقائياً للعميل",
                "طرق دفع محلية لكل دولة",
                "واجهة عربية وإنجليزية للعملاء",
                "شحن دولي مدمج مع أكبر شركات التوصيل",
                "دعم بيانات العملاء بكل الدول",
              ].map((pt) => (
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
              <p className="text-sm font-bold text-primary">+138 دولة أخرى ✦</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════ UNIQUE URL SECTION ════════════════════ */
export function LandingUniqueURL() {
  const examples = [
    { name: "ملابس ليلى", url: "nmoo.store/layla-fashion" },
    { name: "إلكترونيات محمد", url: "nmoo.store/mohammed-tech" },
    { name: "عطور النخبة", url: "nmoo.store/elite-perfumes" },
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
                <div className="flex-1 text-right">
                  <p className="font-bold text-on-surface">{e.name}</p>
                  <p className="font-mono text-sm text-primary" dir="ltr">{e.url}</p>
                </div>
                <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  نشط
                </div>
              </div>
            ))}

            <div className="panel flex items-center gap-4 border-2 border-dashed border-primary/30 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-black text-primary">+</div>
              <div className="flex-1 text-right">
                <p className="font-bold text-primary">متجرك هنا</p>
                <p className="font-mono text-sm text-on-surface-variant" dir="ltr">nmoo.store/<span className="text-primary">اسمك-المميز</span></p>
              </div>
            </div>
          </div>

          {/* text */}
          <div className="text-right">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
              <HiLink />
              رابطك الخاص
            </div>
            <h2 className="section-title text-3xl md:text-4xl">
              كل متجر رابطه الخاص المميز
            </h2>
            <p className="section-copy mt-4 text-lg leading-loose">
              ليس متجراً واحداً مشتركاً — كل تاجر يحصل على رابطه الفريد الخاص
              الذي يمثّل علامته التجارية. شاركه على سوشيال ميديا، ضعه في
              بيوغرافيتك، أو أرسله مباشرة لعملائك.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "رابط قصير وسهل التذكر",
                "يمثّل اسم علامتك التجارية",
                "يعمل على كل الأجهزة والمتصفحات",
                "يمكن مشاركته مباشرة على إنستغرام وتيك توك وسناب",
                "صفحة متجر احترافية جاهزة فوراً",
              ].map((pt) => (
                <li key={pt} className="flex items-center gap-3 text-on-surface-variant">
                  <HiCheckCircle className="shrink-0 text-xl text-primary" />
                  {pt}
                </li>
              ))}
            </ul>
            <Link href="/register" className="primary-button mt-8 inline-flex items-center gap-2 px-8 py-4 text-lg">
              احجز رابطك الآن
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
  return (
    <section className="bg-surface-container-lowest py-24">
      <div className="app-container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-4 py-1.5 text-sm font-bold text-primary">
            <HiCash />
            الأسعار
          </div>
          <h2 className="section-title text-3xl md:text-4xl">ابدأ مجانًا، كبّر بدون قيود</h2>
          <p className="section-copy mt-4 text-lg">لا عمولات على مبيعاتك — فقط اشتراك ثابت وشفاف.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              name: "مجاني",
              price: "$0",
              period: "للأبد",
              color: "border-outline-variant/30",
              badge: "",
              features: ["حتى 10 منتجات", "رابط متجر خاص", "لوحة تحكم كاملة", "إدارة الطلبات", "دعم عبر البريد"],
              cta: "ابدأ مجانًا",
              ctaClass: "secondary-button",
            },
            {
              name: "احترافي",
              price: "$19",
              period: "/ شهر",
              color: "border-primary",
              badge: "الأكثر شيوعاً",
              features: ["منتجات غير محدودة", "تقارير متقدمة", "كوبونات خصم", "تخصيص التصميم الكامل", "دعم أولوية", "بيع دولي"],
              cta: "ابدأ تجربة مجانية",
              ctaClass: "primary-button",
            },
            {
              name: "الأعمال",
              price: "$49",
              period: "/ شهر",
              color: "border-secondary",
              badge: "",
              features: ["كل مزايا الاحترافي", "متاجر متعددة", "مدير حساب خاص", "تكامل API", "تقارير مخصصة", "دعم 24/7"],
              cta: "تواصل معنا",
              ctaClass: "secondary-button",
            },
          ].map((plan) => (
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
  return (
    <section className="py-20">
      <div className="app-container">
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 text-center md:p-16">
          <Orb className="h-72 w-72 bg-primary/30" style={{ top: "-20%", left: "10%" }} />
          <Orb className="h-56 w-56 bg-violet-400/20" style={{ bottom: "-15%", right: "8%" }} />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
              <HiSparkles />
              ابدأ اليوم — مجانًا
            </div>
            <h2 className="section-title text-3xl text-white md:text-4xl">
              متجرك الخاص ينتظرك
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-loose text-white/70">
              انضم لآلاف التجار حول العالم الذين يديرون متاجرهم الخاصة برابطهم
              المميز على nmoo نمو.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-secondary transition-all duration-200 hover:bg-white/90 hover:shadow-lg hover:shadow-white/20">
                افتح متجرك مجانًا
                <HiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
              <Link href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20">
                تصفح متجر تجريبي
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
