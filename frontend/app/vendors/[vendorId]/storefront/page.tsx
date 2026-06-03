import Image from "next/image";
import Link from "next/link";
import { ApiError, Category, getProducts, getVendor, getVendorStorePages, getVendorTheme, Product, StorePage, VendorTheme } from "@/lib/api";
import { themeToStyle } from "@/lib/theme";
import { ProductCard } from "../../../components/ProductCard";
import { PublicFooter } from "../../../components/PublicFooter";
import { PublicHeader } from "../../../components/PublicHeader";

const fallbackStorefrontImage = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1800&q=85";

type StorefrontPageProps = {
  params: Promise<{ vendorId: string }>;
  searchParams?: Promise<{
    q?: string;
    category?: string;
    filter?: string;
    page?: string;
  }>;
};

type StorefrontData =
  | {
      ok: true;
      vendor: Awaited<ReturnType<typeof getVendor>>;
      theme: VendorTheme;
      products: Product[];
      categories: Category[];
      storePages: StorePage[];
      total: number;
      totalPages: number;
      page: number;
      query: string;
      category?: string;
      filter?: "discounts" | "recent";
    }
  | {
      ok: false;
      message: string;
    };

export default async function VendorStorefrontPage({ params, searchParams }: StorefrontPageProps) {
  const { vendorId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = await loadStorefrontData(vendorId, {
    q: resolvedSearchParams.q?.trim() ?? "",
    category: resolvedSearchParams.category?.trim() || undefined,
    filter: parseFilter(resolvedSearchParams.filter),
    page: parsePositiveInteger(resolvedSearchParams.page, 1),
  });

  if (!data.ok) {
    return <Unavailable message={data.message} />;
  }

  return <Storefront data={data} />;
}

function Storefront({ data }: { data: Extract<StorefrontData, { ok: true }> }) {
  const profileHref = data.vendor.storeUsername ? `/${data.vendor.storeUsername}` : `/vendors/${data.vendor.id}`;
  const storefrontHref = `${profileHref}/storefront`;
  const storefrontImage = data.theme.storefrontImageUrl || data.theme.bannerUrl || data.products[0]?.imageUrl || data.products[0]?.images?.[0]?.url || fallbackStorefrontImage;
  const storefrontTitle = data.theme.storefrontTitle?.trim() || `واجهة متجر ${data.vendor.name}`;
  const storefrontDescription = data.theme.storefrontDescription?.trim() || "اكتشف منتجات المتجر واختر ما يناسبك من التصنيفات المتاحة.";

  return (
    <div className="min-h-screen text-on-surface" dir="rtl" style={{ ...themeToStyle(data.theme), backgroundColor: "var(--color-background)" }}>
      <PublicHeader active="store" storeHref={storefrontHref} profileHref={profileHref} vendorId={data.vendor.id} storeLogoUrl={data.theme.logoUrl} />

      <main className="min-h-screen pb-20">
        <section className="app-container pt-8">
          <div className="grid gap-6 rounded-[24px] bg-surface-container-lowest p-4 shadow-sm md:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] md:items-center md:p-6">
            <div className="relative h-48 overflow-hidden rounded-[20px] bg-surface-container md:h-64">
              <Image className="object-cover" alt={`واجهة متجر ${data.vendor.name}`} src={storefrontImage} fill priority sizes="(min-width: 1280px) 540px, 94vw" unoptimized />
            </div>
            <div className="grid gap-4 text-right">
              <Link className="w-fit rounded-full bg-primary-container px-4 py-2 text-sm font-black text-on-primary-container" href={profileHref}>
                بروفايل المتجر
              </Link>
              <h1 className="text-3xl font-black leading-snug text-on-surface md:text-5xl">{storefrontTitle}</h1>
              <p className="max-w-2xl text-base leading-8 text-on-surface-variant md:text-lg">
                {storefrontDescription}
              </p>
            </div>
          </div>
        </section>

        <section className="app-container mt-8">
          <form action={storefrontHref} className="grid gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm md:grid-cols-[1fr_auto]">
            <input
              className="h-14 min-w-0 rounded-xl border border-outline-variant/40 bg-white px-5 text-right font-bold text-on-surface outline-none focus:border-primary"
              defaultValue={data.query}
              name="q"
              placeholder="ابحث في منتجات المتجر..."
              type="search"
            />
            {data.category ? <input name="category" type="hidden" value={data.category} /> : null}
            {data.filter ? <input name="filter" type="hidden" value={data.filter} /> : null}
            <button className="primary-button h-14 px-8" type="submit">
              بحث
            </button>
          </form>
        </section>

        <section className="app-container mt-8 grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5 text-right shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-on-surface">التصنيفات</h2>
              <Link className="text-sm font-black text-primary hover:underline" href={storefrontHref}>
                الكل
              </Link>
            </div>
            <nav className="mt-5 grid gap-2">
              <CategoryLink active={!data.category && !data.filter} href={buildStorefrontHref(storefrontHref, data.query, undefined, undefined, 1)} label="جميع المنتجات" />
              <CategoryLink active={data.filter === "discounts"} href={buildStorefrontHref(storefrontHref, data.query, undefined, "discounts", 1)} label="التخفيضات" />
              <CategoryLink active={data.filter === "recent"} href={buildStorefrontHref(storefrontHref, data.query, undefined, "recent", 1)} label="مضاف حديثاً" />
              {data.categories.map((category) => (
                <CategoryLink
                  key={category.id}
                  active={data.category === category.slug || data.category === category.id}
                  href={buildStorefrontHref(storefrontHref, data.query, category.slug || category.id, undefined, 1)}
                  label={`${category.name}${category._count?.products ? ` (${category._count.products})` : ""}`}
                />
              ))}
            </nav>
          </aside>

          <div id="products">
            <div className="flex flex-col gap-3 text-right sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black text-primary">{data.total} منتج متاح</p>
                <h2 className="mt-1 text-3xl font-black text-on-surface">كل منتجات المتجر</h2>
              </div>
              <Link className="secondary-button px-6 py-3" href={storefrontHref}>
                إظهار جميع المنتجات
              </Link>
            </div>

            {data.products.length > 0 ? (
              <>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
                  {data.products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} fallbackImage={storefrontImage} />
                  ))}
                </div>
                <Pagination storefrontHref={storefrontHref} page={data.page} totalPages={data.totalPages} query={data.query} category={data.category} filter={data.filter} />
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-10 text-center font-bold text-on-surface-variant">
                لا توجد منتجات مطابقة داخل هذا المتجر.
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter storePages={data.storePages} theme={data.theme} />
    </div>
  );
}

