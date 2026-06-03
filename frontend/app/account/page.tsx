import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getMe } from "@/lib/api";
import { getCountryLabel } from "@/lib/location-data";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";
import { AccountAvatar } from "./AccountAvatar";
import { EditableName } from "./EditableName";

type AccountData =
  | {
      ok: true;
      user: Awaited<ReturnType<typeof getMe>>;
    }
  | {
      ok: false;
      message: string;
    };

export default async function AccountPage() {
  const data = await loadAccount();

  return (
    <>
      <PublicHeader />
      <main className="app-container min-h-screen pt-8">
        <section className="mx-auto max-w-3xl">
          <div className="mb-8 text-right">
            <p className="chip px-4 py-2 text-sm">حسابي</p>
            <h1 className="section-title mt-4 text-4xl">إعدادات الحساب</h1>
          </div>

          {data.ok ? <AccountDetails user={data.user} /> : <Unavailable message={data.message} />}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

function AccountDetails({ user }: { user: Awaited<ReturnType<typeof getMe>> }) {
  const hasAddress = Boolean(user.country || user.phoneNumber || user.region || user.city || user.district || user.street || user.buildingNumber || user.postalCode || user.nationalAddress);

  return (
    <section className="panel p-6 text-right">
      <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-6">
        <AccountAvatar user={user} />
        <span className="hidden h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary-container text-2xl font-black text-on-primary-container">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={user.name} className="h-full w-full object-cover" src={user.avatarUrl} />
          ) : (
            user.name.trim()[0] ?? "ن"
          )}
        </span>
        <div>
          <EditableName user={user} />
          <p className="mt-1 text-on-surface-variant">{formatRole(user.role)}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4">
        <Info label="البريد الإلكتروني" value={user.email} />
        <Info label="نوع الحساب" value={formatRole(user.role)} />
        <Info label="رقم الحساب" value={user.id.slice(0, 8)} />
      </dl>

      <div className="mt-8 rounded-xl bg-surface-container-low p-5">
        <div className="flex flex-col gap-3 border-b border-outline-variant/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-on-surface">عنوان الشحن</h3>
            <p className="mt-1 text-sm leading-7 text-on-surface-variant">يمكنك تعديل العنوان من صفحة مستقلة مخصصة للعميل.</p>
          </div>
          <Link className="secondary-button px-5 py-3" href="/account/address">
            تعديل العنوان
          </Link>
        </div>

        {hasAddress ? (
          <dl className="mt-5 grid gap-3 md:grid-cols-2">
            {user.country ? <Info label="البلد" value={formatCountry(user.country)} /> : null}
            {user.phoneNumber ? <Info label="رقم الجوال" value={user.phoneNumber} /> : null}
            {user.region ? <Info label="المنطقة" value={user.region} /> : null}
            {user.city ? <Info label="المدينة" value={user.city} /> : null}
            {user.district ? <Info label="الحي" value={user.district} /> : null}
            {user.street ? <Info label="الشارع" value={user.street} /> : null}
            {user.buildingNumber ? <Info label="رقم المبنى أو البيت" value={user.buildingNumber} /> : null}
            {user.postalCode ? <Info label="الرمز البريدي" value={user.postalCode} /> : null}
            {user.country === "SA" && user.nationalAddress ? <Info label="العنوان الوطني" value={user.nationalAddress} /> : null}
          </dl>
        ) : (
          <p className="mt-5 rounded-xl bg-surface-container-lowest p-4 text-sm font-bold text-on-surface-variant">لم تتم إضافة عنوان بعد.</p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {user.role !== "BUYER" ? (
          <Link className="primary-button px-6 py-3" href="/dashboard">
            لوحة التحكم
          </Link>
        ) : null}
        <Link className="secondary-button px-6 py-3" href="/orders">
          طلباتي
        </Link>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-4">
      <dt className="text-sm font-bold text-on-surface-variant">{label}</dt>
      <dd className="mt-1 font-black text-on-surface">{value}</dd>
    </div>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <section className="panel p-8 text-center">
      <h2 className="text-2xl font-black text-primary">تحتاج تسجيل دخول</h2>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/account">
        تسجيل الدخول
      </Link>
    </section>
  );
}

async function loadAccount(): Promise<AccountData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return {
      ok: false,
      message: "سجل الدخول أولاً حتى نعرض بيانات حسابك.",
    };
  }

  try {
    return {
      ok: true,
      user: await getMe(token),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : "تعذر تحميل الحساب.",
    };
  }
}

function formatRole(role: Awaited<ReturnType<typeof getMe>>["role"]) {
  if (role === "ADMIN") {
    return "مدير";
  }

  if (role === "VENDOR") {
    return "تاجر";
  }

  return "عميل";
}

function formatCountry(country: string) {
  return getCountryLabel(country);
}
