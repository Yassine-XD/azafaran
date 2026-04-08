import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import type { ReactNode } from "react";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function StripeProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <Elements stripe={stripePromise} options={{ mode: "payment", currency: "eur", amount: 0 }}>
      {children}
    </Elements>
  );
}
