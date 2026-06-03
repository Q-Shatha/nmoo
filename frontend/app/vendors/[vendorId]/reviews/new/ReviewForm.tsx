"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, createReview, ReviewableProduct } from "@/lib/api";

export function ReviewForm({ products, profileHref }: { products: ReviewableProduct[]; profileHref: string }) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const token = readCookie("nmoo_access_token");
      await createReview({ productId, rating, comment }, token);
      router.push(`${profileHref}#reviews`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ المراجعة.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (products.length === 0) {
    return (
      <section className="panel mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-black text-primary">لا توجد منتجات مشتراة للمراجعة</h1>
        <p className="mt-3 leading-8 text-on-surface-variant">يمكنك كتابة مراجعة فقط على المنتجات التي اشتريتها من هذا المتجر.</p>
      </section>
    );
  }

  return (
    <form className="panel mx-auto grid max-w-3xl gap-6 p-6 text-right md:p-8" dir="rtl" onSubmit={handleSubmit}>
      <div>
        <p className="chip px-4 py-2 text-sm">مراجعة المتجر</p>
        <h1 className="mt-4 text-3xl font-black text-on-surface">اكتب مراجعتك</h1>
        <p className="mt-2 leading-8 text-on-surface-variant">اختر منتجاً اشتريته من هذا التاجر، ثم أضف تقييمك وتعليقك عن التجربة.</p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-bold text-on-surface">المنتج المشترى</span>
        <select className="input-field px-4 py-3 text-right" required value={productId} onChange={(event) => setProductId(event.target.value)}>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-2">
        <span className="text-sm font-bold text-on-surface">التقييم</span>
        <div className="flex justify-end gap-2" dir="ltr">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = value <= rating;

            return (
              <button
                key={value}
                aria-label={`${value} من 5`}
                aria-pressed={selected}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition ${
                  selected ? "border-primary bg-primary text-on-primary" : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
                type="button"
                onClick={() => setRating(value)}
              >
                {selected ? "★" : "☆"}
              </button>
            );
          })}
        </div>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-bold text-on-surface">تعليقك</span>
        <textarea
          className="input-field min-h-36 resize-y px-4 py-3 text-right leading-8"
          maxLength={700}
          placeholder="اكتب رأيك عن المنتج، الشحن، التغليف، أو التعامل مع المتجر..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>

      {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="primary-button px-8 py-4 disabled:opacity-60" disabled={isSubmitting || !productId || rating === 0} type="submit">
          {isSubmitting ? "جاري الحفظ..." : "نشر المراجعة"}
        </button>
        <button className="secondary-button px-8 py-4" type="button" onClick={() => router.push(`${profileHref}#reviews`)}>
          رجوع للمراجعات
        </button>
      </div>
    </form>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
