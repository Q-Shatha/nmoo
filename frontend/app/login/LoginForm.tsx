import Link from "next/link";
import { getT } from "@/lib/i18n/server";

type LoginMode = "buyer" | "vendor";

type LoginFormProps = {
  initialMessage?: string;
  nextPath?: string;
};

export async function LoginForm({ initialMessage = "", nextPath = "" }: LoginFormProps) {
  const t = await getT();

  const loginModes: Record<LoginMode, { label: string; email: string; role: "BUYER" | "VENDOR" }> = {
    buyer: {
      label: t.roleBuyer,
      email: "buyer@nmoo.test",
      role: "BUYER",
    },
    vendor: {
      label: t.roleVendor,
      email: "vendor@nmoo.test",
      role: "VENDOR",
    },
  };

  return (
    <form action="/login/submit" className="grid gap-5 p-5 text-start sm:p-8 lg:p-10" method="post">
      <input name="next" type="hidden" value={nextPath} />

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-container-low p-1.5" role="radiogroup" aria-label={t.loginAccountTypeLabel}>
        {(Object.keys(loginModes) as LoginMode[]).map((accountMode) => {
          const account = loginModes[accountMode];

          return (
            <label key={accountMode} className="relative block min-h-12 cursor-pointer touch-manipulation">
              <input className="peer sr-only" data-testid={`login-mode-${accountMode}`} defaultChecked={accountMode === "buyer"} name="expectedRole" type="radio" value={account.role} />
              <span className="flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-base font-black text-on-surface-variant transition-colors peer-checked:bg-secondary peer-checked:text-on-secondary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-secondary sm:text-sm">
                {t.loginEnterAs(account.label)}
              </span>
            </label>
          );
        })}
      </div>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">{t.emailLabel}</span>
        <input className="input-field min-h-12 px-4 py-3" dir="ltr" inputMode="email" name="email" required type="email" defaultValue={loginModes.buyer.email} />
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">{t.passwordLabel}</span>
        <input className="input-field min-h-12 px-4 py-3" dir="ltr" name="password" required type="password" defaultValue="Nmoo12345" />
      </label>

      {initialMessage ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold leading-7 text-error">{initialMessage}</p> : null}

      <button className="primary-button min-h-14 touch-manipulation py-4 text-base disabled:cursor-not-allowed disabled:opacity-60" data-testid="login-submit" type="submit">
        {t.login}
      </button>

      <p className="text-center text-sm leading-7 text-on-surface-variant">
        {t.noAccount}{" "}
        <Link className="font-bold text-primary hover:underline" href="/register">
          {t.createNewAccount}
        </Link>
      </p>
    </form>
  );
}
