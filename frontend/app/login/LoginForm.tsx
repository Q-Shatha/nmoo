import Link from "next/link";

type LoginMode = "buyer" | "vendor";

type LoginFormProps = {
  initialMessage?: string;
  nextPath?: string;
};

const loginModes: Record<LoginMode, { label: string; email: string; role: "BUYER" | "VENDOR" }> = {
  buyer: {
    label: "عميل",
    email: "buyer@nmoo.test",
    role: "BUYER",
  },
  vendor: {
    label: "تاجر",
    email: "vendor@nmoo.test",
    role: "VENDOR",
  },
};

export function LoginForm({ initialMessage = "", nextPath = "" }: LoginFormProps) {
  return (
    <form action="/login/submit" className="grid gap-5 p-5 text-right sm:p-8 lg:p-10" method="post">
      <input name="next" type="hidden" value={nextPath} />

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-container-low p-1.5" role="radiogroup" aria-label="نوع الحساب">
        {(Object.keys(loginModes) as LoginMode[]).map((accountMode) => {
          const account = loginModes[accountMode];

          return (
            <label key={accountMode} className="relative block min-h-12 cursor-pointer touch-manipulation">
              <input className="peer sr-only" data-testid={`login-mode-${accountMode}`} defaultChecked={accountMode === "buyer"} name="expectedRole" type="radio" value={account.role} />
              <span className="flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-base font-black text-on-surface-variant transition-colors peer-checked:bg-primary peer-checked:text-on-primary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary sm:text-sm">
                دخول {account.label}
              </span>
            </label>
          );
        })}
      </div>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">البريد الإلكتروني</span>
        <input className="input-field min-h-12 px-4 py-3 text-right" dir="ltr" inputMode="email" name="email" required type="email" defaultValue={loginModes.buyer.email} />
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-on-surface">كلمة المرور</span>
        <input className="input-field min-h-12 px-4 py-3 text-right" dir="ltr" name="password" required type="password" defaultValue="Nmoo12345" />
      </label>

      {initialMessage ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold leading-7 text-error">{initialMessage}</p> : null}

      <button className="primary-button min-h-14 touch-manipulation py-4 text-base disabled:cursor-not-allowed disabled:opacity-60" data-testid="login-submit" type="submit">
        تسجيل الدخول
      </button>

      <p className="text-center text-sm leading-7 text-on-surface-variant">
        لا تملك حسابا؟{" "}
        <Link className="font-bold text-primary hover:underline" href="/register">
          أنشئ حساب جديد
        </Link>
      </p>
    </form>
  );
}
