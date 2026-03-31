import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Check, Shield, Clock } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { Product, ProductVariant } from "@/lib/types";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, itemCount } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    (async () => {
      const [productRes, variantRes] = await Promise.all([
        api.get<Product>(`/products/${id}`, false),
        api.get<ProductVariant[]>(`/products/${id}/variants`, false),
      ]);
      if (productRes.success && productRes.data) setProduct(productRes.data);
      if (variantRes.success && variantRes.data) {
        const active = variantRes.data.filter((v) => v.is_active && v.stock_qty > 0);
        setVariants(active);
        if (active.length > 0) setSelectedVariant(active[0]);
      }
      setIsLoading(false);
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    const result = await addItem(selectedVariant.id, quantity, {
      product_name: product?.name,
      product_image: product?.image_url,
      weight_label: selectedVariant.weight_label,
      price: Number(selectedVariant.price),
    });
    setAddingToCart(false);
    if (result.success) {
      Alert.alert("Añadido", `${product?.name} añadido al carrito`);
    } else {
      Alert.alert("Error", result.error || "No se pudo añadir");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground text-lg">Producto no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const price = selectedVariant ? Number(selectedVariant.price) : 0;
  const comparePrice = selectedVariant?.compare_at_price ? Number(selectedVariant.compare_at_price) : null;
  const total = price * quantity;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: product.image_url || "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800" }}
            className="w-full h-72"
            resizeMode="cover"
          />
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
            >
              <ArrowLeft size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center relative"
            >
              <ShoppingCart size={20} color="white" />
              {itemCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-primary w-4 h-4 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 pt-5">
          {/* Name & Rating */}
          <Text className="text-2xl font-bold text-foreground mb-1">{product.name}</Text>
          {product.category_name && (
            <Text className="text-muted-foreground text-sm mb-3">{product.category_name}</Text>
          )}

          {/* Price */}
          <View className="flex-row items-baseline gap-3 mb-4">
            <Text className="text-primary text-3xl font-bold">€{price.toFixed(2)}</Text>
            {comparePrice && comparePrice > price && (
              <Text className="text-muted-foreground text-lg line-through">€{comparePrice.toFixed(2)}</Text>
            )}
          </View>

          {/* Variant Selection */}
          {variants.length > 1 && (
            <View className="mb-5">
              <Text className="text-foreground font-semibold mb-3">Peso / Formato</Text>
              <View className="flex-row flex-wrap gap-3">
                {variants.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => { setSelectedVariant(v); setQuantity(1); }}
                    className={`px-4 py-3 rounded-xl border ${
                      selectedVariant?.id === v.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text className={`font-semibold text-sm ${selectedVariant?.id === v.id ? "text-primary" : "text-foreground"}`}>
                      {v.weight_label}
                    </Text>
                    <Text className={`text-xs mt-1 ${selectedVariant?.id === v.id ? "text-primary/80" : "text-muted-foreground"}`}>
                      €{Number(v.price).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View className="flex-row items-center justify-between bg-card rounded-xl p-4 border border-border mb-5">
            <Text className="text-foreground font-semibold">Cantidad</Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-muted rounded-full items-center justify-center"
              >
                <Minus size={18} className="text-foreground" />
              </TouchableOpacity>
              <Text className="text-foreground text-xl font-bold w-8 text-center">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(Math.min(selectedVariant?.stock_qty || 99, quantity + 1))}
                className="w-10 h-10 bg-primary rounded-full items-center justify-center"
              >
                <Plus size={18} className="text-primary-foreground" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View className="mb-5">
              <Text className="text-foreground font-semibold mb-2">Descripción</Text>
              <Text className="text-muted-foreground leading-6">{product.description}</Text>
            </View>
          )}

          {/* Features */}
          <View className="flex-row gap-4 mb-5">
            {product.halal_cert_id && (
              <View className="flex-1 bg-card rounded-xl p-3 border border-border items-center">
                <Shield size={20} className="text-green-600 mb-1" />
                <Text className="text-xs text-foreground font-medium text-center">Halal Certificado</Text>
              </View>
            )}
            <View className="flex-1 bg-card rounded-xl p-3 border border-border items-center">
              <Clock size={20} className="text-blue-500 mb-1" />
              <Text className="text-xs text-foreground font-medium text-center">Entrega Rápida</Text>
            </View>
            <View className="flex-1 bg-card rounded-xl p-3 border border-border items-center">
              <Check size={20} className="text-primary mb-1" />
              <Text className="text-xs text-foreground font-medium text-center">100% Natural</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-muted-foreground text-xs">Total</Text>
            <Text className="text-foreground text-2xl font-bold">€{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={addingToCart || !selectedVariant}
            className="bg-primary px-8 py-4 rounded-xl flex-row items-center gap-2"
          >
            {addingToCart ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <ShoppingCart size={20} className="text-primary-foreground" />
                <Text className="text-primary-foreground font-bold text-lg">Añadir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
