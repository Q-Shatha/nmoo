"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type PlanKey = "free" | "standard" | "premium";

const PLAN_AMOUNTS: Record<PlanKey, number> = {
  free: 0,
  standard: 4500, // 45 SAR in halalas
  premium: 9000,  // 90 SAR in halalas
};

const PLAN_DESC: Record<PlanKey, { ar: string; en: string }> = {
  free:     { ar: "اشتراك الباقة المجانية",  en: "Free Plan Subscription" },
  standard: { ar: "اشتراك الباقة القياسية", en: "Standard Plan Subscription" },
  premium:  { ar: "اشتراك الباقة المميزة",  en: "Premium Plan Subscription" },
};

interface Props {
  plan: PlanKey;
  isAr: boolean;
}

declare global {
  interface Window {
    Moyasar: {
      init: (options: Record<string, unknown>) => void;
    };
  }
}

export function MoyasarForm({ plan, isAr }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const callbackUrl = `${window.location.origin}/subscribe/callback?plan=${plan}`;
    const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_KEY!;

    function initMoyasar() {
      if (!window.Moyasar || !containerRef.current) return;
      // Clear previous form instance
      containerRef.current.innerHTML = "";
      window.Moyasar.init({
        element: containerRef.current,
        amount: PLAN_AMOUNTS[plan],
        currency: "SAR",
        description: isAr ? PLAN_DESC[plan].ar : PLAN_DESC[plan].en,
        publishable_api_key: publishableKey,
        callback_url: callbackUrl,
        methods: ["creditcard", "stcpay"],
        language: isAr ? "ar" : "en",
        on_failure: (error: unknown) => {
          console.error("Payment failed", error);
        },
      });
    }

    // Load CSS
    if (!document.querySelector('link[href*="moyasar"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.css";
      document.head.appendChild(link);
    }

    // Load JS then init; if already loaded just re-init
    if (!document.querySelector('script[src*="moyasar"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.js";
      script.onload = initMoyasar;
      document.head.appendChild(script);
    } else if (window.Moyasar) {
      initMoyasar();
    }
  }, [plan, isAr]);

  return (
    <div className="mt-6">
      <div ref={containerRef} />
    </div>
  );
}
