"use client";

export const CART_STORAGE_KEY = "nmoo_cart";

let cachedCartText = "";
let cachedCartItems: CartItem[] = [];

export type CartItem = {
  cartKey?: string;
  productId: string;
  vendorId?: string;
  vendorUsername?: string | null;
  title: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedAddons?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
};

export function readCart(vendorId?: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    if (value === cachedCartText) {
      return filterCartItems(cachedCartItems, vendorId);
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
  cachedCartItems = items.map(normalizeCartItem);
  cachedCartText = JSON.stringify(items);
  cachedCartText = JSON.stringify(cachedCartItems);
  window.localStorage.setItem(CART_STORAGE_KEY, cachedCartText);
  window.dispatchEvent(new Event("nmoo-cart-change"));
}

export function addCartItem(item: CartItem) {
  const items = readAllCartItems();
  const normalizedItem = {
    ...normalizeCartItem(item),
    cartKey: getCartItemKey(item),
  };
  const existingItem = items.find((cartItem) => getCartItemKey(cartItem) === normalizedItem.cartKey);

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.stock, existingItem.quantity + normalizedItem.quantity);
    writeCart(items);
    return existingItem.quantity;
  }

  writeCart([...items, normalizedItem]);
  return normalizedItem.quantity;
}

export function removeCartItem(productId: string) {
  writeCart(readAllCartItems().filter((item) => getCartItemKey(item) !== productId && item.productId !== productId));
}

export function removeVendorCartItem(vendorId: string | undefined, cartKey: string) {
  writeCart(readAllCartItems().filter((item) => getCartItemKey(item) !== cartKey || (vendorId && item.vendorId !== vendorId)));
}

export function updateCartItemQuantity(cartKey: string, quantity: number, vendorId?: string) {
  const items = readAllCartItems()
    .map((item) =>
      getCartItemKey(item) === cartKey && (!vendorId || item.vendorId === vendorId)
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
  const normalizedItems = items.map(normalizeCartItem);
  return vendorId ? normalizedItems.filter((item) => item.vendorId === vendorId) : normalizedItems;
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    imageUrl: normalizeAssetUrl(item.imageUrl),
  };
}

function normalizeAssetUrl(value?: string | null) {
  if (!value) {
    return value;
  }

  return value.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3}):5000\/api\/assets\//, "/api/assets/");
}

export function getCartItemKey(item: Pick<CartItem, "cartKey" | "productId" | "vendorId" | "selectedOptions" | "selectedAddons">) {
  if (item.cartKey) {
    return item.cartKey;
  }

  const optionKey = Object.entries(item.selectedOptions ?? {})
    .filter(([, value]) => Boolean(value))
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
  const addonKey = (item.selectedAddons ?? [])
    .map((addon) => addon.id)
    .filter(Boolean)
    .sort()
    .join("|");

  return [item.vendorId ?? "", item.productId, optionKey, addonKey].join("::");
}
