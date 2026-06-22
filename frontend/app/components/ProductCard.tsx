import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import { themeToStyle } from "@/lib/theme";
import { getT } from "@/lib/i18n/server";
import { ProductCardCartButton } from "./ProductCardCartButton";

const defaultFallbackImage =
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80";

type ProductCardProps = {
  product: Product;
  fallbackImage?: string;
  index?: number;
  showVendor?: boolean;
};

export async function ProductCard({ product, fallbackImage = defaultFallbackImage, index = 0, showVendor = false }: ProductCardProps) {
  const t = await getT();
  const imageUrl = product.imageUrl || product.images?.[0]?.url || fallbackImage;
  const rating = (4.7 + (index % 3) * 0.1).toFixed(1);
  const hasDiscount = Boolean(product.hasDiscount && product.salePrice && Number(product.salePrice) < Number(product.price));
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const badge = hasDiscount ? t.discount : product.badgeLabel?.trim();
  const themeStyle = product.vendor?.theme ? themeToStyle(product.vendor.theme) : undefined;
  const vendorHref = product.vendor?.storeUsername ? `/${product.vendor.storeUsername}` : product.vendor ? `/vendors/${product.vendor.id}` : `/vendors/${product.vendorId}`;
  const productHref = `${vendorHref}/products/${product.id}`;
  const storeName = product.vendor?.theme?.storeName?.trim() || product.vendor?.name || t.defaultStoreName;

  return (
    <article
      className="store-product-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-outline-variant/35 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
      style={{ ...themeStyle, backgroundColor: "var(--color-surface-container-lowest)" }}
    >
      <Link href={productHref} className="block">
        <div className="store-product-card-media relative aspect-square overflow-hidden bg-surface-container-low">
          <Image className="object-cover transition duration-500 group-hover:scale-105" alt={product.title} src={imageUrl} fill sizes="(min-width: 1280px) 260px, (min-width: 640px) 45vw, 46vw" unoptimized />
          {badge ? <span className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-black sm:right-4 sm:top-4 sm:px-3 sm:text-xs ${hasDiscount ? "bg-red-600 text-white" : "bg-primary text-on-primary"}`}>{badge}</span> : null}
        </div>
      </Link>

      <div className="store-product-card-body flex flex-1 flex-col p-3 text-start sm:p-5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs font-bold text-primary">{product.category?.name ?? t.productChip}</p>
          {showVendor && product.vendor ? (
            <Link className="text-xs font-bold text-on-surface-variant underline-offset-4 hover:text-primary hover:underline" href={vendorHref}>
              {storeName}
            </Link>
          ) : null}
        </div>

        <Link href={productHref}>
          <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-black leading-5 text-on-surface sm:min-h-12 sm:text-base sm:leading-6">{product.title}</h3>
        </Link>

        <p className="store-product-card-rating mt-2 text-sm font-bold text-on-surface">★ {rating}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 sm:gap-3 sm:pt-5">
          <ProductCardCartButton
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-11"
            fallbackPrice={Number(displayPrice)}
            fallbackStock={product.stock}
            addons={product.addons}
            currency={t.currency}
            item={{
              productId: product.id,
              vendorId: product.vendorId,
              vendorUsername: product.vendor?.storeUsername,
              title: product.title,
              price: Number(displayPrice),
              imageUrl,
              stock: product.stock,
              quantity: 1,
            }}
            options={product.options}
          />
          <div className="text-end">
            {hasDiscount ? <p className="text-xs text-on-surface-variant line-through sm:text-sm">{formatPrice(product.price, t.currency, t.numberLocale)}</p> : null}
            <p className={`text-base font-black sm:text-lg ${hasDiscount ? "text-red-600" : "text-primary"}`}>{formatPrice(displayPrice, t.currency, t.numberLocale)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function formatPrice(price: string | number, currency: string, locale = "ar-SA") {
  return `${Number(price).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}
