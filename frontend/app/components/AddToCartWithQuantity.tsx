"use client";

import { useState } from "react";
import { addCartItem, CartItem } from "@/lib/cart";

type AddToCartWithQuantityProps = {
  item: Omit<CartItem, "quantity"> & Partial<Pick<CartItem, "quantity">>;
  buttonClassName?: string;
  className?: string;
  disabled?: boolean;
  initialQuantity?: number;
  layout?: "stacked" | "inline";
};

export function AddToCartWithQuantity({
  item,
  buttonClassName = "primary-button flex h-12 w-12 shrink-0 items-center justify-center p-0",
  className = "flex items-end gap-3",
  disabled,
  initialQuantity = 1,
  layout = "stacked",
}: AddToCartWithQuantityProps) {
  const maxQuantity = Math.max(1, item.stock);
  const [quantity, setQuantity] = useState(() => clampQuantity(initialQuantity, maxQuantity));
  const [status, setStatus] = useState<"idle" | "added">("idle");
  const unavailable = disabled || item.stock <= 0;
  const isInline = layout === "inline";
  const buttonLabel = item.stock <= 0 ? "غير متوفر" : status === "added" ? "تمت الإضافة" : "أضف إلى السلة";

  function updateQuantity(nextQuantity: number) {
    setQuantity(clampQuantity(nextQuantity, maxQuantity));
  }

  function handleAddToCart() {
    addCartItem({
      ...item,
      quantity,
    });
    setStatus("added");
    window.setTimeout(() => setStatus("idle"), 1400);
  }

  const quantityWidth = isInline ? "10rem" : "100%";

  return (
    <div className={className} dir="rtl" style={{ width: "100%" }}>
      <label className="grid min-w-0 gap-1 text-right" style={{ width: quantityWidth, minWidth: isInline ? quantityWidth : "14rem" }}>
        <span className="text-xs font-bold text-on-surface-variant">الكمية</span>
        <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest" style={{ width: quantityWidth }}>
          <button
            aria-label="تقليل الكمية"
            className="flex h-full w-12 shrink-0 items-center justify-center text-lg font-black text-primary disabled:cursor-not-allowed disabled:opacity-40"
            disabled={unavailable || quantity <= 1}
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
          >
            -
          </button>
          <input
            aria-label="الكمية"
            className="h-full min-w-0 flex-1 border-x border-outline-variant bg-transparent text-center text-lg font-black text-on-surface outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            disabled={unavailable}
            max={maxQuantity}
            min={1}
            type="number"
            value={quantity}
            onChange={(event) => updateQuantity(Number(event.target.value))}
          />
          <button
            aria-label="زيادة الكمية"
            className="flex h-full w-12 shrink-0 items-center justify-center text-lg font-black text-primary disabled:cursor-not-allowed disabled:opacity-40"
            disabled={unavailable || quantity >= maxQuantity}
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
      </label>
      <button
        aria-label={buttonLabel}
        className={`${buttonClassName} min-w-0`}
        disabled={unavailable}
        style={isInline ? undefined : { width: "100%" }}
        title={buttonLabel}
        type="button"
        onClick={handleAddToCart}
      >
        <CartIcon />
      </button>
    </div>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.3 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H7" />
      <path d="M11 11h6" />
      <path d="M14 8v6" />
    </svg>
  );
}

function clampQuantity(value: number, maxQuantity: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(maxQuantity, Math.floor(value)));
}
