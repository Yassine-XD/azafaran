import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const DELIVERY_FEE = 2.99;
const FREE_DELIVERY_THRESHOLD = 30;

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, itemCount, isLoading, updateItem, removeItem, applyPromo } = useCart();

  let subtotal = 0;
  if(!subtotal) {
    items.forEach((item)=> {
      subtotal = (item.quantity * item.current_price);
    })
  }

  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    const result = await applyPromo(promoCode.trim().toUpperCase());
    setApplyingPromo(false);
    if (result.success) {
      Alert.alert("Código aplicado", "Descuento aplicado correctamente");
    } else {
      Alert.alert("Error", result.error || "Código no válido");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push("/payment");
  };

  if (items.length === 0 && !isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="px-4 py-3 flex-row items-center border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground ml-2">Carrito</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <ShoppingBag size={64} className="text-muted-foreground mb-4" />
          <Text className="text-xl font-bold text-foreground mb-2">Tu carrito está vacío</Text>
          <Text className="text-muted-foreground text-center mb-6">Añade productos para empezar tu pedido</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)")} className="bg-primary px-8 py-3 rounded-xl">
            <Text className="text-primary-foreground font-bold">Explorar Productos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">Carrito ({itemCount})</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {items.map((item) => (
          <View key={item.id} className="mx-4 mt-4 bg-card rounded-xl border border-border p-4">
            <View className="flex-row">
              <Image
                source={{ uri: item.product_images[0].url || "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200" }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold" numberOfLines={2}>{item.product_name}</Text>
                <Text className="text-muted-foreground text-xs mt-0.5">{item.weight_label}</Text>
                <Text className="text-primary font-bold mt-1">€{item.current_price ? Number(item.current_price).toFixed(2) : "0.00"}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)} className="p-1">
                <Trash2 size={18} className="text-destructive" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-end mt-3 gap-3">
              <TouchableOpacity
                onPress={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                className="w-8 h-8 bg-muted rounded-full items-center justify-center"
              >
                <Minus size={14} className="text-foreground" />
              </TouchableOpacity>
              <Text className="text-foreground font-bold text-base w-6 text-center">{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateItem(item.id, item.quantity + 1)}
                className="w-8 h-8 bg-primary rounded-full items-center justify-center"
              >
                <Plus size={14} className="text-primary-foreground" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Promo Code */}
        <View className="mx-4 mt-4 flex-row items-center bg-card rounded-xl border border-border px-4 py-3">
          <Tag size={18} className="text-muted-foreground mr-3" />
          <TextInput
            className="flex-1 text-foreground text-base"
            placeholder="Código promocional"
            placeholderTextColor="#a8a29e"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity onPress={handleApplyPromo} disabled={applyingPromo} className="bg-primary px-4 py-2 rounded-lg">
            {applyingPromo ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-primary-foreground font-semibold text-sm">Aplicar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View className="mx-4 mt-4 bg-card rounded-xl border border-border p-4">
          <Text className="text-foreground font-bold text-lg mb-3">Resumen</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Subtotal</Text>
            <Text className="text-foreground font-medium">€{subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Envío</Text>
            <Text className={deliveryFee === 0 ? "text-green-600 font-medium" : "text-foreground font-medium"}>
              {deliveryFee === 0 ? "GRATIS" : `€${deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          {deliveryFee > 0 && (
            <Text className="text-xs text-muted-foreground mb-2">
              Envío gratis a partir de €{FREE_DELIVERY_THRESHOLD}
            </Text>
          )}
          <View className="border-t border-border mt-2 pt-3 flex-row justify-between">
            <Text className="text-foreground font-bold text-lg">Total</Text>
            <Text className="text-primary font-bold text-lg">€{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <TouchableOpacity onPress={handleCheckout} className="bg-primary py-4 rounded-xl items-center">
          <Text className="text-primary-foreground font-bold text-lg">Finalizar Pedido · €{total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
