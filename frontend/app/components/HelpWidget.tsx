"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";

type Status = "idle" | "sent";
type Step = "button" | "form";

export function HelpWidget() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [step, setStep] = useState<Step>("button");
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `الاسم: ${form.name}\nالبريد: ${form.email}\n\nالمشكلة:\n${form.message}`;
    const mailto = `mailto:nmoox2026@gmail.com?subject=${encodeURIComponent(`[nmoo] ${form.subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  const dir = isAr ? "rtl" : "ltr";

  if (step === "button") {
    return (
      <button
        onClick={() => { setStep("form"); setStatus("idle"); }}
        className="fixed bottom-6 left-6 z-50 group flex items-center gap-0 overflow-hidden rounded-full bg-primary text-on-primary shadow-2xl transition-all duration-300 hover:gap-2 hover:px-5 px-4 py-4"
        aria-label={isAr ? "المساعدة والدعم" : "Help & Support"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-[80px]">
          {isAr ? "مساعدة" : "Help"}
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setStep("button")} />

      <div
        className="fixed bottom-6 left-6 z-50 w-[360px] overflow-hidden rounded-3xl shadow-2xl"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}
        dir={dir}
      >
        {/* gradient header */}
        <div className="relative overflow-hidden px-6 pb-8 pt-6" style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)" }}>
          {/* decorative circles */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20" style={{ background: "white" }} />
          <div className="absolute -bottom-10 -left-4 h-32 w-32 rounded-full opacity-10" style={{ background: "white" }} />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">nmoo</span>
              </div>
              <h2 className="text-xl font-black text-white">{isAr ? "كيف نساعدك؟" : "How can we help?"}</h2>
              <p className="mt-1 text-sm text-white/70">{isAr ? "سنرد عليك في أقرب وقت" : "We'll get back to you soon"}</p>
            </div>
            <button
              onClick={() => setStep("button")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* form card */}
        <div className="bg-surface-container-lowest px-6 pb-6 pt-5">
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-black text-lg text-on-surface">{isAr ? "تم الإرسال!" : "Message sent!"}</p>
              <p className="text-sm text-on-surface-variant">{isAr ? "سيتواصل معك فريق الدعم قريباً" : "Our support team will reach out soon"}</p>
              <button
                onClick={() => { setStatus("idle"); setStep("button"); }}
                className="mt-2 text-sm font-bold text-primary hover:underline"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">{isAr ? "الاسم" : "Name"}</label>
                  <input
                    name="name" required value={form.name} onChange={change}
                    placeholder={isAr ? "محمد" : "John"}
                    className="input-field w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">{isAr ? "البريد" : "Email"}</label>
                  <input
                    name="email" type="email" required value={form.email} onChange={change}
                    placeholder="you@email.com"
                    className="input-field w-full px-3 py-2.5 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">{isAr ? "الموضوع" : "Subject"}</label>
                <input
                  name="subject" required value={form.subject} onChange={change}
                  placeholder={isAr ? "وصف مختصر للمشكلة" : "Brief description"}
                  className="input-field w-full px-3 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">{isAr ? "تفاصيل المشكلة" : "Details"}</label>
                <textarea
                  name="message" required rows={4} value={form.message} onChange={change}
                  placeholder={isAr ? "اشرح المشكلة بالتفصيل..." : "Describe your issue in detail..."}
                  className="input-field w-full resize-none px-3 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-on-primary transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {isAr ? "إرسال الرسالة" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
