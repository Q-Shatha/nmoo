"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, createCheckoutSession } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function PaymentActions({ orderId }: { orderId: string }) {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handlePayment() {
    setMessage("");
    setIsLoading(true);

    const token = readCookie("nmoo_access_token");

    if (!token) {
      setMessage(t.paymentActionsLoginFirst);
      setIsLoading(false);
      return;
    }

    try {
      const session = await createCheckoutSession(orderId, token);

      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }

      setMessage(t.paymentActionsGatewayFailed);
    } catch (error) {
      setMessage(
        error instanceof ApiError && error.status === 503
          ? t.paymentActionsGatewayDisabled
          : t.paymentActionsStartFailed,
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6 grid gap-3">
      {message ? <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">{message}</p> : null}
      <button className="primary-button w-full py-4 disabled:cursor-not-allowed disabled:opacity-60" disabled={isLoading} type="button" onClick={handlePayment}>
        {isLoading ? t.paymentActionsOpening : t.paymentActionsPayNow}
      </button>
      <Link className="secondary-button w-full py-3" href="/orders">
        {t.paymentActionsBackToOrders}
      </Link>
    </div>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
