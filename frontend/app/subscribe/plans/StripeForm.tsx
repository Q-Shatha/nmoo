"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

type PlanKey = "free" | "standard" | "premium";

const PLAN_AMOUNTS_USD: Record<PlanKey, number> = {
  free: 0,
  standard: 12,
  premium: 24,
};

interface FormProps {
  plan: PlanKey;
  isAr: boolean;
}

function CheckoutForm({ plan, isAr }: FormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) return;

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment error");
      setLoading(false);
      return;
    }

    // TODO: send paymentMethod.id to backend to create subscription
    // For now simulate success
    console.log("PaymentMethod created:", paymentMethod.id);
    setSucceeded(true);
    setTimeout(() => router.push(`/subscribe/callback?status=paid&plan=${plan}`), 1000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-outline-variant/40 bg-white p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1a1a1a",
                "::placeholder": { color: "#9ca3af" },
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-error-container/60 px-4 py-3 text-sm font-bold text-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || succeeded}
        className="primary-button w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {succeeded
          ? (isAr ? "تم الدفع ✓" : "Payment successful ✓")
          : loading
          ? (isAr ? "جاري المعالجة..." : "Processing...")
          : isAr
          ? `ادفع $${PLAN_AMOUNTS_USD[plan]} USD`
          : `Pay $${PLAN_AMOUNTS_USD[plan]} USD`}
      </button>

      <p className="text-center text-xs text-on-surface-variant">
        {isAr ? "مدفوعات آمنة عبر Stripe" : "Secure payment via Stripe"}
      </p>
    </form>
  );
}

export function StripeForm({ plan, isAr }: FormProps) {
  return (
    <div className="mt-6">
      <Elements
        stripe={stripePromise}
        options={{ locale: isAr ? "ar" : "en" }}
      >
        <CheckoutForm plan={plan} isAr={isAr} />
      </Elements>
    </div>
  );
}
