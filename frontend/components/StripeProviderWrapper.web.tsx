import type { ReactNode } from "react";

// On web, Stripe Elements needs a PaymentIntent clientSecret at mount time,
// so we initialize it at the payment screen level, not at the app root.
// This wrapper is a simple passthrough.
export default function StripeProviderWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
