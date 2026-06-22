"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { ProductAddon, ProductOption } from "@/lib/api";
import { addCartItem, type CartItem } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/context";
import { CartIcon } from "./CartIcon";

type ProductCardCartButtonProps = {
  item: CartItem;
  options?: ProductOption[];
  addons?: ProductAddon[];
  fallbackPrice: number;
  fallbackStock: number;
  className?: string;
  currency: string;
};

export function ProductCardCartButton({
  item,
  options = [],
  addons = [],
  fallbackPrice,
  fallbackStock,
  className = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-11",
  currency,
}: ProductCardCartButtonProps) {
  const { t } = useI18n();
  const selectableOptions = options.filter((option) => option.values.length > 0);
  const availableAddons = addons.filter((addon) => addon.enabled);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "added">("idle");
  const selectedOptions = useMemo(() => buildSelectedOptions(selectableOptions, selectedValues), [selectableOptions, selectedValues]);
  const selectedAddons = useMemo(() => availableAddons.filter((addon) => selectedAddonIds.includes(addon.id)).map((addon) => ({ id: addon.id, name: addon.name, price: Number(addon.price) })), [availableAddons, selectedAddonIds]);
  const selectionComplete = selectableOptions.every((option) => Boolean(selectedValues[option.id]));
  const selectedPrice = findSelectedOptionPrice(selectableOptions, selectedValues, fallbackPrice) + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const selectedStock = findSelectedOptionStock(selectableOptions, selectedValues, fallbackStock);
  const unavailable = selectedStock <= 0;
  const hasOptions = selectableOptions.length > 0;
  const hasChoices = hasOptions || availableAddons.length > 0;
  const label = unavailable ? t.cardUnavailable : status === "added" ? t.cardAdded : hasOptions ? t.cardChooseType : t.addToCart;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleDirectAdd() {
    addSelectedItem();
  }

  function handleOpenSelector() {
    setIsOpen(true);
  }

  function addSelectedItem() {
    addCartItem({
      ...item,
      price: selectedPrice,
      stock: selectedStock,
      quantity: 1,
      selectedOptions,
      selectedAddons,
    });
    setStatus("added");
    setIsOpen(false);
    window.setTimeout(() => setStatus("idle"), 1400);
  }

  return (
    <>
      <button
        aria-label={label}
        className={className}
        data-cart-button={!hasChoices ? true : undefined}
        data-cart-item={!hasChoices ? JSON.stringify(item) : undefined}
        disabled={!hasChoices && unavailable}
        title={label}
        type="button"
        onClick={hasChoices ? handleOpenSelector : handleDirectAdd}
      >
        <CartIcon />
      </button>

      {isMounted && isOpen ? createPortal(
        <div className="product-option-modal fixed inset-0 z-50 bg-black/45 px-4 py-6" role="dialog" aria-modal="true">
          <div className="product-option-modal-panel border border-outline-variant/30 bg-surface-container-lowest text-start shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-on-surface">{t.chooseProductType}</h2>
                <p className="mt-1 text-sm font-bold text-on-surface-variant">{t.cardChooseAll}</p>
              </div>
              <button className="icon-button border border-outline-variant bg-surface" type="button" onClick={() => setIsOpen(false)} aria-label={t.reviewsClose}>
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {selectableOptions.map((option) => (
                <div key={option.id} className="grid gap-2">
                  <p className="font-black text-on-surface">{option.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const quantity = option.valueQuantities?.[value] ?? 0;
                      const price = getOptionValuePrice(option, value, fallbackPrice);
                      const selected = selectedValues[option.id] === value;

                      return (
                        <button
                          key={`${option.id}-${value}`}
                          className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                            selected ? "border-primary bg-primary text-on-primary" : "border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:border-primary"
                          }`}
                          type="button"
                          onClick={() => setSelectedValues((current) => ({ ...current, [option.id]: value }))}
                        >
                          <span>{value}</span>
                          <span className="mx-2 text-xs opacity-80">{t.inStockCount(quantity)}</span>
                          <span className="text-xs opacity-80">{formatPrice(price, currency, t.numberLocale)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {availableAddons.length > 0 ? (
                <div className="grid gap-2">
                  <p className="font-black text-on-surface">{t.optionalAddons}</p>
                  <div className="grid gap-2">
                    {availableAddons.map((addon) => {
                      const checked = selectedAddonIds.includes(addon.id);
                      return (
                        <label key={addon.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 font-bold transition ${checked ? "border-primary bg-primary-container/35 text-primary" : "border-outline-variant/40 bg-surface-container-lowest text-on-surface"}`}>
                          <span>{addon.name}</span>
                          <span className="text-sm">+ {formatPrice(Number(addon.price), currency, t.numberLocale)}</span>
                          <input
                            checked={checked}
                            type="checkbox"
                            onChange={(event) =>
                              setSelectedAddonIds((current) => (event.target.checked ? [...current, addon.id] : current.filter((id) => id !== addon.id)))
                            }
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl bg-surface-container-low p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-on-surface-variant">{t.cardPrice}</span>
                <strong className="text-xl text-primary">{formatPrice(selectedPrice, currency, t.numberLocale)}</strong>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="font-bold text-on-surface-variant">{t.cardAvailable}</span>
                <strong className="text-on-surface">{selectedStock}</strong>
              </div>
            </div>

            <button
              className="primary-button mt-5 w-full py-3 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!selectionComplete || unavailable}
              type="button"
              onClick={addSelectedItem}
            >
              {t.addToCart}
            </button>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function buildSelectedOptions(options: ProductOption[], selectedValues: Record<string, string>) {
  return options.reduce<Record<string, string>>((result, option) => {
    const value = selectedValues[option.id];
    if (value) {
      result[option.name] = value;
    }
    return result;
  }, {});
}

function findSelectedOptionPrice(options: ProductOption[], selectedValues: Record<string, string>, fallbackPrice: number) {
  for (const option of options) {
    const selectedValue = selectedValues[option.id];
    if (selectedValue) {
      return getOptionValuePrice(option, selectedValue, fallbackPrice);
    }
  }
  return fallbackPrice;
}

function findSelectedOptionStock(options: ProductOption[], selectedValues: Record<string, string>, fallbackStock: number) {
  for (const option of options) {
    const selectedValue = selectedValues[option.id];
    const quantity = selectedValue ? option.valueQuantities?.[selectedValue] : undefined;
    if (typeof quantity === "number") {
      return quantity;
    }
  }
  return fallbackStock;
}

function getOptionValuePrice(option: ProductOption, value: string, fallbackPrice: number) {
  const price = option.valuePrices?.[value];
  return typeof price === "number" && Number.isFinite(price) ? price : fallbackPrice;
}

function formatPrice(price: number, currency: string, locale = "ar-SA") {
  return `${price.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}
