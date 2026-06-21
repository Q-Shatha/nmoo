"use client";

import { useEffect, useState, useTransition } from "react";
import { Review, ReviewStatus, updateReviewStatus } from "@/lib/api";

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING:  "بانتظار المراجعة",
  APPROVED: "منشور",
  REJECTED: "مرفوض",
};

const STATUS_CLASS: Record<ReviewStatus, string> = {
  PENDING:  "status-pending",
  APPROVED: "status-completed",
  REJECTED: "status-cancelled",
};

type Tab = ReviewStatus | "ALL";

type Props = {
  token: string;
  initialReviews: Review[];
};

export function ReviewModerationPanel({ token, initialReviews }: Props) {
  const [reviews, setReviews]       = useState<Review[]>(initialReviews);
  const [tab, setTab]               = useState<Tab>("ALL");
  const [isPending, startTransition] = useTransition();
  const [modalComment, setModalComment] = useState<string | null>(null);
  const [errorModal, setErrorModal]     = useState<string | null>(null);

  const counts = {
    ALL:      reviews.length,
    PENDING:  reviews.filter((r) => r.status === "PENDING").length,
    APPROVED: reviews.filter((r) => r.status === "APPROVED").length,
    REJECTED: reviews.filter((r) => r.status === "REJECTED").length,
  };

  const visible = tab === "ALL" ? reviews : reviews.filter((r) => r.status === tab);

  function handleAction(reviewId: string, newStatus: ReviewStatus) {
    startTransition(async () => {
      try {
        await updateReviewStatus(reviewId, newStatus, token);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
      } catch {
        setErrorModal("تعذر تحديث حالة التقييم. حاول مرة أخرى.");
      }
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "ALL",      label: `الكل (${counts.ALL})` },
    { key: "PENDING",  label: `بانتظار المراجعة (${counts.PENDING})` },
    { key: "APPROVED", label: `منشورة (${counts.APPROVED})` },
    { key: "REJECTED", label: `مرفوضة (${counts.REJECTED})` },
  ];

  return (
    <section className="dashboard-panel p-4 md:p-6" dir="rtl">
      {errorModal && (
        <ErrorModal message={errorModal} onClose={() => setErrorModal(null)} />
      )}
      {modalComment && (
        <CommentModal comment={modalComment} onClose={() => setModalComment(null)} />
      )}
      {/* ── header: title + description + chip (same pattern as DiscountCodeManager) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-black text-on-surface">تقييمات المنتجات</h3>
          <p className="mt-2 text-on-surface-variant">
            راجع ما يكتبه عملاؤك عن منتجاتك — وافق على التقييمات لتظهر في صفحة المنتج.
          </p>
        </div>
        <span className="chip px-4 py-2 text-sm">{counts.ALL} تقييم</span>
      </div>

      {/* ── filter tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.key
                ? "bg-primary text-white"
                : "border border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── content */}
      {visible.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-outline-variant bg-surface p-8 text-center">
          <h3 className="text-xl font-black text-on-surface">لا توجد تقييمات في هذا القسم</h3>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="mt-5 grid gap-3 md:hidden">
            {visible.map((review) => (
              <MobileReviewCard
                key={review.id}
                review={review}
                isPending={isPending}
                onAction={handleAction}
                onShowComment={setModalComment}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-outline-variant/20 md:block">
            <table className="w-full min-w-[800px] text-right">
              <thead>
                <tr className="bg-surface-container-low/60">
                  {["المنتج", "العميل", "التقييم", "التعليق", "الحالة", "الإجراء"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-outline-variant/15 px-5 py-3 text-sm font-bold text-on-surface-variant"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {visible.map((review) => (
                  <DesktopReviewRow
                    key={review.id}
                    review={review}
                    isPending={isPending}
                    onAction={handleAction}
                    onShowComment={setModalComment}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function ErrorModal({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          >
            ✕
          </button>
          <h4 className="text-lg font-black text-red-600">حدث خطأ</h4>
        </div>
        <p className="leading-7 text-on-surface">{message}</p>
        <button
          onClick={onClose}
          className="primary-button mt-5 w-full py-3 text-center"
        >
          حسناً
        </button>
      </div>
    </div>
  );
}

function CommentModal({ comment, onClose }: { comment: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-2xl"
        style={{ backgroundColor: "var(--color-surface)", minWidth: "min(90vw, 480px)" }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          >
            ✕
          </button>
          <h4 className="text-lg font-black text-on-surface">التعليق الكامل</h4>
        </div>
        <p className="leading-8 text-on-surface">{comment}</p>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-outline-variant/30"}>
          ★
        </span>
      ))}
    </span>
  );
}

function ActionButtons({
  review,
  isPending,
  onAction,
}: {
  review: Review;
  isPending: boolean;
  onAction: (id: string, status: ReviewStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {review.status !== "APPROVED" && (
        <button
          onClick={() => onAction(review.id, "APPROVED")}
          disabled={isPending}
          className="secondary-button px-3 py-1.5 text-sm !text-emerald-700 !border-emerald-200 hover:!bg-emerald-50 disabled:opacity-50"
        >
          ✓ نشر
        </button>
      )}
      {review.status !== "REJECTED" && (
        <button
          onClick={() => onAction(review.id, "REJECTED")}
          disabled={isPending}
          className="secondary-button px-3 py-1.5 text-sm !text-red-600 !border-red-200 hover:!bg-red-50 disabled:opacity-50"
        >
          ✕ رفض
        </button>
      )}
      {review.status !== "PENDING" && (
        <button
          onClick={() => onAction(review.id, "PENDING")}
          disabled={isPending}
          className="secondary-button px-3 py-1.5 text-sm disabled:opacity-50"
        >
          ↩ إلغاء
        </button>
      )}
    </div>
  );
}

function MobileReviewCard({
  review,
  isPending,
  onAction,
  onShowComment,
}: {
  review: Review;
  isPending: boolean;
  onAction: (id: string, status: ReviewStatus) => void;
  onShowComment: (comment: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-right shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[review.status]}`}>
          {STATUS_LABEL[review.status]}
        </span>
        <span className="font-black text-primary text-sm">{review.product?.title ?? "منتج"}</span>
      </div>
      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-on-surface-variant">العميل</span>
          <span className="font-bold text-on-surface">{review.user?.name ?? "عميل"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-on-surface-variant">التقييم</span>
          <Stars rating={review.rating} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-on-surface-variant">التاريخ</span>
          <span className="font-bold text-on-surface">{formatDate(review.createdAt)}</span>
        </div>
        {review.comment && (
          <div className="mt-1 rounded-xl bg-surface-container-low px-3 py-2 text-sm leading-6 text-on-surface">
            <p className="line-clamp-2">{review.comment}</p>
            <button
              onClick={() => onShowComment(review.comment!)}
              className="mt-1 text-xs font-bold text-primary hover:underline"
            >
              عرض الكل
            </button>
          </div>
        )}
      </div>
      <div className="mt-3">
        <ActionButtons review={review} isPending={isPending} onAction={onAction} />
      </div>
    </article>
  );
}

function DesktopReviewRow({
  review,
  isPending,
  onAction,
  onShowComment,
}: {
  review: Review;
  isPending: boolean;
  onAction: (id: string, status: ReviewStatus) => void;
  onShowComment: (comment: string) => void;
}) {
  return (
    <tr className="hover:bg-surface-container-low/60">
      <td className="px-5 py-4 font-bold text-primary">{review.product?.title ?? "—"}</td>
      <td className="px-5 py-4 font-semibold">
        <div>{review.user?.name ?? "عميل"}</div>
        {review.user?.city && (
          <div className="text-xs text-on-surface-variant">{review.user.city}</div>
        )}
        <div className="text-xs text-on-surface-variant">{formatDate(review.createdAt)}</div>
      </td>
      <td className="px-5 py-4">
        <Stars rating={review.rating} />
        <span className="text-xs text-on-surface-variant">{review.rating}/5</span>
      </td>
      <td className="max-w-xs px-5 py-4 text-sm text-on-surface-variant">
        {review.comment ? (
          <div>
            <p className="line-clamp-2">{review.comment}</p>
            <button
              onClick={() => onShowComment(review.comment!)}
              className="mt-1 text-xs font-bold text-primary hover:underline"
            >
              عرض الكل
            </button>
          </div>
        ) : (
          <span className="italic">بدون تعليق</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_CLASS[review.status]}`}>
          {STATUS_LABEL[review.status]}
        </span>
      </td>
      <td className="px-5 py-4">
        <ActionButtons review={review} isPending={isPending} onAction={onAction} />
      </td>
    </tr>
  );
}
