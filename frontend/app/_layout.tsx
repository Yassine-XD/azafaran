import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "@/global.css";

// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = "pk_test_REPLACE_WITH_YOUR_KEY";

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage.getItem("onboarding_done");
      if (!done) {
        router.replace("/onboarding");
      }
    })();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.azafaran">
          <AuthProvider>
            <CartProvider>
              <NavigationGuard>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="shop" options={{ presentation: "card" }} />
                  <Stack.Screen name="product-detail" options={{ presentation: "card" }} />
                  <Stack.Screen name="deal-detail" options={{ presentation: "card" }} />
                  <Stack.Screen name="cart" options={{ presentation: "card" }} />
                  <Stack.Screen name="payment" options={{ presentation: "card" }} />
                  <Stack.Screen name="order-details" options={{ presentation: "card" }} />
                  <Stack.Screen name="addresses" options={{ presentation: "card" }} />
                  <Stack.Screen name="delivery-slots" options={{ presentation: "card" }} />
                  <Stack.Screen name="edit-profile" options={{ presentation: "card" }} />
                  <Stack.Screen name="notification-preferences" options={{ presentation: "card" }} />
                </Stack>
              </NavigationGuard>
            </CartProvider>
          </AuthProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
