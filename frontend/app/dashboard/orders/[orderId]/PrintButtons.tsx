"use client";
import { useEffect } from "react";

export function PrintButtons() {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <>
      <button
        onClick={() => window.print()}
        className="rounded-2xl bg-[#1a1a2e] px-6 py-3 font-bold text-white"
      >
        طباعة
      </button>
      <button
        onClick={() => window.close()}
        className="rounded-2xl bg-[#eee] px-6 py-3 font-bold text-[#333]"
      >
        إغلاق
      </button>
    </>
  );
}
