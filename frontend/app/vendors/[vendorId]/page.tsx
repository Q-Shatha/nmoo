import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ApiError, ApiUser, getMe, getProducts, getVendor, getVendorReviews, getVendorShippingCoverage, getVendorStorePages, getVendorTheme, Product, Review, StorePage, VendorTheme } from "@/lib/api";
import { getStoreTemplate } from "@/lib/store-templates";
import { themeToStyle } from "@/lib/theme";
import { getLocale, getT } from "@/lib/i18n/server";
import { ProductCard } from "../../components/ProductCard";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";
import { ReviewsCarousel } from "./ReviewsCarousel";

const fallbackHeroImage = "/banner-default.jpg";

type VendorPageProps = {
  params: Promise<{ vendorId: string }>;
  searchParams?: Promise<{ q?: string }>;
};

type VendorPageData =
  | {
      ok: true;
      vendor: ApiUser;
      theme: VendorTheme;
      products: Product[];
      reviews: Review[];
      storePages: StorePage[];
      total: number;
      query: string;
      coverage: StoreCoverage;
    }
  | { ok: false; message: string };

type StoreCoverage = {
  checked: boolean;
  supported: boolean;
  needsAddress: boolean;
};

type T = Awaited<ReturnType<typeof getT>>;

export default async function VendorPage({ params, searchParams }: VendorPageProps) {
  const { vendorId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const data = await loadVendorPage(vendorId, resolvedSearchParams.q?.trim() ?? "", t);

  if (!data.ok) {
    return <Unavailable message={data.message} t={t} />;
  }

  return <VendorProfile data={data} t={t} locale={locale} />;
}

function VendorProfile({ data, t, locale }: { data: Extract<VendorPageData, { ok: true }>; t: T; locale: string }) {
  const isAr = locale === "ar";
  const isEn = locale === "en";
  const storefrontImage = data.theme.storefrontImageUrl || data.products[0]?.imageUrl || data.products[0]?.images?.[0]?.url || fallbackHeroImage;
  const heroImage = data.theme.bannerUrl || storefrontImage;
  const logoImage = data.theme.logoUrl || "/nmoo-logo.png";
  const storeName = (isEn
    ? (data.theme.storeNameEn?.trim() || data.theme.storeName?.trim())
    : isAr
    ? (data.theme.storeNameAr?.trim() || data.theme.storeName?.trim())
    : data.theme.storeName?.trim()) || data.vendor.name;
  const returnPolicy = findPage(data.storePages, ["return", "استرجاع", "سياسة"]);
  const rating = data.reviews.length > 0 ? averageRating(data.reviews) : data.total > 20 ? "4.9" : "4.8";
  const profileHref = data.vendor.storeUsername ? `/${data.vendor.storeUsername}` : `/vendors/${data.vendor.id}`;
  const storefrontHref = `${profileHref}/storefront`;
  const template = getStoreTemplate(data.theme.templateId);

  return (
    <div className={`min-h-screen text-on-surface ${template.className}`} style={{ ...themeToStyle(data.theme), backgroundColor: "var(--color-background)" }}>
      <PublicHeader active="store" storeHref={storefrontHref} profileHref={profileHref} vendorId={data.vendor.id} storeLogoUrl={data.theme.logoUrl} storeName={storeName} />

      <main className="min-h-screen text-on-surface" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <section className="store-profile-hero relative">
            <div className="store-profile-banner relative h-[230px] overflow-hidden rounded-[28px] bg-surface-container shadow-sm md:h-[310px]">
              <Image className="scale-105 object-cover blur-[3px]" alt={storeName} src={heroImage} fill priority sizes="(min-width: 1180px) 1180px, 94vw" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-white/8 to-white/5" />
            </div>

            <div className="store-profile-header relative z-10 -mt-12 grid gap-6 px-4 md:grid-cols-[1fr_auto] md:items-end md:px-8">
              <div className="order-2 text-start md:order-1">
                <div className="store-profile-actions mb-4 flex flex-wrap gap-3">
                  <Link className="rounded-xl bg-primary px-8 py-3 text-sm font-black text-on-primary shadow-sm transition hover:bg-primary/90" href={storefrontHref}>
                    {t.shopNow}
                  </Link>
                  {returnPolicy ? (
                    <Link className="rounded-xl bg-primary-container px-8 py-3 text-sm font-black text-on-primary-container transition hover:bg-primary-container/85" href={`/store-pages/${returnPolicy.id}`}>
                      {t.storePolicy}
                    </Link>
                  ) : null}
                </div>
                <h1 className="text-2xl font-black text-on-surface md:text-3xl">{storeName}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
                  {t.storeDesc}
                </p>
              </div>

              <div className="store-profile-logo order-1 justify-self-end md:order-2">
                <div className="store-profile-logo-frame flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[10px] border-surface-container-lowest bg-surface-container-lowest shadow-xl md:h-36 md:w-36">
                  <Image className="h-full w-full object-cover" alt={`${t.brandLogoLabel} ${storeName}`} src={logoImage} width={144} height={144} unoptimized />
                </div>
              </div>
            </div>
          </section>

          <section className="store-profile-stats mt-14 grid gap-5 md:grid-cols-3">
            <StatCard icon={<CalendarIcon />} label={t.joinDate} value={formatMonthYear(data.vendor.createdAt, t.numberLocale)} />
            <StatCard icon={<StarIcon />} label={t.overallRating} value={`${rating} / 5.0`} />
            <StatCard icon={<BoxIcon />} label={t.totalProductsLabel} value={String(data.total)} />
          </section>

          <section id="products" className="store-profile-products mt-16">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <form action={profileHref} className="order-2 lg:order-1 lg:w-[390px]">
                <label className="relative block">
                  <span className="sr-only">{t.searchProducts}</span>
                  <input className="h-14 w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-5 text-start text-sm text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-container/35" defaultValue={data.query} name="q" placeholder={t.searchProducts} type="search" />
                </label>
              </form>

              <div className="order-1 flex justify-start lg:order-2">
                <Link className="rounded-full bg-surface-container px-7 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-on-primary" href={storefrontHref}>
                  {t.showAllProducts}
                </Link>
              </div>
            </div>

            {data.products.length > 0 ? (
              <>
                <div className="store-profile-products-grid mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                  {data.products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} fallbackImage={storefrontImage} />
                  ))}
                </div>
                {data.total > data.products.length ? (
                  <div className="mt-10 flex justify-center">
                    <Link className="primary-button px-9 py-4" href={storefrontHref}>
                      {t.showMore}
                    </Link>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-8 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest p-10 text-center font-bold text-on-surface-variant shadow-sm">
                {t.noActiveProducts}
              </div>
            )}
          </section>

          <ReviewsSection profileHref={profileHref} reviews={data.reviews} storeName={storeName} t={t} />
        </div>
      </main>

      <PublicFooter storePages={data.storePages} theme={data.theme} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="grid min-h-32 grid-cols-[auto_1fr] items-center gap-5 rounded-2xl bg-surface-container-low px-8 py-6 text-start">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm">{icon}</span>
      <div>
        <p className="text-sm text-on-surface-variant">{label}</p>
        <p className="mt-1 text-lg font-black text-on-surface">{value}</p>
      </div>
    </article>
  );
}

