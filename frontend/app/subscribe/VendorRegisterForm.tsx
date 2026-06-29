"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, register } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function VendorRegisterForm({ plan }: { plan: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await register({ name, email, password, role: "VENDOR" });
      saveToken(response.accessToken);
      router.push(`/subscribe/plans?plan=${plan}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.failedToCreateAccount);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5 p-8 text-start lg:p-10" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="font-bold text-on-surface">{t.name}</span>
        <input
          className="input-field px-4 py-3 text-start"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {message && (
        <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p>
      )}

      <button
        className="primary-button py-4 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? t.creatingAccount : t.createAccount}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        {t.hasAccount}{" "}
        <Link className="font-bold text-primary hover:underline" href={`/login?next=/subscribe/plans?plan=${plan}`}>
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
