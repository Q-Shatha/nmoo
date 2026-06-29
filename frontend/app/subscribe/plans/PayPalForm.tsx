"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

type PlanKey = "free" | "standard" | "premium";

const PLAN_AMOUNTS: Record<PlanKey, string> = {
  free: "0.00",
  standard: "12.00",
  premium: "24.00",
};

interface Props {
  plan: PlanKey;
  isAr: boolean;
}

export function PayPalForm({ plan, isAr }: Props) {
  const router = useRouter();
  const amount = PLAN_AMOUNTS[plan];

  return (
    <div className="mt-4">
      <style>{`
        .paypal-powered-by, [data-pp-message], .paypal-logo-color { display: none !important; }
        iframe[name*="__zoid__paypal_checkout_sandbox_modal"] { display: none !important; }
      `}</style>
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          currency: "USD",
          locale: isAr ? "ar_EG" : "en_US",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "pay" }}
          createOrder={(_data, actions) =>
            actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: { currency_code: "USD", value: amount },
                  description: isAr
                    ? `اشتراك الباقة ${plan === "standard" ? "القياسية" : "المميزة"}`
                    : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
                },
              ],
            })
          }
          onApprove={async (_data, actions) => {
            await actions.order!.capture();
            router.push(`/subscribe/callback?status=paid&plan=${plan}`);
          }}
          onError={(err) => {
            console.error("PayPal error", err);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
