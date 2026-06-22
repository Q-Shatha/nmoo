"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, register, UserRole } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type AccountType = Extract<UserRole, "BUYER" | "VENDOR">;

export function RegisterForm() {
  const { t } = useI18n();
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
      setMessage(error instanceof ApiError ? error.message : t.failedToCreateAccount);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5 p-8 text-start lg:p-10" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-container-low p-1">
        <button
          className={`rounded-lg px-4 py-3 font-bold ${accountType === "BUYER" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          type="button"
          onClick={() => setAccountType("BUYER")}
        >
          {t.buyerAccountType}
        </button>
        <button
          className={`rounded-lg px-4 py-3 font-bold ${accountType === "VENDOR" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          type="button"
          onClick={() => setAccountType("VENDOR")}
        >
          {t.vendorAccountType}
        </button>
      </div>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">{t.name}</span>
        <input className="input-field px-4 py-3 text-start" required value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">{t.emailLabel}</span>
        <input
          className="input-field px-4 py-3"
          dir="ltr"
          inputMode="email"
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">{t.passwordLabel}</span>
        <input
          className="input-field px-4 py-3"
          minLength={8}
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {accountType === "BUYER" ? (
        <p className="rounded-xl bg-primary-container/30 px-4 py-3 text-sm font-bold leading-7 text-on-primary-container">
          {t.registerBuyerHint}
        </p>
      ) : null}

      {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

      <button className="primary-button py-4 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? t.creatingAccount : t.createAccount}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        {t.hasAccount}{" "}
        <Link className="font-bold text-primary hover:underline" href="/login">
          {t.login}
        </Link>
      </p>
    </form>
  );
}

function saveToken(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `nmoo_access_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}
