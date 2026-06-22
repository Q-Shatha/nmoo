"use client";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

export function PrintButtons() {
  const { t } = useI18n();

  useEffect(() => {
    window.print();
  }, []);

  return (
    <>
      <button
        onClick={() => window.print()}
        className="rounded-2xl bg-[#1a1a2e] px-6 py-3 font-bold text-white"
      >
        {t.print}
      </button>
      <button
        onClick={() => window.close()}
        className="rounded-2xl bg-[#eee] px-6 py-3 font-bold text-[#333]"
      >
        {t.close}
      </button>
    </>
  );
}
