"use client";

export const CART_STORAGE_KEY = "nmoo_cart";

let cachedCartText = "";
let cachedCartItems: CartItem[] = [];

export type CartItem = {
  productId: string;
  vendorId?: string;
  vendorUsername?: string | null;
  title: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
  quantity: number;
};

export function readCart(vendorId?: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    if (value === cachedCartText) {
      return cachedCartItems;
    }

    cachedCartText = value ?? "";
    cachedCartItems = value ? (JSON.parse(value) as CartItem[]) : [];
    return filterCartItems(cachedCartItems, vendorId);
  } catch {
    return [];
  }
}

export function subscribeToCart(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("nmoo-cart-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nmoo-cart-change", callback);
  };
}

export function writeCart(items: CartItem[]) {
  cachedCartItems = items;
  cachedCartText = JSON.stringify(items);
  window.localStorage.setItem(CART_STORAGE_KEY, cachedCartText);
  window.dispatchEvent(new Event("nmoo-cart-change"));
}

export function addCartItem(item: CartItem) {
  const items = readAllCartItems();
  const existingItem = items.find((cartItem) => cartItem.vendorId === item.vendorId && cartItem.productId === item.productId);

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.stock, existingItem.quantity + item.quantity);
    writeCart(items);
    return existingItem.quantity;
  }

  writeCart([...items, item]);
  return item.quantity;
}

export function removeCartItem(productId: string) {
  writeCart(readAllCartItems().filter((item) => item.productId !== productId));
}

export function removeVendorCartItem(vendorId: string | undefined, productId: string) {
  writeCart(readAllCartItems().filter((item) => item.productId !== productId || (vendorId && item.vendorId !== vendorId)));
}

export function updateCartItemQuantity(productId: string, quantity: number, vendorId?: string) {
  const items = readAllCartItems()
    .map((item) =>
      item.productId === productId && (!vendorId || item.vendorId === vendorId)
        ? {
            ...item,
            quantity: Math.max(1, Math.min(item.stock, quantity)),
          }
        : item,
    )
    .filter((item) => item.quantity > 0);

  writeCart(items);
}

export function clearCart() {
  writeCart([]);
}

export function clearVendorCart(vendorId?: string) {
  if (!vendorId) {
    clearCart();
    return;
  }

  writeCart(readAllCartItems().filter((item) => item.vendorId !== vendorId));
}

export function getCartSummary(items: CartItem[]) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    count,
    subtotal,
  };
}

function readAllCartItems() {
  return readCart();
}

function filterCartItems(items: CartItem[], vendorId?: string) {
  return vendorId ? items.filter((item) => item.vendorId === vendorId) : items;
}
