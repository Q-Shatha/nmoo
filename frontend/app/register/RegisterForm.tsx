"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, register, UserRole } from "@/lib/api";

type AccountType = Extract<UserRole, "BUYER" | "VENDOR">;

export function RegisterForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("BUYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await register({
        name,
        email,
        password,
        role: accountType,
      });

      saveToken(response.accessToken);
      router.push(accountType === "BUYER" ? "/account/address?next=/" : "/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر إنشاء الحساب. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5 p-8 text-right lg:p-10" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-container-low p-1">
        <button
          className={`rounded-lg px-4 py-3 font-bold ${accountType === "BUYER" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          type="button"
          onClick={() => setAccountType("BUYER")}
        >
          حساب عميل
        </button>
        <button
          className={`rounded-lg px-4 py-3 font-bold ${accountType === "VENDOR" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          type="button"
          onClick={() => setAccountType("VENDOR")}
        >
          حساب تاجر
        </button>
      </div>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">الاسم</span>
        <input className="input-field px-4 py-3 text-right" required value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">البريد الإلكتروني</span>
        <input
          className="input-field px-4 py-3 text-right"
          dir="ltr"
          inputMode="email"
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">كلمة المرور</span>
        <input
          className="input-field px-4 py-3 text-right"
          minLength={8}
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {accountType === "BUYER" ? (
        <p className="rounded-xl bg-primary-container/30 px-4 py-3 text-sm font-bold leading-7 text-on-primary-container">
          بعد إنشاء الحساب سننقلك إلى صفحة مستقلة لإضافة العنوان، ويمكنك تعديله لاحقا من إعدادات الحساب.
        </p>
      ) : null}

      {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

      <button className="primary-button py-4 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        لديك حساب؟{" "}
        <Link className="font-bold text-primary hover:underline" href="/login">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}

function saveToken(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `nmoo_access_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}
