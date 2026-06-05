"use client";

import { useMemo, useState } from "react";
import type { ProductAddon, ProductOption } from "@/lib/api";
import { AddToCartWithQuantity } from "../../../../components/AddToCartWithQuantity";

type ProductPurchasePanelProps = {
  productId: string;
  vendorId: string;
  vendorUsername?: string | null;
  title: string;
  description?: string | null;
  imageUrl: string;
  basePrice: string;
  displayPrice: string;
  hasDiscount: boolean;
  productStock: number;
  storeName: string;
  options?: ProductOption[];
  addons?: ProductAddon[];
};

export function ProductPurchasePanel({
  productId,
  vendorId,
  vendorUsername,
  title,
  description,
  imageUrl,
  basePrice,
  displayPrice,
  hasDiscount,
  productStock,
  storeName,
  options = [],
  addons = [],
}: ProductPurchasePanelProps) {
  const selectableOptions = useMemo(() => options.filter((option) => option.values.length > 0), [options]);
  const availableAddons = useMemo(() => addons.filter((addon) => addon.enabled), [addons]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const selectedAddons = useMemo(() => availableAddons.filter((addon) => selectedAddonIds.includes(addon.id)).map((addon) => ({ id: addon.id, name: addon.name, price: Number(addon.price) })), [availableAddons, selectedAddonIds]);
  const selectedPrice = findSelectedOptionPrice(selectableOptions, selectedValues, Number(displayPrice)) + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const selectedStock = findSelectedOptionStock(selectableOptions, selectedValues, productStock);
  const hasOptionPrice = Math.abs(selectedPrice - Number(displayPrice)) > 0.009;
  const selectedOptions = useMemo(() => buildSelectedOptions(selectableOptions, selectedValues), [selectableOptions, selectedValues]);
  const selectionComplete = selectableOptions.every((option) => Boolean(selectedValues[option.id]));
  const mustSelectOptions = selectableOptions.length > 0 && !selectionComplete;

  function handleOptionChange(option: ProductOption, value: string) {
    setSelectedValues((current) => ({
      ...current,
      [option.id]: value,
    }));
  }

  return (
    <div className="interactive-purchase-panel">
      <div className="mt-5 flex flex-wrap items-center justify-start gap-3">
        <span className="rounded-full bg-secondary-container px-4 py-2 text-sm font-bold text-on-secondary-container">
          {selectedStock > 0 ? `${selectedStock} متوفر` : "غير متوفر"}
        </span>
        <span className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-bold text-on-surface-variant">{storeName}</span>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-start gap-4">
        {hasDiscount && !hasOptionPrice ? <span className="text-xl font-bold text-on-surface-variant line-through">{formatPrice(basePrice)}</span> : null}
        <span className={`text-4xl font-black ${hasDiscount ? "text-red-600" : "text-primary"}`}>{formatPrice(String(selectedPrice))}</span>
      </div>

      <p className="section-copy mt-6 text-lg">
        {description || "منتج من متجر نمو بتفاصيل محدثة مباشرة من قاعدة البيانات."}
      </p>

      {selectableOptions.length > 0 ? (
        <div className="store-product-options mt-8 grid gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-right" dir="rtl">
          <h2 className="text-xl font-black text-on-surface">اختر نوع المنتج</h2>
          {selectableOptions.map((option) => (
            <div key={option.id} className="grid gap-2">
              <p className="font-bold text-on-surface">{option.name}</p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value, index) => (
                  <label key={`${option.id}-${value}`} className="cursor-pointer">
                    <input
                      checked={selectedValues[option.id] === value}
                      className="peer sr-only"
                      name={`option-${option.id}`}
                      type="radio"
                      value={value}
                      onChange={() => handleOptionChange(option, value)}
                    />
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 font-bold text-on-surface-variant transition-colors peer-checked:border-primary peer-checked:bg-primary-container/35 peer-checked:text-primary">
                      <span>{value}</span>
                      <span className="text-xs opacity-75">{option.valueQuantities?.[value] ?? 0} متوفر</span>
                      <span className="text-xs opacity-75">{formatPrice(String(getOptionValuePrice(option, value, Number(displayPrice))))}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {mustSelectOptions ? <p className="text-sm font-bold text-error">اختر النوع المطلوب قبل إضافة المنتج للسلة.</p> : null}
        </div>
      ) : null}

      {availableAddons.length > 0 ? (
        <div className="store-product-options mt-5 grid gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-right" dir="rtl">
          <h2 className="text-xl font-black text-on-surface">إضافات اختيارية</h2>
          <div className="grid gap-2">
            {availableAddons.map((addon) => {
              const checked = selectedAddonIds.includes(addon.id);
              return (
                <label key={addon.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 font-bold transition ${checked ? "border-primary bg-primary-container/35 text-primary" : "border-outline-variant/40 bg-surface-container-lowest text-on-surface"}`}>
                  <span>{addon.name}</span>
                  <span className="text-sm">+ {formatPrice(String(addon.price))}</span>
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

      <div className="store-product-actions mt-8 w-full max-w-2xl">
        <AddToCartWithQuantity
          buttonClassName="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          className="flex w-full max-w-sm items-end gap-3"
          disabled={mustSelectOptions || selectedStock <= 0}
          item={{
            productId,
            vendorId,
            vendorUsername,
            title,
            price: selectedPrice,
            imageUrl,
            stock: selectedStock,
            quantity: 1,
            selectedOptions: selectionComplete ? selectedOptions : {},
            selectedAddons,
          }}
          layout="inline"
        />
      </div>
    </div>
  );
}

function buildInitialSelection(options: ProductOption[]) {
  return options.reduce<Record<string, string>>((result, option) => {
    if (option.values[0]) {
      result[option.id] = option.values[0];
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

function buildSelectedOptions(options: ProductOption[], selectedValues: Record<string, string>) {
  return options.reduce<Record<string, string>>((result, option) => {
    const value = selectedValues[option.id];

    if (value) {
      result[option.name] = value;
    }

    return result;
  }, {});
}

function formatPrice(price: string) {
  const value = Number(price);

  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}
