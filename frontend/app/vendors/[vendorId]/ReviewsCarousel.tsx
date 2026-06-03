"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ApiUser, Review } from "@/lib/api";

type ReviewsCarouselProps = {
  reviews: Review[];
  fallbackReviews: Review[];
  vendor: ApiUser;
};

export function ReviewsCarousel({ reviews, fallbackReviews, vendor }: ReviewsCarouselProps) {
  const visibleReviews = reviews.length > 0 ? reviews : fallbackReviews;
  const [index, setIndex] = useState(0);
  const [stepWidth, setStepWidth] = useState(354);
  const maxIndex = Math.max(visibleReviews.length - 1, 0);

  useEffect(() => {
    function updateStepWidth() {
      setStepWidth(window.innerWidth >= 640 ? 414 : 354);
    }

    updateStepWidth();
    window.addEventListener("resize", updateStepWidth);

    return () => window.removeEventListener("resize", updateStepWidth);
  }, []);

  useEffect(() => {
    if (visibleReviews.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 4500);

    return () => window.clearInterval(timer);
  }, [maxIndex, visibleReviews.length]);

  const trackStyle = useMemo(
    () => ({
      transform: `translateX(-${index * stepWidth}px)`,
    }),
    [index, stepWidth],
  );

  function movePrevious() {
    setIndex((current) => (current <= 0 ? maxIndex : current - 1));
  }

  function moveNext() {
    setIndex((current) => (current >= maxIndex ? 0 : current + 1));
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-on-surface-variant">
          {index + 1} / {visibleReviews.length}
        </span>
        <div className="flex gap-2">
          <button aria-label="التقييم السابق" className="icon-button border border-outline-variant bg-surface-container-lowest" onClick={movePrevious} type="button">
            <ArrowRightIcon />
          </button>
          <button aria-label="التقييم التالي" className="icon-button border border-outline-variant bg-surface-container-lowest" onClick={moveNext} type="button">
            <ArrowLeftIcon />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" dir="ltr">
        <div className="flex w-max gap-6 transition-transform duration-700 ease-out" style={trackStyle}>
          {visibleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              avatarUrl={review.user?.avatarUrl}
              city={review.user?.city ?? "عميل نمو"}
              initials={getInitials(review.user?.name ?? "عميل")}
              name={review.user?.name ?? "عميل"}
              productTitle={review.product?.title}
              rating={review.rating}
              text={review.comment || `تجربة موفقة مع متجر ${vendor.name}.`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ avatarUrl, city, initials, name, productTitle, rating, text }: { avatarUrl?: string | null; city: string; initials: string; name: string; productTitle?: string; rating: number; text: string }) {
  return (
    <article className="w-[330px] shrink-0 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest p-7 text-right shadow-sm sm:w-[390px]" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-sm font-black text-on-primary-container">
            {avatarUrl ? <Image alt={name} className="object-cover" src={avatarUrl} fill sizes="48px" unoptimized /> : initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-black text-on-surface">{name}</h3>
            <p className="truncate text-sm text-on-surface-variant">{productTitle ? `${city} · ${productTitle}` : city}</p>
          </div>
        </div>
        <span className="shrink-0 text-primary">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
      </div>
      <p className="mt-5 line-clamp-3 leading-8 text-on-surface-variant">“{text}”</p>
    </article>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "ع") + (parts[1]?.[0] ?? "");
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M15 6 9 12l6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}
