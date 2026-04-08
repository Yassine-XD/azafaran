import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

type User = { first_name: string; last_name: string; email: string } | null;
type PayResult = { success: boolean; error?: string; cancelled?: boolean };

export function useStripePay() {
  const stripe = useStripe();
  const elements = useElements();

  const payWithCard = async (clientSecret: string, _user: User): Promise<PayResult> => {
    if (!stripe || !elements) {
      return { success: false, error: "Stripe not loaded" };
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + "/orders",
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Payment failed" };
    }

    return { success: true };
  };

  return { payWithCard, CardField: PaymentElement };
}
