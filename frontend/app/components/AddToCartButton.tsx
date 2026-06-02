"use client";

import { useState } from "react";
import { addCartItem, CartItem } from "@/lib/cart";

type AddToCartButtonProps = {
  item: CartItem;
  className?: string;
  disabled?: boolean;
};

export function AddToCartButton({ item, className = "primary-button flex h-11 w-11 items-center justify-center p-0", disabled }: AddToCartButtonProps) {
  const [status, setStatus] = useState<"idle" | "added">("idle");
  const label = item.stock <= 0 ? "غير متوفر" : status === "added" ? "تمت الإضافة" : "أضف إلى السلة";

  function handleAddToCart() {
    addCartItem(item);
    setStatus("added");
    window.setTimeout(() => setStatus("idle"), 1400);
  }

  return (
    <button aria-label={label} className={className} disabled={disabled || item.stock <= 0} title={label} type="button" onClick={handleAddToCart}>
      <CartIcon />
    </button>
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
