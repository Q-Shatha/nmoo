import Image from "next/image";
import Link from "next/link";
import { ApiError, ApiUser, getProducts, getVendor, getVendorReviews, getVendorStorePages, getVendorTheme, Product, Review, StorePage, VendorTheme } from "@/lib/api";
import { themeToStyle } from "@/lib/theme";
import { ProductCard } from "../../components/ProductCard";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";
import { ReviewsCarousel } from "./ReviewsCarousel";

const fallbackHeroImage = "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1800&q=85";

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
    }
  | { ok: false; message: string };

export default async function VendorPage({ params, searchParams }: VendorPageProps) {
  const { vendorId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = await loadVendorPage(vendorId, resolvedSearchParams.q?.trim() ?? "");

  if (!data.ok) {
    return <Unavailable message={data.message} />;
  }

  return <VendorProfile data={data} />;
}

function VendorProfile({ data }: { data: Extract<VendorPageData, { ok: true }> }) {
  const storefrontImage = data.theme.storefrontImageUrl || data.products[0]?.imageUrl || data.products[0]?.images?.[0]?.url || fallbackHeroImage;
  const heroImage = data.theme.bannerUrl || storefrontImage;
  const logoImage = data.theme.logoUrl || "/nmoo-logo.png";
  const returnPolicy = findPage(data.storePages, ["return", "استرجاع", "سياسة"]);
  const rating = data.reviews.length > 0 ? averageRating(data.reviews) : data.total > 20 ? "4.9" : "4.8";
  const profileHref = data.vendor.storeUsername ? `/${data.vendor.storeUsername}` : `/vendors/${data.vendor.id}`;
  const storefrontHref = `${profileHref}/storefront`;

  return (
    <div className="min-h-screen text-on-surface" dir="rtl" style={{ ...themeToStyle(data.theme), backgroundColor: "var(--color-background)" }}>
      <PublicHeader active="store" storeHref={storefrontHref} profileHref={profileHref} vendorId={data.vendor.id} storeLogoUrl={data.theme.logoUrl} />

      <main className="min-h-screen text-on-surface" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <section className="relative">
            <div className="relative h-[230px] overflow-hidden rounded-[28px] bg-surface-container shadow-sm md:h-[310px]">
              <Image className="scale-105 object-cover blur-[3px]" alt={data.vendor.name} src={heroImage} fill priority sizes="(min-width: 1180px) 1180px, 94vw" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-white/8 to-white/5" />
            </div>

            <div className="relative z-10 -mt-12 grid gap-6 px-4 md:grid-cols-[1fr_auto] md:items-end md:px-8">
              <div className="order-2 text-right md:order-1">
                <div className="mb-4 flex flex-wrap gap-3">
                  <Link className="rounded-xl bg-primary px-8 py-3 text-sm font-black text-on-primary shadow-sm transition hover:bg-primary/90" href={storefrontHref}>
                    تسوق
                  </Link>
                  {returnPolicy ? (
                    <Link className="rounded-xl bg-primary-container px-8 py-3 text-sm font-black text-on-primary-container transition hover:bg-primary-container/85" href={`/store-pages/${returnPolicy.id}`}>
                      سياسة المتجر
                    </Link>
                  ) : null}
                </div>
                <h1 className="text-2xl font-black text-on-surface md:text-3xl">متجر {data.vendor.name}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
                  نقدم لك تجربة تسوق مختارة بعناية تجمع بين جودة المنتجات، سهولة الطلب، وخيارات متجر واضحة تساعدك على الشراء بثقة.
                </p>
              </div>

              <div className="order-1 justify-self-end md:order-2">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[10px] border-surface-container-lowest bg-surface-container-lowest shadow-xl md:h-36 md:w-36">
                  <Image className="h-full w-full object-cover" alt={`شعار ${data.vendor.name}`} src={logoImage} width={144} height={144} unoptimized />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14 grid gap-5 md:grid-cols-3">
            <StatCard icon={<CalendarIcon />} label="تاريخ الانضمام" value={formatMonthYear(data.vendor.createdAt)} />
            <StatCard icon={<StarIcon />} label="التقييم العام" value={`${rating} / 5.0`} />
            <StatCard icon={<BoxIcon />} label="إجمالي المنتجات" value={String(data.total)} />
          </section>

          <section id="products" className="mt-16">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <form action={profileHref} className="order-2 lg:order-1 lg:w-[390px]">
                <label className="relative block">
                  <span className="sr-only">البحث في منتجات المتجر</span>
                  <input className="h-14 w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-5 text-right text-sm text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-container/35" defaultValue={data.query} name="q" placeholder="البحث في منتجات المتجر..." type="search" />
                </label>
              </form>

              <div className="order-1 flex justify-start lg:order-2">
                <Link className="rounded-full bg-surface-container px-7 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-on-primary" href={storefrontHref}>
                  إظهار جميع المنتجات
                </Link>
              </div>
            </div>

            {data.products.length > 0 ? (
              <>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {data.products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} fallbackImage={storefrontImage} />
                  ))}
                </div>
                {data.total > data.products.length ? (
                  <div className="mt-10 flex justify-center">
                    <Link className="primary-button px-9 py-4" href={storefrontHref}>
                      عرض المزيد
                    </Link>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-8 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest p-10 text-center font-bold text-on-surface-variant shadow-sm">
                لا توجد منتجات نشطة لهذا التاجر حالياً.
              </div>
            )}
          </section>

          <ReviewsSection profileHref={profileHref} reviews={data.reviews} vendor={data.vendor} />
        </div>
      </main>

      <PublicFooter storePages={data.storePages} theme={data.theme} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="grid min-h-32 grid-cols-[auto_1fr] items-center gap-5 rounded-2xl bg-surface-container-low px-8 py-6 text-right">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm">{icon}</span>
      <div>
        <p className="text-sm text-on-surface-variant">{label}</p>
        <p className="mt-1 text-lg font-black text-on-surface">{value}</p>
      </div>
    </article>
  );
}