function LocationUnsupportedNotice({ coverage, t }: { coverage: StoreCoverage; t: T }) {
  if (!coverage.checked || coverage.supported) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-error/25 bg-error-container/35 px-5 py-4 text-start text-sm font-bold leading-7 text-error">
      {coverage.needsAddress ? t.locationNeedsAddress : t.locationUnsupported}
    </div>
  );
}

// Suppress "unused variable" - LocationUnsupportedNotice is defined but may be used in future
void LocationUnsupportedNotice;

function ReviewsSection({ profileHref, reviews, storeName, t }: { profileHref: string; reviews: Review[]; storeName: string; t: T }) {
  const hasReviews = reviews.length > 0;

  return (
    <section id="reviews" className="mt-20 rounded-[28px] border border-outline-variant/25 bg-surface-container-lowest px-5 py-10 shadow-sm md:px-16 md:py-14">
      <div className="flex justify-start text-start">
        <Link className="hidden" href={`${profileHref}/reviews/new`}>
          {t.writeReview}
        </Link>
        <div className="text-start [&>p]:hidden">
          <h2 className="text-2xl font-black text-on-surface">{t.customerReviewsSection}</h2>
          <p className="mt-2 text-on-surface-variant">{t.customerReviewsDesc(storeName)}</p>
        </div>
      </div>

      {hasReviews ? (
        <ReviewsCarousel fallbackContext={storeName} fallbackReviews={[]} reviews={reviews} />
      ) : (
        <div className="mt-10 flex flex-col items-center gap-3 py-10 text-center text-on-surface-variant">
          <span className="text-4xl">💬</span>
          <p className="font-bold text-on-surface">{t.noReviewsYet ?? "لا توجد تقييمات بعد"}</p>
          <p className="text-sm">{t.beFirstToReview ?? "كن أول من يكتب تقييماً لهذا المتجر"}</p>
        </div>
      )}

      <div className="mt-8 flex justify-start">
        <Link className="primary-button px-7 py-3" href={`${profileHref}/reviews/new`}>
          {t.writeReview}
        </Link>
      </div>
    </section>
  );
}

