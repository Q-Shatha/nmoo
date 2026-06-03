import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import { themeToStyle } from "@/lib/theme";
import { AddToCartButton } from "./AddToCartButton";

const defaultFallbackImage =
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80";

type ProductCardProps = {
  product: Product;
  fallbackImage?: string;
  index?: number;
  showVendor?: boolean;
};

export function ProductCard({ product, fallbackImage = defaultFallbackImage, index = 0, showVendor = false }: ProductCardProps) {
  const imageUrl = product.imageUrl || product.images?.[0]?.url || fallbackImage;
  const rating = (4.7 + (index % 3) * 0.1).toFixed(1);
  const hasDiscount = Boolean(product.hasDiscount && product.salePrice && Number(product.salePrice) < Number(product.price));
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const badge = hasDiscount ? "خصم" : product.badgeLabel?.trim();
  const themeStyle = product.vendor?.theme ? themeToStyle(product.vendor.theme) : undefined;
  const vendorHref = product.vendor?.storeUsername ? `/${product.vendor.storeUsername}` : product.vendor ? `/vendors/${product.vendor.id}` : `/vendors/${product.vendorId}`;
  const productHref = `${vendorHref}/products/${product.id}`;

  return (
    <article
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-outline-variant/35 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
      style={{ ...themeStyle, backgroundColor: "var(--color-surface-container-lowest)" }}
    >
      <Link href={productHref} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface-container-low">
          <Image className="object-cover transition duration-500 group-hover:scale-105" alt={product.title} src={imageUrl} fill sizes="(min-width: 1280px) 260px, (min-width: 640px) 45vw, 46vw" unoptimized />
          {badge ? <span className="absolute right-2 top-2 rounded-full bg-primary px-2.5 py-1 text-[11px] font-black text-on-primary sm:right-4 sm:top-4 sm:px-3 sm:text-xs">{badge}</span> : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 text-right sm:p-5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs font-bold text-primary">{product.category?.name ?? "منتج"}</p>
          {showVendor && product.vendor ? (
            <Link className="text-xs font-bold text-on-surface-variant underline-offset-4 hover:text-primary hover:underline" href={vendorHref}>
              متجر التاجر
            </Link>
          ) : null}
        </div>

        <Link href={productHref}>
          <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-black leading-5 text-on-surface sm:min-h-12 sm:text-base sm:leading-6">{product.title}</h3>
        </Link>

        <p className="mt-2 text-sm font-bold text-primary">★ {rating}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 sm:gap-3 sm:pt-5">
          <AddToCartButton
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-11"
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
          />
          <div className="text-left">
            {hasDiscount ? <p className="text-xs text-on-surface-variant line-through sm:text-sm">{formatPrice(product.price)}</p> : null}
            <p className="text-base font-black text-primary sm:text-lg">{formatPrice(displayPrice)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function formatPrice(price: string | number) {
  return `${Number(price).toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}
