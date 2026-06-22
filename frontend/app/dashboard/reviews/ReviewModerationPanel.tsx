"use client";

import { useEffect, useState, useTransition } from "react";
import { FiCheck, FiX, FiRotateCcw } from "react-icons/fi";
import { Review, ReviewStatus, updateReviewStatus } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

function formatDate(value: string | Date, locale: string) {
  return new Date(value).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

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
  const { t } = useI18n();
  const [reviews, setReviews]       = useState<Review[]>(initialReviews);
  const [tab, setTab]               = useState<Tab>("ALL");
  const [isPending, startTransition] = useTransition();
  const [modalComment, setModalComment] = useState<string | null>(null);
  const [errorModal, setErrorModal]     = useState<string | null>(null);

  const STATUS_LABEL: Record<ReviewStatus, string> = {
    PENDING:  t.pendingReview,
    APPROVED: t.publishedReviews,
    REJECTED: t.rejectedReviews,
  };

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
        setErrorModal(t.updateReviewError);
      }
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "ALL",      label: `${t.allTab} (${counts.ALL})` },
    { key: "PENDING",  label: `${t.pendingReview} (${counts.PENDING})` },
    { key: "APPROVED", label: `${t.publishedReviews} (${counts.APPROVED})` },
    { key: "REJECTED", label: `${t.rejectedReviews} (${counts.REJECTED})` },
  ];

  return (
    <section className="dashboard-panel p-4 md:p-6">
      {errorModal && (
        <ErrorModal message={errorModal} onClose={() => setErrorModal(null)} />
      )}
      {modalComment && (
        <CommentModal comment={modalComment} onClose={() => setModalComment(null)} />
      )}
      {/* ── header: title + description + chip (same pattern as DiscountCodeManager) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-black text-on-surface">{t.productReviews}</h3>
          <p className="mt-2 text-on-surface-variant">
            {t.productReviewsDesc}
          </p>
        </div>
        <span className="chip px-4 py-2 text-sm">{t.reviewsCount(counts.ALL)}</span>
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
          <h3 className="text-xl font-black text-on-surface">{t.noReviewsInSection}</h3>
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
                statusLabel={STATUS_LABEL}
                t={t}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-outline-variant/20 md:block">
            <table className="w-full min-w-[800px] text-start">
              <thead>
                <tr className="bg-surface-container-low/60">
                  {[t.productColumn, t.customerColumn, t.ratingColumn, t.commentColumn, t.status, t.actionColumn].map((h) => (
                    <th
                      key={h}
                      className="border-b border-outline-variant/15 px-5 py-3 text-start text-sm font-bold text-on-surface-variant"
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
                    statusLabel={STATUS_LABEL}
                    t={t}
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
  const { t } = useI18n();
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
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          >
            ✕
          </button>
          <h4 className="text-lg font-black text-red-600">{t.errorOccurred}</h4>
        </div>
        <p className="leading-7 text-on-surface">{message}</p>
        <button
          onClick={onClose}
          className="primary-button mt-5 w-full py-3 text-center"
        >
          {t.okButton}
        </button>
      </div>
    </div>
  );
}

function CommentModal({ comment, onClose }: { comment: string; onClose: () => void }) {
  const { t } = useI18n();
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
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          >
            ✕
          </button>
          <h4 className="text-lg font-black text-on-surface">{t.fullComment}</h4>
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
  t,
}: {
  review: Review;
  isPending: boolean;
  onAction: (id: string, status: ReviewStatus) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="flex gap-2">
      {review.status !== "APPROVED" && (
        <button
          onClick={() => onAction(review.id, "APPROVED")}
          disabled={isPending}
          title={t.publish}
          aria-label={t.publish}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition"
        >
          <FiCheck className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      {review.status !== "REJECTED" && (
        <button
          onClick={() => onAction(review.id, "REJECTED")}
          disabled={isPending}
          title={t.rejectAction}
          aria-label={t.rejectAction}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
        >
          <FiX className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      {review.status !== "PENDING" && (
        <button
          onClick={() => onAction(review.id, "PENDING")}
          disabled={isPending}
          title={t.undoAction}
          aria-label={t.undoAction}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 transition"
        >
          <FiRotateCcw className="h-4 w-4" aria-hidden="true" />
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
  statusLabel,
  t,
}: {
  review: Review;
  isPending: boolean;
  onAction: (id: string, status: ReviewStatus) => void;
  onShowComment: (comment: string) => void;
  statusLabel: Record<ReviewStatus, string>;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-start shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[review.status]}`}>
          {statusLabel[review.status]}
        </span>
        <span className="font-black text-primary text-sm">{review.product?.title ?? t.productsColumn}</span>
      </div>
      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-on-surface-variant">{t.customerColumn}</span>
          <span className="font-bold text-on-surface">{review.user?.name ?? t.roleBuyer}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-on-surface-variant">{t.ratingColumn}</span>
          <Stars rating={review.rating} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-on-surface-variant">{t.date}</span>
          <span className="font-bold text-on-surface">{formatDate(review.createdAt, t.numberLocale)}</span>
        </div>
        {review.comment && (
          <div className="mt-1 rounded-xl bg-surface-container-low px-3 py-2 text-sm leading-6 text-on-surface">
            <p className="line-clamp-2">{review.comment}</p>
            <button
              onClick={() => onShowComment(review.comment!)}
              className="mt-1 text-xs font-bold text-primary hover:underline"
            >
              {t.viewAll}
            </button>
          </div>
        )}
      </div>
      <div className="mt-3">
        <ActionButtons review={review} isPending={isPending} onAction={onAction} t={t} />
      </div>
    </article>
  );
}

function DesktopReviewRow({
  review,
  isPending,
  onAction,
  onShowComment,
  statusLabel,
  t,
}: {
  review: Review;
  isPending: boolean;
  onAction: (id: string, status: ReviewStatus) => void;
  onShowComment: (comment: string) => void;
  statusLabel: Record<ReviewStatus, string>;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <tr className="hover:bg-surface-container-low/60">
      <td className="px-5 py-4 font-bold text-primary">{review.product?.title ?? "—"}</td>
      <td className="px-5 py-4 font-semibold">
        <div>{review.user?.name ?? t.roleBuyer}</div>
        {review.user?.city && (
          <div className="text-xs text-on-surface-variant">{review.user.city}</div>
        )}
        <div className="text-xs text-on-surface-variant">{formatDate(review.createdAt, t.numberLocale)}</div>
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
              {t.viewAll}
            </button>
          </div>
        ) : (
          <span className="italic">{t.noComment}</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_CLASS[review.status]}`}>
          {statusLabel[review.status]}
        </span>
      </td>
      <td className="px-5 py-4">
        <ActionButtons review={review} isPending={isPending} onAction={onAction} t={t} />
      </td>
    </tr>
  );
}
