import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StripeProviderWrapper from "@/components/StripeProviderWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "@/global.css";

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    (async () => {
      const onboardingDone = await AsyncStorage.getItem("onboarding_done");

      if (!onboardingDone) {
        if (!isAuthenticated) {
          const langSaved = await AsyncStorage.getItem("preferred_lang");
          if (!langSaved) {
            router.replace("/language-select");
          } else {
            router.replace("/onboarding");
          }
        } else {
          // Authenticated but didn't finish onboarding (e.g. app killed mid-flow)
          router.replace("/terms-accept");
        }
      }
      // If onboarding_done is set, user completed the full flow — let them in
    })();
  }, [isLoading, isAuthenticated]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <StripeProviderWrapper>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <NavigationGuard>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="onboarding" />
                      <Stack.Screen name="language-select" />
                      <Stack.Screen name="login" />
                      <Stack.Screen name="register" />
                      <Stack.Screen name="profile-setup" />
                      <Stack.Screen name="terms-accept" />
                      <Stack.Screen name="policies" options={{ presentation: "card" }} />
                      <Stack.Screen name="shop" options={{ presentation: "card" }} />
                      <Stack.Screen name="product-detail" options={{ presentation: "card" }} />
                      <Stack.Screen name="deal-detail" options={{ presentation: "card" }} />
                      <Stack.Screen name="cart" options={{ presentation: "card" }} />
                      <Stack.Screen name="payment" options={{ presentation: "card" }} />
                      <Stack.Screen name="order-details" options={{ presentation: "card" }} />
                      <Stack.Screen name="addresses" options={{ presentation: "card" }} />
                      <Stack.Screen name="edit-profile" options={{ presentation: "card" }} />
                      <Stack.Screen name="notification-preferences" options={{ presentation: "card" }} />
                      <Stack.Screen name="support" options={{ presentation: "card" }} />
                      <Stack.Screen name="support-new" options={{ presentation: "card" }} />
                      <Stack.Screen name="support-ticket" options={{ presentation: "card" }} />
                    </Stack>
                  </NavigationGuard>
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </StripeProviderWrapper>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
