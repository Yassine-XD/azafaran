import { useStripe } from "@stripe/stripe-react-native";

type User = { first_name: string; last_name: string; email: string } | null;
type PayResult = { success: boolean; error?: string; cancelled?: boolean };

export function useStripePay() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const payWithCard = async (clientSecret: string, user: User): Promise<PayResult> => {
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Azafaran - Carnes Halal",
      defaultBillingDetails: {
        name: user ? `${user.first_name} ${user.last_name}` : undefined,
        email: user?.email,
      },
      style: "automatic",
    });

    if (initError) {
      return { success: false, error: initError.message };
    }

    const { error: payError } = await presentPaymentSheet();

    if (payError) {
      if (payError.code === "Canceled") {
        return { success: false, cancelled: true };
      }
      return { success: false, error: payError.message };
    }

    return { success: true };
  };

  // No CardField needed on native — Payment Sheet handles the UI
  return { payWithCard, CardField: null };
}
