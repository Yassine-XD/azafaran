import { Stack } from "expo-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import "@/global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="(tabs)" />
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
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
