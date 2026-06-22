"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartItem,
  clearVendorCart,
  getCartItemKey,
  getCartSummary,
  readCart,
  removeVendorCartItem,
  subscribeToCart,
  updateCartItemQuantity,
} from "@/lib/cart";
import { useI18n } from "@/lib/i18n/context";

export function CartView({ vendorId }: { vendorId?: string }) {
  const { t } = useI18n();
  const items = useCartItems(vendorId);
  const summary = useMemo(() => getCartSummary(items), [items]);

  function handleQuantityChange(cartKey: string, quantity: number) {
    updateCartItemQuantity(cartKey, quantity, vendorId);
  }

  function handleRemove(cartKey: string) {
    removeVendorCartItem(vendorId, cartKey);
  }

  function handleClearCart() {
    clearVendorCart(vendorId);
  }

  if (items.length === 0) {
    return (
      <section className="panel mx-auto max-w-2xl p-10 text-center" data-mobile-cart-root data-vendor-id={vendorId ?? ""}>
        <h1 className="text-3xl font-black text-primary">{t.emptyCart}</h1>
        <p className="mt-3 leading-8 text-on-surface-variant">{t.emptyCartDesc}</p>
        <Link className="primary-button mt-6 px-8 py-3" href="/">
          {t.browseProducts}
        </Link>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]" data-cart-rendered data-mobile-cart-root data-vendor-id={vendorId ?? ""}>
      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant/20 p-5">
          <h1 className="text-2xl font-black text-primary">{t.shoppingCart}</h1>
          <button className="font-bold text-error hover:underline" onClick={handleClearCart} type="button">
            {t.clearCart}
          </button>
        </div>
        <div className="divide-y divide-outline-variant/15">
          {items.map((item) => (
            <CartLine key={getCartItemKey(item)} item={item} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
          ))}
          {false ? items.map((item) => (
            <article key={item.productId} className="grid grid-cols-[92px_1fr] gap-4 p-5 text-start sm:grid-cols-[120px_1fr_auto]">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl sm:h-28 sm:w-28">
                <Image className="object-cover" alt={item.title} src={item.imageUrl || "/nmoo-logo.png"} fill sizes="112px" unoptimized />
              </div>
              <div>
                <Link className="text-lg font-bold text-on-surface hover:text-primary" href={getCartItemHref(item)}>
                  {item.title}
                </Link>
                <p className="mt-2 text-sm text-on-surface-variant">{t.inStock(item.stock ?? 0)}</p>
                <p className="mt-3 text-xl font-black text-primary">{formatPrice(item.price, t.currency, t.numberLocale)}</p>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                <div className="flex h-11 items-center rounded-xl border border-outline-variant bg-white">
                  <button
                    className="h-11 w-11 font-black text-primary"
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    type="button"
                  >
                    −
                  </button>
                  <span className="min-w-10 text-center font-bold">{item.quantity}</span>
                  <button
                    className="h-11 w-11 font-black text-primary"
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <button className="text-sm font-bold text-error hover:underline" onClick={() => handleRemove(item.productId)} type="button">
                  {t.delete}
                </button>
              </div>
            </article>
          )) : null}
        </div>
      </section>

      <CartSummary subtotal={summary.subtotal} count={summary.count} vendorId={vendorId} t={t} />
    </div>
  );
}

function useCartItems(vendorId?: string) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setItems(readCart(vendorId));
    syncCart();
    return subscribeToCart(syncCart);
  }, [vendorId]);

  return items;
}

function CartLine({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (cartKey: string, quantity: number) => void;
  onRemove: (cartKey: string) => void;
}) {
  const { t } = useI18n();
  const cartKey = getCartItemKey(item);
  const selectedOptions = Object.entries(item.selectedOptions ?? {});
  const selectedAddons = item.selectedAddons ?? [];

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 p-5 text-start sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="relative col-start-1 h-24 w-24 overflow-hidden rounded-xl bg-surface-container-low sm:h-28 sm:w-28">
        <Image className="object-cover" alt={item.title} src={item.imageUrl || "/nmoo-logo.png"} fill sizes="112px" unoptimized />
      </div>
      <div className="col-start-2 flex min-w-0 flex-col items-start text-start">
        <Link className="text-lg font-bold text-on-surface hover:text-primary" href={getCartItemHref(item)}>
          {item.title}
        </Link>
        {selectedOptions.length > 0 ? (
          <div className="mt-2 flex w-fit max-w-full flex-wrap justify-start gap-2 self-start">
            {selectedOptions.map(([name, value]) => (
              <span key={`${name}-${value}`} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
                {name}: {value}
              </span>
            ))}
          </div>
        ) : null}
        {selectedAddons.length > 0 ? (
          <div className="mt-2 flex w-fit max-w-full flex-wrap justify-start gap-2 self-start">
            {selectedAddons.map((addon) => (
              <span key={addon.id} className="rounded-full bg-primary-container/35 px-3 py-1 text-xs font-bold text-primary">
                {addon.name} + {formatPrice(addon.price, t.currency, t.numberLocale)}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-sm text-on-surface-variant">{t.inStock(item.stock ?? 0)}</p>
        <p className="mt-3 text-xl font-black text-primary">{formatPrice(item.price, t.currency, t.numberLocale)}</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:col-start-3 sm:flex-col sm:items-end">
        <div className="flex h-11 items-center rounded-xl border border-outline-variant bg-white">
          <button className="h-11 w-11 font-black text-primary" onClick={() => onQuantityChange(cartKey, item.quantity - 1)} type="button">
            -
          </button>
          <span className="min-w-10 text-center font-bold">{item.quantity}</span>
          <button className="h-11 w-11 font-black text-primary" onClick={() => onQuantityChange(cartKey, item.quantity + 1)} type="button">
            +
          </button>
        </div>
        <button className="text-sm font-bold text-error hover:underline" onClick={() => onRemove(cartKey)} type="button">
          {t.delete}
        </button>
      </div>
    </article>
  );
}

function CartSummary({ subtotal, count, vendorId, t }: { subtotal: number; count: number; vendorId?: string; t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <aside className="panel h-fit p-6 text-start">
      <h2 className="text-xl font-black text-on-surface">{t.cartSummaryTitle}</h2>
      <div className="mt-5 space-y-3 border-b border-outline-variant/20 pb-5">
        <SummaryRow label={t.productCount} value={`${count}`} />
        <SummaryRow label={t.subtotal} value={formatPrice(subtotal, t.currency, t.numberLocale)} />
        <SummaryRow label={t.shipping} value={t.shippingTBD} />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="font-bold text-on-surface">{t.preliminaryTotal}</span>
        <span className="text-2xl font-black text-primary">{formatPrice(subtotal, t.currency, t.numberLocale)}</span>
      </div>
      <Link className="primary-button mt-6 w-full py-4" href={vendorId ? `/checkout?vendorId=${encodeURIComponent(vendorId)}` : "/checkout"}>
        {t.proceedToCheckout}
      </Link>
      <Link className="secondary-button mt-3 w-full py-3" href="/">
        {t.continueShopping}
      </Link>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-on-surface-variant">
      <span>{label}</span>
      <span className="font-bold text-on-surface">{value}</span>
    </div>
  );
}

function formatPrice(value: number, currency: string, locale = "ar-SA") {
  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function getCartItemHref(item: CartItem) {
  return item.vendorUsername ? `/${item.vendorUsername}/products/${item.productId}` : item.vendorId ? `/vendors/${item.vendorId}/products/${item.productId}` : "/";
}
