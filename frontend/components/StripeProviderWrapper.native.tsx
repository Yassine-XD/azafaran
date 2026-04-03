import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import type { ReactNode } from "react";

export default function StripeProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.azafaran"
    >
      {children}
    </StripeProvider>
  );
}