function ReviewCard({ avatarUrl, city, initials, name, productTitle, rating, text }: { avatarUrl?: string | null; city: string; initials: string; name: string; productTitle?: string; rating: number; text: string }) {
  return (
    <article className="w-[330px] shrink-0 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest p-7 text-start shadow-sm sm:w-[390px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-sm font-black text-on-primary-container">
            {avatarUrl ? <Image alt={name} className="object-cover" src={avatarUrl} fill sizes="48px" unoptimized /> : initials}
          </div>
          <div>
            <h3 className="font-black text-on-surface">{name}</h3>
            <p className="text-sm text-on-surface-variant">{productTitle ? `${city} · ${productTitle}` : city}</p>
          </div>
        </div>
        <span className="text-primary">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
      </div>
      <p className="mt-5 leading-8 text-on-surface-variant">"{text}"</p>
    </article>
  );
}

function Unavailable({ message, t }: { message: string; t: T }) {
  return (
    <>
      <PublicHeader active="store" />
      <main className="min-h-screen bg-background px-6 pt-16 text-on-surface">
        <section className="mx-auto max-w-2xl rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-primary">{t.vendorOpenError}</h1>
          <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
          <Link className="primary-button mt-6 px-6 py-3" href="/">
            {t.backToStore}
          </Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

async function loadVendorPage(vendorId: string, query: string, t: T): Promise<VendorPageData> {
  try {
    const [vendor, theme, products, reviews, storePages, coverage] = await Promise.all([
      getVendor(vendorId),
      getVendorTheme(vendorId),
      getProducts({ vendorId, q: query || undefined, page: 1, limit: 8, sort: "latest" }),
      getVendorReviews(vendorId),
      getVendorStorePages(vendorId),
      getCurrentUserCoverage(vendorId),
    ]);

    return {
      ok: true,
      vendor,
      theme,
      products: products.data,
      reviews,
      storePages,
      total: products.meta.total,
      query,
      coverage,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : t.vendorPageError,
    };
  }
}

async function getCurrentUserCoverage(vendorId: string): Promise<StoreCoverage> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("nmoo_access_token")?.value;

    if (!token) {
      return { checked: false, supported: true, needsAddress: false };
    }

    const user = await getMe(token);
    const country = user.country?.trim();
    const region = user.region?.trim();
    const city = user.city?.trim();

    if (!country || !region || !city) {
      return { checked: true, supported: false, needsAddress: true };
    }

    const coverage = await getVendorShippingCoverage(vendorId, { country, region, city });

    return { checked: true, supported: coverage.supported, needsAddress: false };
  } catch {
    return { checked: false, supported: true, needsAddress: false };
  }
}


function findPage(pages: StorePage[], keywords: string[]) {
  return pages.find((page) => {
    const text = `${page.slug} ${page.title}`.toLowerCase();
    return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  });
}

function averageRating(reviews: Review[]) {
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return average.toFixed(1);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "ع") + (parts[1]?.[0] ?? "");
}

function formatMonthYear(value?: string, locale = "ar-SA") {
  if (!value) {
    return "2026";
  }

  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(value));
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <rect width="18" height="18" x="3" y="4" rx="3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 2.5 2.9 6 6.6 1-4.8 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.8-4.6 6.6-1z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m21 8-9-5-9 5 9 5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}
