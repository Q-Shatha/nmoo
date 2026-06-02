"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  CartItem,
  clearVendorCart,
  getCartSummary,
  readCart,
  removeVendorCartItem,
  subscribeToCart,
  updateCartItemQuantity,
} from "@/lib/cart";

export function CartView({ vendorId }: { vendorId?: string }) {
  const items = useCartItems(vendorId);
  const summary = useMemo(() => getCartSummary(items), [items]);

  function handleQuantityChange(productId: string, quantity: number) {
    updateCartItemQuantity(productId, quantity, vendorId);
  }

  function handleRemove(productId: string) {
    removeVendorCartItem(vendorId, productId);
  }

  function handleClearCart() {
    clearVendorCart(vendorId);
  }

  if (items.length === 0) {
    return (
      <section className="panel mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-3xl font-black text-primary">السلة فارغة</h1>
        <p className="mt-3 leading-8 text-on-surface-variant">أضف منتجات من المتجر وستظهر هنا لإكمال الشراء.</p>
        <Link className="primary-button mt-6 px-8 py-3" href="/">
          تصفح المنتجات
        </Link>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant/20 p-5">
          <h1 className="text-2xl font-black text-primary">سلة التسوق</h1>
          <button className="font-bold text-error hover:underline" onClick={handleClearCart} type="button">
            تفريغ السلة
          </button>
        </div>
        <div className="divide-y divide-outline-variant/15">
          {items.map((item) => (
            <article key={item.productId} className="grid grid-cols-[92px_1fr] gap-4 p-5 text-right sm:grid-cols-[120px_1fr_auto]">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl sm:h-28 sm:w-28">
                <Image className="object-cover" alt={item.title} src={item.imageUrl || "/nmoo-logo.png"} fill sizes="112px" />
              </div>
              <div>
                <Link className="text-lg font-bold text-on-surface hover:text-primary" href={getCartItemHref(item)}>
                  {item.title}
                </Link>
                <p className="mt-2 text-sm text-on-surface-variant">{item.stock} متوفر</p>
                <p className="mt-3 text-xl font-black text-primary">{formatPrice(item.price)}</p>
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
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CartSummary subtotal={summary.subtotal} count={summary.count} vendorId={vendorId} />
    </div>
  );
}

function useCartItems(vendorId?: string) {
  return useSyncExternalStore(subscribeToCart, () => readCart(vendorId), getEmptyCart);
}

function getEmptyCart(): CartItem[] {
  return [];
}

function CartSummary({ subtotal, count, vendorId }: { subtotal: number; count: number; vendorId?: string }) {
  return (
    <aside className="panel h-fit p-6 text-right">
      <h2 className="text-xl font-black text-on-surface">ملخص الطلب</h2>
      <div className="mt-5 space-y-3 border-b border-outline-variant/20 pb-5">
        <SummaryRow label="عدد المنتجات" value={`${count}`} />
        <SummaryRow label="المجموع الفرعي" value={formatPrice(subtotal)} />
        <SummaryRow label="الشحن" value="يحدد لاحقاً" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="font-bold text-on-surface">الإجمالي المبدئي</span>
        <span className="text-2xl font-black text-primary">{formatPrice(subtotal)}</span>
      </div>
      <Link className="primary-button mt-6 w-full py-4" href={vendorId ? `/checkout?vendorId=${encodeURIComponent(vendorId)}` : "/checkout"}>
        متابعة الدفع
      </Link>
      <Link className="secondary-button mt-3 w-full py-3" href="/">
        متابعة التسوق
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

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function getCartItemHref(item: CartItem) {
  return item.vendorUsername ? `/${item.vendorUsername}/products/${item.productId}` : item.vendorId ? `/vendors/${item.vendorId}/products/${item.productId}` : "/";
}
