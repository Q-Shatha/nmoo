import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ApiError, getProductById, getProductReviews, getProducts, getVendorTheme, Product, Review, VendorTheme } from "@/lib/api";
import { getStoreTemplate } from "@/lib/store-templates";
import { themeToStyle } from "@/lib/theme";
import { AddToCartWithQuantity } from "../../../../components/AddToCartWithQuantity";
import { ProductCard } from "../../../../components/ProductCard";
import { PublicFooter } from "../../../../components/PublicFooter";
import { PublicHeader } from "../../../../components/PublicHeader";
import { ReviewsCarousel } from "../../ReviewsCarousel";

const fallbackProductImage =
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80";

type StoreProductPageProps = {
  params: Promise<{
    vendorId: string;
    productId: string;
  }>;
};

export default async function StoreProductPage({ params }: StoreProductPageProps) {
  const { vendorId, productId } = await params;
  const product = await loadProduct(productId, vendorId);
  const relatedProducts = await loadRelatedProducts(product, vendorId);
  const reviews = await loadProductReviews(product.id);
  const theme = await loadProductTheme(product);
  const images = getProductImages(product);
  const hasDiscount = Boolean(product.hasDiscount && product.salePrice && Number(product.salePrice) < Number(product.price));
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const profileHref = product.vendor?.storeUsername ? `/${product.vendor.storeUsername}` : `/vendors/${vendorId}`;
  const storeHref = `${profileHref}/storefront`;
  const template = getStoreTemplate(theme?.templateId);

  return (
    <div className={`min-h-screen text-on-surface ${template.className}`} dir="rtl" style={theme ? { ...themeToStyle(theme), backgroundColor: "var(--color-background)" } : undefined}>
      <PublicHeader active="store" storeHref={storeHref} profileHref={profileHref} vendorId={product.vendorId} storeLogoUrl={theme?.logoUrl} />

      <main className="store-product-page app-container pt-8" style={theme ? { backgroundColor: "var(--color-background)" } : undefined}>
        <nav className="mb-8 flex flex-wrap gap-2 text-sm text-on-surface-variant">
          <Link className="muted-link" href={storeHref}>
            متجر {product.vendor?.name ?? "التاجر"}
          </Link>
          <span>/</span>
          <Link className="muted-link" href={`${storeHref}${product.category?.slug ? `?category=${product.category.slug}` : ""}#products`}>
            {product.category?.name ?? "المنتجات"}
          </Link>
          <span>/</span>
          <span className="text-on-surface">{product.title}</span>
        </nav>

        <section className={`store-product-detail store-product-detail-${template.id} grid grid-cols-1 gap-12 lg:grid-cols-2`}>
          <div className="store-product-info order-2 text-right lg:order-1">
            <span className="chip mb-4 px-4 py-2 text-sm">{product.category?.name ?? "منتج"}</span>
            <h1 className="section-title text-4xl md:text-5xl">{product.title}</h1>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <span className="rounded-full bg-secondary-container px-4 py-2 text-sm font-bold text-on-secondary-container">
                {product.stock > 0 ? `${product.stock} متوفر` : "غير متوفر"}
              </span>
              <span className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-bold text-on-surface-variant">
                {product.vendor?.name ?? "متجر نمو"}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-end gap-4">
              {hasDiscount ? <span className="text-xl font-bold text-on-surface-variant line-through">{formatPrice(product.price)}</span> : null}
              <span className="text-4xl font-black text-primary">{formatPrice(displayPrice)}</span>
            </div>

            <p className="section-copy mt-6 text-lg">
              {product.description || "منتج من متجر نمو بتفاصيل محدثة مباشرة من قاعدة البيانات."}
            </p>

            {product.options && product.options.length > 0 ? (
              <div className="store-product-options mt-8 grid gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-right" dir="rtl">
                <h2 className="text-xl font-black text-on-surface">اختر نوع المنتج</h2>
                {product.options.map((option) => (
                  <div key={option.id} className="grid gap-2">
                    <p className="font-bold text-on-surface">{option.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value, index) => (
                        <label key={`${option.id}-${value}`} className="cursor-pointer">
                          <input className="peer sr-only" defaultChecked={index === 0} name={`option-${option.id}`} type="radio" value={value} />
                          <span className="inline-flex min-h-10 items-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 font-bold text-on-surface-variant transition-colors peer-checked:border-primary peer-checked:bg-primary-container/35 peer-checked:text-primary">
                            {value}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="store-product-meta mt-8 grid gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
              <InfoRow label="الحالة" value={<StatusBadge status={product.status} />} />
              <InfoRow label="التصنيف" value={product.category?.name ?? "غير مصنف"} />
              <InfoRow
                label="التاجر"
                value={
                  <Link className="text-primary underline-offset-4 hover:underline" href={storeHref}>
                    {product.vendor?.name ?? "متجر التاجر"}
                  </Link>
                }
              />
            </div>

            <div className="store-product-actions mt-8 w-full max-w-2xl">
              <AddToCartWithQuantity
                buttonClassName="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                className="flex w-full max-w-sm items-end gap-3"
                disabled={product.stock <= 0}
            item={{
              productId: product.id,
              vendorId: product.vendorId,
              vendorUsername: product.vendor?.storeUsername,
              title: product.title,
              price: Number(displayPrice),
                  imageUrl: images[0],
                  stock: product.stock,
                  quantity: 1,
                }}
                layout="inline"
              />
            </div>
          </div>

          <div className="store-product-gallery order-1 lg:order-2">
            <div className="store-product-main-image panel relative aspect-[3/4] overflow-hidden">
              <Image className="object-cover" alt={product.title} src={images[0]} fill priority sizes="(min-width: 1024px) 46vw, 92vw" unoptimized />
            </div>
            <div className="store-product-thumbnails mt-4 grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((src, index) => (
                <div key={`${src}-${index}`} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${index === 0 ? "border-primary" : "border-transparent"}`}>
                  <Image className="object-cover" alt={`${product.title} ${index + 1}`} src={src} fill sizes="25vw" unoptimized />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="store-product-reviews mt-16 rounded-[28px] border border-outline-variant/25 bg-surface-container-lowest px-5 py-10 shadow-sm md:px-12 md:py-12">
          <div className="flex justify-start text-right">
            <Link className="hidden" href={`${profileHref}/reviews/new`}>
              كتابة مراجعة
            </Link>
            <div className="text-right [&>p]:hidden">
              <h2 className="text-2xl font-black text-on-surface">مراجعات المنتج</h2>
              <p className="mt-2 text-on-surface-variant">آراء العملاء الذين اشتروا {product.title}</p>
            </div>
          </div>
          <ReviewsCarousel fallbackContext={product.title} reviews={reviews} />
          <div className="mt-8 flex justify-start">
            <Link className="primary-button px-7 py-3" href={`${profileHref}/reviews/new`}>
              كتابة مراجعة
            </Link>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="store-related-products mt-16 border-t border-outline-variant/20 pt-12">
            <h2 className="section-title mb-8 text-center text-3xl">قد يعجبك أيضا</h2>
            <div className="store-related-products-grid grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} fallbackImage={fallbackProductImage} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <PublicFooter theme={theme} />
    </div>
  );
}

async function loadProduct(id: string, vendorId: string) {
  try {
    const product = await getProductById(id);

    if (product.vendorId !== vendorId) {
      notFound();
    }

    return product;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

async function loadProductReviews(productId: string): Promise<Review[]> {
  try {
    return await getProductReviews(productId);
  } catch {
    return [];
  }
}

async function loadRelatedProducts(product: Product, vendorId: string) {
  try {
    const products = await getProducts({
      vendorId,
      category: product.category?.slug || undefined,
      limit: 4,
      sort: "latest",
    });

    return products.data.filter((item) => item.id !== product.id).slice(0, 4);
  } catch {
    return [];
  }
}

async function loadProductTheme(product: Product): Promise<VendorTheme | null> {
  if (product.vendor?.theme?.templateId && product.vendor.theme.tokens) {
    return product.vendor.theme;
  }

  try {
    return await getVendorTheme(product.vendorId);
  } catch {
    return null;
  }
}

function getProductImages(product: Product) {
  const images = [product.imageUrl, ...(product.images?.map((image) => image.url) ?? [])].filter(Boolean) as string[];
  return images.length > 0 ? images : [fallbackProductImage];
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-3 last:border-b-0 last:pb-0">
      <span className="font-bold text-on-surface">{value}</span>
      <span className="text-on-surface-variant">{label}</span>
    </div>
  );
}

function formatPrice(price: string) {
  return `${Number(price).toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatStatus(status: Product["status"]) {
  const labels: Record<Product["status"], string> = {
    ACTIVE: "نشط",
    DRAFT: "مسودة",
    ARCHIVED: "مؤرشف",
  };

  return labels[status];
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const classes: Record<Product["status"], string> = {
    ACTIVE: "bg-green-100 text-green-800",
    DRAFT: "bg-amber-100 text-amber-800",
    ARCHIVED: "bg-red-100 text-red-800",
  };

  return <span className={`rounded-full px-3 py-1 text-sm font-bold ${classes[status]}`}>{formatStatus(status)}</span>;
}
