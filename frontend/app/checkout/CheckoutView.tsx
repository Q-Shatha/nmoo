"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, ApiUser, CheckoutShippingOption, createOrder, DiscountValidationResult, getCheckoutShippingOptions, getMe, ShippingCarrier, validateDiscountCode } from "@/lib/api";
import { getCountryLabel } from "@/lib/location-data";
import { CartItem, clearVendorCart, getCartItemKey, getCartSummary, readCart, subscribeToCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/context";

export function CheckoutView({ vendorId }: { vendorId?: string }) {
  const { t } = useI18n();
  const items = useCartItems(vendorId);
  const summary = useMemo(() => getCartSummary(items), [items]);
  const [buyer, setBuyer] = useState<ApiUser | null>(null);
  const [shippingOptions, setShippingOptions] = useState<CheckoutShippingOption[]>([]);
  const [shippingCarrier, setShippingCarrier] = useState<ShippingCarrier>("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH_ON_DELIVERY">("ONLINE");
  const [errorMessage, setErrorMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);
  const [discountMessage, setDiscountMessage] = useState("");
  const [isLoadingBuyer, setIsLoadingBuyer] = useState(true);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedShipping = shippingOptions.find((option) => option.code === shippingCarrier);
  const cashOnDeliveryEnabled = Boolean(selectedShipping?.cashOnDeliveryEnabled);
  const discountAmount = Number(appliedDiscount?.amount ?? 0);
  const payableTotal = Math.max(0, summary.subtotal - discountAmount) + Number(selectedShipping?.fee ?? 0);

  useEffect(() => {
    let isMounted = true;
    const token = readCookie("nmoo_access_token");

    if (!token) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setIsLoadingBuyer(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }

    getMe(token)
      .then((user) => {
        if (isMounted) {
          setBuyer(user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBuyer(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingBuyer(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cashOnDeliveryEnabled && paymentMethod === "CASH_ON_DELIVERY") {
      setPaymentMethod("ONLINE");
    }
  }, [cashOnDeliveryEnabled, paymentMethod]);

  useEffect(() => {
    let isMounted = true;

    if (items.length === 0) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setShippingOptions([]);
          setShippingCarrier("");
        }
      });
      return () => {
        isMounted = false;
      };
    }

    Promise.resolve().then(() => {
      if (isMounted) {
        setIsLoadingShipping(true);
        setErrorMessage("");
      }
    });

    getCheckoutShippingOptions({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      destinationCountry: buyer?.country ?? undefined,
      destinationRegion: buyer?.region ?? undefined,
      destinationCity: buyer?.city ?? undefined,
    })
      .then((options) => {
        if (!isMounted) {
          return;
        }

        setShippingOptions(options);
        setShippingCarrier((current) => (options.some((option) => option.code === current) ? current : (options[0]?.code ?? "")));
      })
      .catch((error) => {
        if (isMounted) {
          setShippingOptions([]);
          setShippingCarrier("");
          setErrorMessage(error instanceof ApiError ? error.message : t.checkoutFailedShipping);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingShipping(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [items, buyer?.country, buyer?.region, buyer?.city, t.checkoutFailedShipping]);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (isMounted) {
        setAppliedDiscount(null);
        setDiscountMessage("");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [items]);

  async function handleApplyDiscount() {
    setDiscountMessage("");
    setAppliedDiscount(null);

    const token = readCookie("nmoo_access_token");
    const code = discountCode.trim();

    if (!token) {
      setDiscountMessage(t.checkoutDiscountLoginFirst);
      return;
    }

    if (!code) {
      setDiscountMessage(t.checkoutEnterCode);
      return;
    }

    setIsApplyingDiscount(true);

    try {
      const discount = await validateDiscountCode(
        {
          code,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            addOnIds: item.selectedAddons?.map((addon) => addon.id),
          })),
        },
        token,
      );
      setAppliedDiscount(discount);
      setDiscountCode(discount.code);
      setDiscountMessage(t.checkoutDiscountApplied(formatPrice(Number(discount.amount), t.currency, t.numberLocale)));
    } catch (error) {
      setDiscountMessage(error instanceof ApiError ? error.message : t.checkoutFailedDiscount);
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  async function handleConfirmAddress() {
    setErrorMessage("");

    const token = readCookie("nmoo_access_token");

    if (!token) {
      setErrorMessage(t.checkoutLoginFirst);
      return;
    }

    if (!buyer || !hasCompleteAddress(buyer)) {
      setErrorMessage(t.checkoutFillAddress);
      return;
    }

    if (!selectedShipping) {
      setErrorMessage(t.checkoutSelectShipping);
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder(
        {
          shippingCarrier: selectedShipping.code,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            addOnIds: item.selectedAddons?.map((addon) => addon.id),
          })),
          discountCode: appliedDiscount?.code,
        },
        token,
      );

      clearVendorCart(vendorId);
      window.location.href = `/payment/${order.id}`;
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : t.checkoutFailedOrder);
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="panel mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-3xl font-black text-primary">{t.checkoutEmptyTitle}</h1>
        <p className="mt-3 text-on-surface-variant">{t.checkoutEmptyDesc}</p>
        <Link className="primary-button mt-6 px-8 py-3" href="/">
          {t.checkoutOpenStore}
        </Link>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <section className="grid gap-6 text-start">
        <div className="panel p-6">
          <h1 className="text-3xl font-black text-primary">{t.checkoutConfirmAddressTitle}</h1>
          <p className="mt-3 leading-8 text-on-surface-variant">{t.checkoutConfirmAddressDesc}</p>

          {isLoadingBuyer ? (
            <div className="mt-8 h-48 animate-pulse rounded-2xl bg-surface-container-low" />
          ) : buyer ? (
            <AddressConfirmation user={buyer} t={t} />
          ) : (
            <div className="mt-8 rounded-2xl bg-error-container/50 p-5 text-start">
              <h2 className="text-xl font-black text-error">{t.checkoutNeedLoginTitle}</h2>
              <p className="mt-2 leading-7 text-on-surface-variant">{t.checkoutNeedLoginDesc}</p>
              <Link className="primary-button mt-5 px-6 py-3" href="/login?next=/checkout">
                {t.checkoutLoginBtn}
              </Link>
            </div>
          )}
        </div>

        <section className="panel p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-on-surface">{t.checkoutShippingTitle}</h2>
              <p className="mt-2 text-on-surface-variant">{t.checkoutShippingDesc}</p>
            </div>
            <span className="chip px-4 py-2 text-sm">{t.checkoutMerchantFees}</span>
          </div>

          {isLoadingShipping ? <div className="mt-5 h-32 animate-pulse rounded-2xl bg-surface-container-low" /> : null}

          {!isLoadingShipping && shippingOptions.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-error-container/50 p-5">
              <h3 className="font-black text-error">{t.checkoutNoShipping}</h3>
              <p className="mt-2 leading-7 text-on-surface-variant">{t.checkoutNoShippingDesc}</p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {shippingOptions.map((option) => (
              <label
                key={option.code}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  shippingCarrier === option.code ? "border-primary bg-primary-container/30 shadow-sm" : "border-outline-variant/30 bg-white hover:border-primary/50"
                }`}
              >
                <input
                  checked={shippingCarrier === option.code}
                  className="sr-only"
                  name="shippingCarrier"
                  type="radio"
                  value={option.code}
                  onChange={() => setShippingCarrier(option.code)}
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-on-surface">{option.name}</h3>
                    {option.description ? <p className="mt-2 leading-7 text-on-surface-variant">{option.description}</p> : null}
                    {option.eta ? <p className="mt-2 text-sm font-bold text-primary">{option.eta}</p> : null}
                    {option.vendorCount > 1 ? <p className="mt-1 text-xs font-bold text-on-surface-variant">{t.checkoutVendorCount(option.vendorCount)}</p> : null}
                  </div>
                  <strong className="whitespace-nowrap text-lg text-primary">{formatPrice(Number(option.fee), t.currency, t.numberLocale, t.checkoutFreeShipping)}</strong>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="text-2xl font-black text-on-surface">{t.checkoutPaymentTitle}</h2>
          <p className="mt-2 text-on-surface-variant">{t.checkoutPaymentDesc}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <PaymentOption checked={paymentMethod === "ONLINE"} description={t.checkoutOnlineDesc} label={t.checkoutOnlineLabel} onChange={() => setPaymentMethod("ONLINE")} />
            {cashOnDeliveryEnabled ? (
              <PaymentOption checked={paymentMethod === "CASH_ON_DELIVERY"} description={t.checkoutCodDesc} label={t.checkoutCodLabel} onChange={() => setPaymentMethod("CASH_ON_DELIVERY")} />
            ) : (
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 text-start opacity-75">
                <h3 className="font-black text-on-surface">{t.checkoutCodUnavailable}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t.checkoutCodUnavailableDesc}</p>
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="panel h-fit p-6 text-start">
        <h2 className="text-xl font-black text-on-surface">{t.checkoutOrderReview}</h2>
        <div className="mt-5 divide-y divide-outline-variant/15">
          {items.map((item) => (
            <CheckoutLine key={getCartItemKey(item)} item={item} t={t} />
          ))}
        </div>
        <div className="mt-5 grid gap-3 border-t border-outline-variant/20 pt-5">
          <SummaryRow label={t.checkoutSubtotal} value={formatPrice(summary.subtotal, t.currency, t.numberLocale)} />
          <SummaryRow
            label={t.checkoutShipping(selectedShipping?.name ?? t.checkoutShippingUnset)}
            value={selectedShipping ? formatPrice(Number(selectedShipping.fee), t.currency, t.numberLocale, t.checkoutFreeShipping) : "-"}
          />
          <div className="rounded-2xl bg-surface-container-low p-4">
            <label className="text-sm font-bold text-on-surface-variant" htmlFor="discount-code">
              {t.checkoutDiscountCode}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="discount-code"
                className="input-field min-w-0 flex-1"
                placeholder="WELCOME10"
                value={discountCode}
                onChange={(event) => {
                  setDiscountCode(event.target.value.toUpperCase());
                  setAppliedDiscount(null);
                  setDiscountMessage("");
                }}
              />
              <button className="secondary-button shrink-0 px-4 py-3 disabled:opacity-60" disabled={isApplyingDiscount} type="button" onClick={handleApplyDiscount}>
                {isApplyingDiscount ? t.checkoutApplying : t.checkoutApply}
              </button>
            </div>
            {discountMessage ? <p className={`mt-2 text-sm font-bold ${appliedDiscount ? "text-green-700" : "text-error"}`}>{discountMessage}</p> : null}
          </div>
          {appliedDiscount ? <SummaryRow label={t.checkoutDiscount(appliedDiscount.code)} value={`- ${formatPrice(discountAmount, t.currency, t.numberLocale)}`} valueClassName="text-red-600" /> : null}
          <div className="flex items-center justify-between rounded-2xl bg-primary-container/30 p-4">
            <span className="font-black text-on-surface">{t.checkoutTotal}</span>
            <span className="text-2xl font-black text-primary">{formatPrice(payableTotal, t.currency, t.numberLocale)}</span>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">{paymentMethod === "CASH_ON_DELIVERY" ? t.checkoutCodNote : t.checkoutOnlineNote}</p>
        {errorMessage ? <p className="mt-4 rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{errorMessage}</p> : null}
        <button
          className="primary-button mt-6 w-full py-4 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || isLoadingBuyer || isLoadingShipping || !buyer || !hasCompleteAddress(buyer) || !selectedShipping}
          type="button"
          onClick={handleConfirmAddress}
        >
          {isSubmitting ? t.checkoutCreatingOrder : paymentMethod === "CASH_ON_DELIVERY" ? t.checkoutConfirmCod : t.checkoutConfirmOnline}
        </button>
        <Link className="secondary-button mt-3 w-full py-3" href="/account/address?next=/checkout">
          {t.checkoutEditAddress}
        </Link>
        <Link className="secondary-button mt-3 w-full py-3" href={vendorId ? `/cart?vendorId=${encodeURIComponent(vendorId)}` : "/cart"}>
          {t.checkoutEditCart}
        </Link>
      </aside>
    </div>
  );
}

type T = ReturnType<typeof useI18n>["t"];

function PaymentOption({ checked, description, label, onChange }: { checked: boolean; description: string; label: string; onChange: () => void }) {
  return (
    <label className={`cursor-pointer rounded-2xl border p-4 text-start transition ${checked ? "border-primary bg-primary-container/30 shadow-sm" : "border-outline-variant/30 bg-white hover:border-primary/50"}`}>
      <input checked={checked} className="sr-only" name="paymentMethod" type="radio" onChange={onChange} />
      <h3 className="font-black text-on-surface">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
    </label>
  );
}

function CheckoutLine({ item, t }: { item: CartItem; t: T }) {
  const selectedOptions = Object.entries(item.selectedOptions ?? {});
  const selectedAddons = item.selectedAddons ?? [];

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <h3 className="font-bold text-on-surface">{item.title}</h3>
        {selectedOptions.length > 0 ? (
          <div className="mt-2 flex flex-wrap justify-start gap-2">
            {selectedOptions.map(([name, value]) => (
              <span key={`${name}-${value}`} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
                {name}: {value}
              </span>
            ))}
          </div>
        ) : null}
        {selectedAddons.length > 0 ? (
          <div className="mt-2 flex flex-wrap justify-start gap-2">
            {selectedAddons.map((addon) => (
              <span key={addon.id} className="rounded-full bg-primary-container/35 px-3 py-1 text-xs font-bold text-primary">
                {addon.name} + {formatPrice(addon.price, t.currency, t.numberLocale)}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-1 text-sm text-on-surface-variant">{t.checkoutQty(item.quantity)}</p>
      </div>
      <span className="font-black text-primary">{formatPrice(item.price * item.quantity, t.currency, t.numberLocale)}</span>
    </div>
  );
}

function AddressConfirmation({ user, t }: { user: ApiUser; t: T }) {
  const complete = hasCompleteAddress(user);

  return (
    <div className={`mt-8 rounded-2xl border p-5 ${complete ? "border-outline-variant/30 bg-white" : "border-error/30 bg-error-container/40"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-on-surface">{t.checkoutSavedAddress}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{complete ? t.checkoutAddressComplete : t.checkoutAddressIncomplete}</p>
        </div>
        <Link className="secondary-button px-5 py-3" href="/account/address?next=/checkout">
          {t.checkoutEditAddress}
        </Link>
      </div>

      <dl className="mt-5 grid gap-3 md:grid-cols-2">
        <Info label={t.name} value={user.name} incomplete={t.checkoutIncomplete} />
        <Info label={t.mobileNumber} value={user.phoneNumber} incomplete={t.checkoutIncomplete} />
        <Info label={t.countryLabel} value={formatCountry(user.country)} incomplete={t.checkoutIncomplete} />
        <Info label={t.regionLabel} value={user.region} incomplete={t.checkoutIncomplete} />
        <Info label={t.cityLabel} value={user.city} incomplete={t.checkoutIncomplete} />
        <Info label={t.districtLabel} value={user.district} incomplete={t.checkoutIncomplete} />
        <Info label={t.streetLabel} value={user.street} incomplete={t.checkoutIncomplete} />
        <Info label={t.buildingNumber} value={user.buildingNumber} incomplete={t.checkoutIncomplete} />
        <Info label={t.postalCode} value={user.postalCode} incomplete={t.checkoutIncomplete} />
        {user.country === "SA" ? <Info label={t.nationalAddress} value={user.nationalAddress} incomplete={t.checkoutIncomplete} /> : null}
      </dl>
    </div>
  );
}

function Info({ label, value, incomplete }: { label: string; value?: string | null; incomplete: string }) {
  return (
    <div className={`rounded-xl p-4 ${value ? "bg-surface-container-low" : "bg-error-container/40"}`}>
      <dt className="text-sm font-bold text-on-surface-variant">{label}</dt>
      <dd className="mt-1 font-black text-on-surface">{value || incomplete}</dd>
    </div>
  );
}

function SummaryRow({ label, value, valueClassName = "text-on-surface" }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold text-on-surface-variant">{label}</span>
      <span className={`font-black ${valueClassName}`}>{value}</span>
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

function hasCompleteAddress(user: ApiUser) {
  const required = [user.country, user.phoneNumber, user.region, user.city, user.district, user.street, user.buildingNumber, user.postalCode];
  const hasBaseAddress = required.every((value) => Boolean(value?.trim()));

  if (user.country === "SA") {
    return hasBaseAddress && Boolean(user.nationalAddress?.trim());
  }

  return hasBaseAddress;
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}

function formatPrice(value: number, currency: string, locale = "ar-SA", freeLabel?: string) {
  if (value === 0 && freeLabel) {
    return freeLabel;
  }

  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatCountry(country?: string | null) {
  return country ? getCountryLabel(country) : "";
}
