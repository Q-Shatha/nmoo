"use client";

import { useState } from "react";
import { addCartItem, CartItem } from "@/lib/cart";
import { CartIcon } from "./CartIcon";

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
    <button aria-label={label} className={className} data-cart-button data-cart-item={JSON.stringify(item)} disabled={disabled || item.stock <= 0} title={label} type="button" onClick={handleAddToCart}>
      <CartIcon />
    </button>
  );
}
