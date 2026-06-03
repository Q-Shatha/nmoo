"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartSummary, readCart } from "@/lib/cart";
import { CartIcon } from "./CartIcon";

export function CartLink({ vendorId }: { vendorId?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncCartCount() {
      setCount(getCartSummary(readCart(vendorId)).count);
    }

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("nmoo-cart-change", syncCartCount);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("nmoo-cart-change", syncCartCount);
    };
  }, [vendorId]);

  return (
    <Link href={vendorId ? `/cart?vendorId=${encodeURIComponent(vendorId)}` : "/cart"} className="relative flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary-container/30" aria-label="السلة">
      <CartIcon />
      {count > 0 ? (
        <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-black text-on-primary">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
