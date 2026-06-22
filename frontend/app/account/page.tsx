import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getMe } from "@/lib/api";
import { getCountryLabel } from "@/lib/location-data";
import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";
import { AccountAvatar } from "./AccountAvatar";
import { EditableName } from "./EditableName";

type AccountData =
  | { ok: true; user: Awaited<ReturnType<typeof getMe>> }
  | { ok: false; message: string };

export default async function AccountPage() {
  const t = await getT();
  const data = await loadAccount(t);

  return (
    <>
      <PublicHeader />
      <main className="app-container min-h-screen pt-8">
        <section className="mx-auto max-w-3xl">
          <div className="mb-8 text-start">
            <p className="chip px-4 py-2 text-sm">{t.myAccount}</p>
            <h1 className="section-title mt-4 text-4xl">{t.accountSettingsTitle}</h1>
          </div>

          {data.ok ? <AccountDetails user={data.user} t={t} /> : <Unavailable message={data.message} t={t} />}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

type T = Awaited<ReturnType<typeof getT>>;

function AccountDetails({ user, t }: { user: Awaited<ReturnType<typeof getMe>>; t: T }) {
  const hasAddress = Boolean(
    user.country || user.phoneNumber || user.region || user.city ||
    user.district || user.street || user.buildingNumber || user.postalCode || user.nationalAddress
  );

  return (
    <section className="panel p-6 text-start">
      <div className="flex min-w-0 items-center gap-4 border-b border-outline-variant/20 pb-6">
        <AccountAvatar user={user} />
        <span className="hidden h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary-container text-2xl font-black text-on-primary-container">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={user.name} className="h-full w-full object-cover" src={user.avatarUrl} />
          ) : (
            user.name.trim()[0] ?? "ن"
          )}
        </span>
        <div className="min-w-0 flex-1">
          <EditableName user={user} />
          <p className="mt-1 text-on-surface-variant">{formatRole(user.role, t)}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4">
        <Info label={t.emailInfo} value={user.email} />
        <Info label={t.accountType} value={formatRole(user.role, t)} />
        <Info label={t.accountNumber} value={user.id.slice(0, 8)} />
      </dl>

      <div className="mt-8 rounded-xl bg-surface-container-low p-5">
        <div className="flex flex-col gap-3 border-b border-outline-variant/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-on-surface">{t.shippingAddressSection}</h3>
            <p className="mt-1 text-sm leading-7 text-on-surface-variant">{t.editAddressInAccount}</p>
          </div>
          <Link className="secondary-button px-5 py-3" href="/account/address">
            {t.editAddressLink}
          </Link>
        </div>

        {hasAddress ? (
          <dl className="mt-5 grid gap-3 md:grid-cols-2">
            {user.country ? <Info label={t.countryLabel} value={formatCountry(user.country)} /> : null}
            {user.phoneNumber ? <Info label={t.mobileNumber} value={user.phoneNumber} /> : null}
            {user.region ? <Info label={t.regionLabel} value={user.region} /> : null}
            {user.city ? <Info label={t.cityLabel} value={user.city} /> : null}
            {user.district ? <Info label={t.districtLabel} value={user.district} /> : null}
            {user.street ? <Info label={t.streetLabel} value={user.street} /> : null}
            {user.buildingNumber ? <Info label={t.buildingNumber} value={user.buildingNumber} /> : null}
            {user.postalCode ? <Info label={t.postalCode} value={user.postalCode} /> : null}
            {user.country === "SA" && user.nationalAddress ? <Info label={t.nationalAddress} value={user.nationalAddress} /> : null}
          </dl>
        ) : (
          <p className="mt-5 rounded-xl bg-surface-container-lowest p-4 text-sm font-bold text-on-surface-variant">{t.noAddressYet}</p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {user.role !== "BUYER" ? (
          <Link className="primary-button px-6 py-3" href="/dashboard">
            {t.goToDashboard}
          </Link>
        ) : null}
        <Link className="secondary-button px-6 py-3" href="/orders">
          {t.goToOrders}
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

function Unavailable({ message, t }: { message: string; t: T }) {
  return (
    <section className="panel p-8 text-center">
      <h2 className="text-2xl font-black text-primary">{t.loginRequiredAccount}</h2>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <Link className="primary-button mt-6 px-6 py-3" href="/login?next=/account">
        {t.loginBtn}
      </Link>
    </section>
  );
}

async function loadAccount(t: T): Promise<AccountData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  if (!token) {
    return { ok: false, message: t.loginFirstAccount };
  }

  try {
    return { ok: true, user: await getMe(token) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : t.failedToLoadAccount,
    };
  }
}

function formatRole(role: Awaited<ReturnType<typeof getMe>>["role"], t: T) {
  if (role === "ADMIN") return t.roleAdmin;
  if (role === "VENDOR") return t.roleVendor;
  return t.roleBuyer;
}

function formatCountry(country: string) {
  return getCountryLabel(country);
}
