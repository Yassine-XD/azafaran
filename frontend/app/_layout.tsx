import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from "@expo-google-fonts/jetbrains-mono";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";

import "@/global.css";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import StripeProviderWrapper from "@/components/StripeProviderWrapper";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import { NavigationGuard } from "@/components/NavigationGuard";
import { NotificationsBridge } from "@/components/NotificationsBridge";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StripeProviderWrapper>
              <LanguageProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <CartProvider>
                      <NavigationGuard>
                        <NotificationsBridge />
                        <StatusBar style="dark" />
                        <Stack
                          screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: "#FFFFFF" },
                            animation: "slide_from_right",
                          }}
                        >
                          <Stack.Screen name="(tabs)" />
                          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
                          <Stack.Screen name="language-select" options={{ presentation: "modal" }} />
                          <Stack.Screen name="login" options={{ presentation: "modal" }} />
                          <Stack.Screen name="register" options={{ presentation: "modal" }} />
                          <Stack.Screen name="terms-accept" options={{ presentation: "modal" }} />
                          <Stack.Screen name="cart" options={{ presentation: "modal" }} />
                          <Stack.Screen name="checkout" />
                          <Stack.Screen name="product/[id]" />
                          <Stack.Screen name="category/[slug]" />
                        </Stack>
                      </NavigationGuard>
                    </CartProvider>
                  </NotificationProvider>
                </AuthProvider>
              </LanguageProvider>
            </StripeProviderWrapper>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
