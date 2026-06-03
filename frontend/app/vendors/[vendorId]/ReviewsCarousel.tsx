"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Review } from "@/lib/api";

type ReviewsCarouselProps = {
  reviews: Review[];
  fallbackReviews?: Review[];
  fallbackContext?: string;
};

export function ReviewsCarousel({ reviews, fallbackReviews = [], fallbackContext = "المتجر" }: ReviewsCarouselProps) {
  const visibleReviews = reviews.length > 0 ? reviews : fallbackReviews;
  const [activeIndex, setActiveIndex] = useState(visibleReviews.length > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [stepWidth, setStepWidth] = useState(354);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayReviews = visibleReviews.length > 1 ? [visibleReviews[visibleReviews.length - 1], ...visibleReviews, visibleReviews[0]] : visibleReviews;
  const visibleIndex = visibleReviews.length > 1 ? ((activeIndex - 1 + visibleReviews.length) % visibleReviews.length) : 0;

  useEffect(() => {
    setActiveIndex(visibleReviews.length > 1 ? 1 : 0);
  }, [visibleReviews.length]);

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
      setActiveIndex((current) => current + 1);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [visibleReviews.length]);

  const trackStyle = useMemo(
    () => ({
      transform: `translateX(-${activeIndex * stepWidth}px)`,
    }),
    [activeIndex, stepWidth],
  );

  function movePrevious() {
    if (visibleReviews.length <= 1) {
      return;
    }

    setIsTransitioning(true);
    setActiveIndex((current) => current - 1);
  }

  function moveNext() {
    if (visibleReviews.length <= 1) {
      return;
    }

    setIsTransitioning(true);
    setActiveIndex((current) => current + 1);
  }

  function handleTransitionEnd() {
    if (visibleReviews.length <= 1) {
      return;
    }

    if (activeIndex === 0) {
      setIsTransitioning(false);
      setActiveIndex(visibleReviews.length);
      window.requestAnimationFrame(() => setIsTransitioning(true));
    }

    if (activeIndex === visibleReviews.length + 1) {
      setIsTransitioning(false);
      setActiveIndex(1);
      window.requestAnimationFrame(() => setIsTransitioning(true));
    }
  }

  if (visibleReviews.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest p-7 text-center font-bold text-on-surface-variant">
        لا توجد مراجعات بعد.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button className="secondary-button px-5 py-3 text-sm text-primary" type="button" onClick={() => setIsModalOpen(true)}>
          عرض كل المراجعات
        </button>
        <span className="text-sm font-bold text-on-surface-variant">
          {visibleIndex + 1} / {visibleReviews.length}
        </span>
      </div>

      <div className="relative px-12 sm:px-14">
        <button aria-label="التقييم السابق" className="absolute right-0 top-1/2 z-10 -translate-y-1/2 border border-outline-variant bg-surface-container-lowest shadow-sm icon-button" onClick={movePrevious} type="button">
          <ArrowLeftIcon />
        </button>

        <div className="overflow-hidden" dir="ltr">
          <div className={`flex w-max gap-6 ${isTransitioning ? "transition-transform duration-700 ease-out" : ""}`} style={trackStyle} onTransitionEnd={handleTransitionEnd}>
            {displayReviews.map((review, reviewIndex) => (
              <ReviewCard key={`${review.id}-${reviewIndex}`} fallbackContext={fallbackContext} review={review} />
            ))}
          </div>
        </div>

        <button aria-label="التقييم التالي" className="absolute left-0 top-1/2 z-10 -translate-y-1/2 border border-outline-variant bg-surface-container-lowest shadow-sm icon-button" onClick={moveNext} type="button">
          <ArrowRightIcon />
        </button>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between gap-4 border-b border-outline-variant/25 px-6 py-5">
              <button className="icon-button border border-outline-variant bg-surface-container-lowest" type="button" onClick={() => setIsModalOpen(false)} aria-label="إغلاق">
                <CloseIcon />
              </button>
              <div className="text-right">
                <h3 className="text-2xl font-black text-on-surface">كل المراجعات</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{visibleReviews.length} مراجعة</p>
              </div>
            </div>
            <div className="grid max-h-[68vh] gap-4 overflow-y-auto p-6 md:grid-cols-2">
              {visibleReviews.map((review) => (
                <ReviewCard key={`modal-${review.id}`} fallbackContext={fallbackContext} review={review} compact />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReviewCard({ compact = false, fallbackContext, review }: { compact?: boolean; fallbackContext: string; review: Review }) {
  const name = review.user?.name ?? "عميل";
  const city = review.user?.city ?? "عميل نمو";
  const productTitle = review.product?.title;
  const text = review.comment || `تجربة موفقة مع ${fallbackContext}.`;

  return (
    <article className={`${compact ? "w-full" : "w-[330px] sm:w-[390px]"} shrink-0 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest p-7 text-right shadow-sm`} dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-sm font-black text-on-primary-container">
            {review.user?.avatarUrl ? <Image alt={name} className="object-cover" src={review.user.avatarUrl} fill sizes="48px" unoptimized /> : getInitials(name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-black text-on-surface">{name}</h3>
            <p className="truncate text-sm text-on-surface-variant">{productTitle ? `${city} · ${productTitle}` : city}</p>
          </div>
        </div>
        <span className="shrink-0 text-primary">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
      </div>
      <p className={`${compact ? "" : "line-clamp-3"} mt-5 leading-8 text-on-surface-variant`}>“{text}”</p>
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

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}
