"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ApiError, ApiUser, CheckoutShippingOption, createOrder, DiscountValidationResult, getCheckoutShippingOptions, getMe, ShippingCarrier, validateDiscountCode } from "@/lib/api";
import { getCountryLabel } from "@/lib/location-data";
import { CartItem, clearVendorCart, getCartSummary, readCart, subscribeToCart } from "@/lib/cart";

export function CheckoutView({ vendorId }: { vendorId?: string }) {
  const items = useCartItems(vendorId);
  const summary = useMemo(() => getCartSummary(items), [items]);
  const [buyer, setBuyer] = useState<ApiUser | null>(null);
  const [shippingOptions, setShippingOptions] = useState<CheckoutShippingOption[]>([]);
  const [shippingCarrier, setShippingCarrier] = useState<ShippingCarrier>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);
  const [discountMessage, setDiscountMessage] = useState("");
  const [isLoadingBuyer, setIsLoadingBuyer] = useState(true);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedShipping = shippingOptions.find((option) => option.code === shippingCarrier);
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
          setErrorMessage(error instanceof ApiError ? error.message : "تعذر تحميل خيارات الشحن.");
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
  }, [items]);

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
      setDiscountMessage("سجل الدخول أولا حتى نقدر نتحقق من حد استخدام الكود.");
      return;
    }

    if (!code) {
      setDiscountMessage("اكتب كود التخفيض أولا.");
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
          })),
        },
        token,
      );
      setAppliedDiscount(discount);
      setDiscountCode(discount.code);
      setDiscountMessage(`تم تطبيق خصم ${formatPrice(Number(discount.amount))}.`);
    } catch (error) {
      setDiscountMessage(error instanceof ApiError ? error.message : "تعذر تطبيق كود التخفيض.");
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  async function handleConfirmAddress() {
    setErrorMessage("");

    const token = readCookie("nmoo_access_token");

    if (!token) {
      setErrorMessage("سجل الدخول أولا حتى نقدر ننشئ الطلب بحسابك.");
      return;
    }

    if (!buyer || !hasCompleteAddress(buyer)) {
      setErrorMessage("أكمل عنوانك أولا قبل المتابعة للدفع.");
      return;
    }

    if (!selectedShipping) {
      setErrorMessage("اختر شركة شحن متاحة قبل المتابعة.");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder(
        {
          shippingCarrier: selectedShipping.code,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          discountCode: appliedDiscount?.code,
        },
        token,
      );

      clearVendorCart(vendorId);
      window.location.href = `/payment/${order.id}`;
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "تعذر إنشاء الطلب. حاول مرة أخرى.");
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="panel mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-3xl font-black text-primary">لا توجد منتجات للدفع</h1>
        <p className="mt-3 text-on-surface-variant">ارجع للسلة أو المتجر لإضافة منتجات قبل إكمال الطلب.</p>
        <Link className="primary-button mt-6 px-8 py-3" href="/">
          فتح المتجر
        </Link>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]" dir="rtl">
      <section className="grid gap-6 text-right">
        <div className="panel p-6">
          <h1 className="text-3xl font-black text-primary">تأكيد عنوان الشحن</h1>
          <p className="mt-3 leading-8 text-on-surface-variant">
            قبل الانتقال للدفع، تأكد أن العنوان المحفوظ في حسابك صحيح. تقدر تعدله ثم ترجع لإتمام الشراء.
          </p>

          {isLoadingBuyer ? (
            <div className="mt-8 h-48 animate-pulse rounded-2xl bg-surface-container-low" />
          ) : buyer ? (
            <AddressConfirmation user={buyer} />
          ) : (
            <div className="mt-8 rounded-2xl bg-error-container/50 p-5 text-right">
              <h2 className="text-xl font-black text-error">تحتاج تسجيل دخول</h2>
              <p className="mt-2 leading-7 text-on-surface-variant">سجل الدخول حتى نعرض عنوانك ونكمل إنشاء الطلب.</p>
              <Link className="primary-button mt-5 px-6 py-3" href="/login?next=/checkout">
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>

        <section className="panel p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-on-surface">اختيار شركة الشحن</h2>
              <p className="mt-2 text-on-surface-variant">تظهر هنا الشركات التي فعلها التاجر للمنتجات الموجودة في السلة.</p>
            </div>
            <span className="chip px-4 py-2 text-sm">رسوم التاجر</span>
          </div>

          {isLoadingShipping ? <div className="mt-5 h-32 animate-pulse rounded-2xl bg-surface-container-low" /> : null}

          {!isLoadingShipping && shippingOptions.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-error-container/50 p-5">
              <h3 className="font-black text-error">لا توجد شركة شحن متاحة</h3>
              <p className="mt-2 leading-7 text-on-surface-variant">التاجر لم يضف شركات شحن مشتركة لهذه المنتجات بعد. تواصل مع التاجر أو عدل السلة.</p>
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
                    {option.vendorCount > 1 ? <p className="mt-1 text-xs font-bold text-on-surface-variant">تشمل {option.vendorCount} تجار</p> : null}
                  </div>
                  <strong className="whitespace-nowrap text-lg text-primary">{formatPrice(Number(option.fee))}</strong>
                </div>
              </label>
            ))}
          </div>
        </section>
      </section>

      <aside className="panel h-fit p-6 text-right">
        <h2 className="text-xl font-black text-on-surface">مراجعة الطلب</h2>
        <div className="mt-5 divide-y divide-outline-variant/15">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-4 py-4">
              <div>
                <h3 className="font-bold text-on-surface">{item.title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">الكمية: {item.quantity}</p>
              </div>
              <span className="font-black text-primary">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 border-t border-outline-variant/20 pt-5">
          <SummaryRow label="المجموع الفرعي" value={formatPrice(summary.subtotal)} />
          <SummaryRow label={`الشحن (${selectedShipping?.name ?? "غير محدد"})`} value={selectedShipping ? formatPrice(Number(selectedShipping.fee)) : "-"} />
          <div className="rounded-2xl bg-surface-container-low p-4">
            <label className="text-sm font-bold text-on-surface-variant" htmlFor="discount-code">
              كود التخفيض
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="discount-code"
                className="input-field min-w-0 flex-1"
                placeholder="مثال: WELCOME10"
                value={discountCode}
                onChange={(event) => {
                  setDiscountCode(event.target.value.toUpperCase());
                  setAppliedDiscount(null);
                  setDiscountMessage("");
                }}
              />
              <button className="secondary-button shrink-0 px-4 py-3 disabled:opacity-60" disabled={isApplyingDiscount} type="button" onClick={handleApplyDiscount}>
                {isApplyingDiscount ? "جاري..." : "تطبيق"}
              </button>
            </div>
            {discountMessage ? <p className={`mt-2 text-sm font-bold ${appliedDiscount ? "text-green-700" : "text-error"}`}>{discountMessage}</p> : null}
          </div>
          {appliedDiscount ? <SummaryRow label={`الخصم (${appliedDiscount.code})`} value={`- ${formatPrice(discountAmount)}`} /> : null}
          <div className="flex items-center justify-between rounded-2xl bg-primary-container/30 p-4">
            <span className="font-black text-on-surface">الإجمالي قبل الدفع</span>
            <span className="text-2xl font-black text-primary">{formatPrice(payableTotal)}</span>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">سيتم إنشاء الطلب أولا، ثم تنتقل إلى صفحة الدفع الخاصة به.</p>
        {errorMessage ? <p className="mt-4 rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{errorMessage}</p> : null}
        <button
          className="primary-button mt-6 w-full py-4 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || isLoadingBuyer || isLoadingShipping || !buyer || !hasCompleteAddress(buyer) || !selectedShipping}
          type="button"
          onClick={handleConfirmAddress}
        >
          {isSubmitting ? "جاري إنشاء الطلب..." : "تأكيد العنوان والمتابعة للدفع"}
        </button>
        <Link className="secondary-button mt-3 w-full py-3" href="/account/address?next=/checkout">
          تعديل العنوان
        </Link>
        <Link className="secondary-button mt-3 w-full py-3" href={vendorId ? `/cart?vendorId=${encodeURIComponent(vendorId)}` : "/cart"}>
          تعديل السلة
        </Link>
      </aside>
    </div>
  );
}

function AddressConfirmation({ user }: { user: ApiUser }) {
  const complete = hasCompleteAddress(user);

  return (
    <div className={`mt-8 rounded-2xl border p-5 ${complete ? "border-outline-variant/30 bg-white" : "border-error/30 bg-error-container/40"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-on-surface">العنوان المحفوظ</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{complete ? "راجع البيانات ثم اختر شركة الشحن للمتابعة." : "عنوانك ناقص. أكمله قبل الدفع."}</p>
        </div>
        <Link className="secondary-button px-5 py-3" href="/account/address?next=/checkout">
          تعديل العنوان
        </Link>
      </div>

      <dl className="mt-5 grid gap-3 md:grid-cols-2">
        <Info label="الاسم" value={user.name} />
        <Info label="رقم الجوال" value={user.phoneNumber} />
        <Info label="البلد" value={formatCountry(user.country)} />
        <Info label="المنطقة" value={user.region} />
        <Info label="المدينة" value={user.city} />
        <Info label="الحي" value={user.district} />
        <Info label="الشارع" value={user.street} />
        <Info label="رقم المبنى أو البيت" value={user.buildingNumber} />
        <Info label="الرمز البريدي" value={user.postalCode} />
        {user.country === "SA" ? <Info label="العنوان الوطني" value={user.nationalAddress} /> : null}
      </dl>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className={`rounded-xl p-4 ${value ? "bg-surface-container-low" : "bg-error-container/40"}`}>
      <dt className="text-sm font-bold text-on-surface-variant">{label}</dt>
      <dd className="mt-1 font-black text-on-surface">{value || "غير مكتمل"}</dd>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold text-on-surface-variant">{label}</span>
      <span className="font-black text-on-surface">{value}</span>
    </div>
  );
}

function useCartItems(vendorId?: string) {
  return useSyncExternalStore(subscribeToCart, () => readCart(vendorId), getEmptyCart);
}

function getEmptyCart(): CartItem[] {
  return [];
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

function formatPrice(value: number) {
  if (value === 0) {
    return "مجانا";
  }

  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatCountry(country?: string | null) {
  return country ? getCountryLabel(country) : "";
}