function CategoryLink({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      className={`rounded-xl px-4 py-3 font-bold transition ${
        active ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-primary-container/35 hover:text-primary"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}

function Pagination({ storefrontHref, page, totalPages, query, category, filter }: { storefrontHref: string; page: number; totalPages: number; query: string; category?: string; filter?: "discounts" | "recent" }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-3" aria-label="صفحات منتجات واجهة المتجر">
      <Link className={`secondary-button px-5 py-3 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`} href={buildStorefrontHref(storefrontHref, query, category, filter, Math.max(1, page - 1))}>
        السابق
      </Link>
      <span className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-5 py-3 font-bold text-on-surface">
        صفحة {page} من {totalPages}
      </span>
      <Link className={`secondary-button px-5 py-3 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`} href={buildStorefrontHref(storefrontHref, query, category, filter, Math.min(totalPages, page + 1))}>
        التالي
      </Link>
    </nav>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-background px-6 pt-16 text-on-surface" dir="rtl">
        <section className="mx-auto max-w-2xl rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-primary">تعذر فتح واجهة المتجر</h1>
          <p className="mt-3 leading-8 text-on-surface-variant">{message}</p>
          <Link className="primary-button mt-6 px-6 py-3" href="/">
            العودة للرئيسية
          </Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

async function loadStorefrontData(vendorId: string, input: { q: string; category?: string; filter?: "discounts" | "recent"; page: number }): Promise<StorefrontData> {
  try {
    const [vendor, theme, products, categorySource, storePages] = await Promise.all([
      getVendor(vendorId),
      getVendorTheme(vendorId),
      getProducts({
        vendorId,
        q: input.q || undefined,
        category: input.category,
        filter: input.filter,
        page: input.page,
        limit: 12,
        sort: "latest",
      }),
      getProducts({
        vendorId,
        limit: 100,
        sort: "latest",
      }),
      getVendorStorePages(vendorId),
    ]);

    return {
      ok: true,
      vendor,
      theme,
      products: products.data,
      categories: collectCategories(categorySource.data),
      storePages,
      total: products.meta.total,
      totalPages: products.meta.totalPages,
      page: products.meta.page,
      query: input.q,
      category: input.category,
      filter: input.filter,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : "حدث خطأ أثناء تحميل واجهة المتجر.",
    };
  }
}

function collectCategories(products: Product[]) {
  const categories = new Map<string, Category>();

  products.forEach((product) => {
    if (product.category) {
      const current = categories.get(product.category.id);
      categories.set(product.category.id, {
        ...product.category,
        _count: {
          products: (current?._count?.products ?? 0) + 1,
        },
      });
    }
  });

  return Array.from(categories.values()).sort((first, second) => first.name.localeCompare(second.name, "ar"));
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function parseFilter(value?: string): "discounts" | "recent" | undefined {
  return value === "discounts" || value === "recent" ? value : undefined;
}

function buildStorefrontHref(storefrontHref: string, query: string, category?: string, filter?: "discounts" | "recent", page = 1) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category) {
    params.set("category", category);
  }

  if (filter) {
    params.set("filter", filter);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${storefrontHref}?${queryString}#products` : `${storefrontHref}#products`;
}
