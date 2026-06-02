"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, login } from "@/lib/api";

type LoginMode = "vendor" | "buyer";

const demoAccounts: Record<LoginMode, { label: string; email: string }> = {
  vendor: {
    label: "تاجر",
    email: "vendor@nmoo.test",
  },
  buyer: {
    label: "عميل",
    email: "buyer@nmoo.test",
  },
};

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("vendor");
  const [email, setEmail] = useState("vendor@nmoo.test");
  const [password, setPassword] = useState("Nmoo12345");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      saveToken(response.accessToken);
      const nextPath = new URLSearchParams(window.location.search).get("next");
      const fallbackPath = response.user.role === "BUYER" ? "/" : "/dashboard";
      router.push(nextPath ?? fallbackPath);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر تسجيل الدخول. تأكد من البيانات وحاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5 p-8 text-right lg:p-10" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-container-low p-1">
        {(Object.keys(demoAccounts) as LoginMode[]).map((accountMode) => {
          const account = demoAccounts[accountMode];
          const isActive = mode === accountMode;

          return (
            <button
              key={accountMode}
              className={`rounded-lg px-4 py-3 font-bold transition-colors ${
                isActive ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-lowest"
              }`}
              data-testid={`login-mode-${accountMode}`}
              type="button"
              onClick={() => {
                setMode(accountMode);
                setEmail(account.email);
                setPassword("Nmoo12345");
                setMessage("");
              }}
            >
              دخول {account.label}
            </button>
          );
        })}
      </div>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">البريد الإلكتروني</span>
        <input
          className="input-field px-4 py-3 text-right"
          dir="ltr"
          inputMode="email"
          required
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setMode(event.target.value === demoAccounts.buyer.email ? "buyer" : "vendor");
          }}
        />
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">كلمة المرور</span>
        <input
          className="input-field px-4 py-3 text-right"
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

      <button className="primary-button py-4 disabled:cursor-not-allowed disabled:opacity-60" data-testid="login-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "جاري الدخول..." : `تسجيل الدخول كـ ${demoAccounts[mode].label}`}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        لا تملك حساباً؟{" "}
        <Link className="font-bold text-primary hover:underline" href="/register">
          أنشئ حساب تاجر
        </Link>
      </p>
    </form>
  );
}

function saveToken(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `nmoo_access_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}
