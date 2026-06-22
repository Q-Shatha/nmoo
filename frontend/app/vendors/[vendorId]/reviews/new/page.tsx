import { cookies } from "next/headers";
import Link from "next/link";
import { ApiError, getMe, getReviewableProducts, getVendor, getVendorStorePages, getVendorTheme, ReviewableProduct, StorePage, VendorTheme } from "@/lib/api";
import { themeToStyle } from "@/lib/theme";
import { getT } from "@/lib/i18n/server";
import { PublicFooter } from "../../../../components/PublicFooter";
import { PublicHeader } from "../../../../components/PublicHeader";
import { ReviewForm } from "./ReviewForm";

type ReviewPageProps = {
  params: Promise<{ vendorId: string }>;
};

type T = Awaited<ReturnType<typeof getT>>;

type ReviewPageData =
  | {
      ok: true;
      vendor: Awaited<ReturnType<typeof getVendor>>;
      theme: VendorTheme;
      storePages: StorePage[];
      products: ReviewableProduct[];
      token: string;
    }
  | {
      ok: false;
      vendorId: string;
      message: string;
      needsLogin: boolean;
      profileHref?: string;
      storeHref?: string;
      theme?: VendorTheme | null;
      storePages?: StorePage[];
    };

export default async function NewVendorReviewPage({ params }: ReviewPageProps) {
  const { vendorId } = await params;
  const t = await getT();
  const data = await loadReviewPageData(vendorId, t);
  const profileHref = data.ok ? (data.vendor.storeUsername ? `/${data.vendor.storeUsername}` : `/vendors/${data.vendor.id}`) : data.profileHref ?? `/vendors/${vendorId}`;
  const storeHref = data.ok ? `${profileHref}/storefront` : data.storeHref ?? `${profileHref}/storefront`;
  const theme = data.ok ? data.theme : data.theme;
  const storeName = theme?.storeName?.trim() || (data.ok ? data.vendor.name : null);

  return (
    <div className="min-h-screen text-on-surface" style={theme ? { ...themeToStyle(theme), backgroundColor: "var(--color-background)" } : undefined}>
      <PublicHeader active="store" storeHref={storeHref} profileHref={profileHref} vendorId={vendorId} storeLogoUrl={theme?.logoUrl} storeName={storeName} />
      <main className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        {data.ok ? (
          <ReviewForm products={data.products} profileHref={profileHref} />
        ) : (
          <Unavailable message={data.message} needsLogin={data.needsLogin} profileHref={profileHref} t={t} />
        )}
      </main>
      <PublicFooter storePages={data.ok ? data.storePages : data.storePages} theme={theme} />
    </div>
  );
}

async function loadReviewPageData(vendorId: string, t: T): Promise<ReviewPageData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nmoo_access_token")?.value;

  try {
    const [vendor, theme, storePages] = await Promise.all([
      getVendor(vendorId),
      getVendorTheme(vendorId),
      getVendorStorePages(vendorId),
    ]);
    const profileHref = vendor.storeUsername ? `/${vendor.storeUsername}` : `/vendors/${vendor.id}`;

    if (!token) {
      return {
        ok: false,
        vendorId,
        needsLogin: true,
        message: t.reviewLoginMessage,
        profileHref,
        storeHref: `${profileHref}/storefront`,
        theme,
        storePages,
      };
    }

    const user = await getMe(token);

    if (user.role !== "BUYER" && user.role !== "ADMIN") {
      return {
        ok: false,
        vendorId,
        needsLogin: false,
        message: t.reviewBuyerOnlyMessage,
        profileHref,
        storeHref: `${profileHref}/storefront`,
        theme,
        storePages,
      };
    }

    const products = await getReviewableProducts(vendorId, token);

    return {
      ok: true,
      vendor,
      theme,
      storePages,
      products,
      token,
    };
  } catch (error) {
    return {
      ok: false,
      vendorId,
      needsLogin: error instanceof ApiError && error.status === 401,
      message: error instanceof ApiError ? error.message : t.reviewPageError,
    };
  }
}

function Unavailable({ message, needsLogin, profileHref, t }: { message: string; needsLogin: boolean; profileHref: string; t: T }) {
  return (
    <section className="panel mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-2xl font-black text-primary">{needsLogin ? t.reviewLoginRequired : t.reviewNotAllowed}</h1>
      <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {needsLogin ? (
          <Link className="primary-button px-6 py-3" href={`/login?next=${encodeURIComponent(`${profileHref}/reviews/new`)}`}>
            {t.reviewPageLoginBtn}
          </Link>
        ) : null}
        <Link className="secondary-button px-6 py-3" href={profileHref}>
          {t.reviewPageBackBtn}
        </Link>
      </div>
    </section>
  );
}