function ReviewsSection({ profileHref, reviews, vendor }: { profileHref: string; reviews: Review[]; vendor: ApiUser }) {
  const visibleReviews = reviews.length > 0 ? reviews : fallbackReviews;
  const carouselReviews = [...visibleReviews, ...visibleReviews];

  return (
    <section id="reviews" className="mt-20 rounded-[28px] border border-outline-variant/25 bg-surface-container-lowest px-5 py-10 shadow-sm md:px-16 md:py-14">
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <Link className="secondary-button order-2 px-7 py-3 text-primary md:order-1" href={`${profileHref}/reviews/new`}>
          كتابة مراجعة
        </Link>
        <div className="order-1 text-right md:order-2">
          <h2 className="text-2xl font-black text-on-surface">آراء العملاء</h2>
          <p className="mt-2 text-on-surface-variant">ماذا يقول المتسوقون عن تجربتهم مع متجر {vendor.name}</p>
        </div>
      </div>

      <ReviewsCarousel fallbackReviews={fallbackReviews} reviews={visibleReviews} vendor={vendor} />

      <div className="hidden">
        <div className="review-marquee-track flex w-max gap-6">
        {carouselReviews.map((review, index) => (
          <ReviewCard
            key={`${review.id}-${index}`}
            city={review.user?.city ?? "عميل نمو"}
            avatarUrl={review.user?.avatarUrl}
            initials={getInitials(review.user?.name ?? "عميل")}
            name={review.user?.name ?? "عميل"}
            productTitle={review.product?.title}
            rating={review.rating}
            text={review.comment || "تجربة موفقة مع المتجر."}
          />
        ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ avatarUrl, city, initials, name, productTitle, rating, text }: { avatarUrl?: string | null; city: string; initials: string; name: string; productTitle?: string; rating: number; text: string }) {
  return (
    <article className="w-[330px] shrink-0 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest p-7 text-right shadow-sm sm:w-[390px]">
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
      <p className="mt-5 leading-8 text-on-surface-variant">“{text}”</p>
    </article>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <>
      <PublicHeader active="store" />
      <main className="min-h-screen bg-background px-6 pt-16 text-on-surface" dir="rtl">
        <section className="mx-auto max-w-2xl rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-primary">تعذر فتح صفحة التاجر</h1>
          <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
          <Link className="primary-button mt-6 px-6 py-3" href="/">
            العودة للمتجر
          </Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

async function loadVendorPage(vendorId: string, query: string): Promise<VendorPageData> {
  try {
    const [vendor, theme, products, reviews, storePages] = await Promise.all([
      getVendor(vendorId),
      getVendorTheme(vendorId),
      getProducts({ vendorId, q: query || undefined, page: 1, limit: 8, sort: "latest" }),
      getVendorReviews(vendorId),
      getVendorStorePages(vendorId),
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
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : "حدث خطأ أثناء تحميل صفحة التاجر.",
    };
  }
}

const fallbackReviews: Review[] = [
  {
    id: "fallback-ahmad",
    productId: "fallback",
    userId: "fallback-ahmad",
    rating: 5,
    comment: "تجربة رائعة، وصلت المنتجات مغلفة بعناية والتواصل كان سريع من أول الطلب حتى استلام الشحنة.",
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    user: { id: "fallback-ahmad", name: "أحمد محمد", city: "الرياض" },
    product: { id: "fallback", title: "طلب من المتجر", vendorId: "fallback" },
  },
  {
    id: "fallback-sarah",
    productId: "fallback",
    userId: "fallback-sarah",
    rating: 5,
    comment: "أعجبتني التفاصيل وسهولة استخدام المتجر. تجربة موفقة وأكيد سأكرر الطلب.",
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    user: { id: "fallback-sarah", name: "سارة عبدالله", city: "جدة" },
    product: { id: "fallback", title: "طلب من المتجر", vendorId: "fallback" },
  },
];

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

function formatMonthYear(value?: string) {
  if (!value) {
    return "2026";
  }

  return new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric" }).format(new Date(value));
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
