import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// Mock Data
const CART_ITEMS = [
  {
    id: "1",
    name: "Pechuga de Pollo",
    weight: "500g",
    price: 5.5,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    name: "Chuletón de Ternera",
    weight: "1kg",
    price: 24.9,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    name: "Salchichas Ibéricas",
    weight: "400g",
    price: 8.5,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&auto=format&fit=crop&q=60",
  },
];

type CartItem = (typeof CART_ITEMS)[0];

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(CART_ITEMS);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 30 ? 0 : 2.99;
  const total = subtotal + deliveryFee;

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className="bg-card rounded-2xl p-4 mb-4 flex-row items-center border border-border">
      {/* Product Image */}
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />

      {/* Product Details */}
      <View className="flex-1 ml-4 justify-between h-20">
        <View>
          <Text
            className="text-foreground font-semibold text-base mb-1"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text className="text-muted-foreground text-sm">{item.weight}</Text>
        </View>
        <Text className="text-primary font-bold text-lg">
          €{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      {/* Quantity & Actions */}
      <View className="ml-4 items-end justify-between h-20">
        <TouchableOpacity onPress={() => removeItem(item.id)} className="p-2">
          <Trash2 size={18} className="text-muted-foreground" />
        </TouchableOpacity>

        <View className="flex-row items-center bg-input rounded-lg px-2 py-1">
          <TouchableOpacity
            onPress={() => updateQuantity(item.id, -1)}
            className="p-1"
            disabled={item.quantity <= 1}
          >
            <Minus
              size={16}
              className={
                item.quantity <= 1
                  ? "text-muted-foreground/50"
                  : "text-foreground"
              }
            />
          </TouchableOpacity>
          <Text className="text-foreground font-semibold mx-3 min-w-[20px] text-center">
            {item.quantity}
          </Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id, 1)}
            className="p-1"
          >
            <Plus size={16} className="text-foreground" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const EmptyCart = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-muted rounded-full p-6 mb-4">
        <ShoppingBag size={48} className="text-muted-foreground" />
      </View>
      <Text className="text-xl font-bold text-foreground mb-2">
        Tu carrito está vacío
      </Text>
      <Text className="text-muted-foreground text-center mb-6">
        Añade algunos productos frescos para empezar tu pedido.
      </Text>
      <TouchableOpacity className="bg-primary rounded-xl px-6 py-3">
        <Text className="text-primary-foreground font-semibold">
          Empezar a comprar
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top", "left", "right"]}
      >
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">Mi Carrito</Text>
        </View>
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Mi Carrito</Text>
          <Text className="text-sm text-muted-foreground">
            {items.length} artículos
          </Text>
        </View>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 300 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Order Summary - Fixed at bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-6 rounded-t-3xl shadow-lg">
        {/* Promo Code */}
        <View className="flex-row items-center bg-input rounded-xl px-4 py-3 mb-4">
          <Text className="text-muted-foreground flex-1">
            Código promocional
          </Text>
          <TouchableOpacity>
            <Text className="text-primary font-semibold">Aplicar</Text>
          </TouchableOpacity>
        </View>

        {/* Totals */}
        <View className="space-y-2 mb-4">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Subtotal</Text>
            <Text className="text-foreground font-medium">
              €{subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Envío</Text>
            <Text className="text-foreground font-medium">
              {deliveryFee === 0 ? (
                <Text className="text-primary">Gratis</Text>
              ) : (
                `€${deliveryFee.toFixed(2)}`
              )}
            </Text>
          </View>
          {subtotal < 30 && (
            <Text className="text-xs text-muted-foreground">
              Añade €{(30 - subtotal).toFixed(2)} más para envío gratis
            </Text>
          )}
          <View className="h-px bg-border my-2" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-foreground">Total</Text>
            <Text className="text-lg font-bold text-primary">
              €{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          onPress={() => router.push("/payment")}
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          <LinearGradient
            colors={["#ea580c", "#c2410c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-white font-bold text-lg mr-2">
              Finalizar Pedido
            </Text>
            <ArrowRight size={20} className="text-white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
