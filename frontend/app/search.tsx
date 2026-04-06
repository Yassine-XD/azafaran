import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, Plus, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/types";
import { getProductImage, getMinPrice } from "@/lib/types";

export default function SearchScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    const res = await api.get<Product[]>(`/products/search?q=${encodeURIComponent(q)}`, false);
    if (res.success && res.data) setResults(res.data);
    else setResults([]);
    setHasSearched(true);
    setIsSearching(false);
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  };

  const handleAddToCart = async (product: Product) => {
    const variant = product.variants?.[0];
    if (variant) {
      await addItem(variant.id, 1, {
        product_name: product.name,
        product_image: product.images?.[0]?.url,
        weight_label: variant.label,
        price: variant.price,
      });
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
      className="flex-row bg-card rounded-xl border border-border p-3 mx-4 mb-3"
    >
      <Image
        source={{ uri: getProductImage(item) }}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-foreground font-semibold text-sm" numberOfLines={2}>{item.name}</Text>
        {item.category_name && (
          <Text className="text-muted-foreground text-xs mt-0.5">{item.category_name}</Text>
        )}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-primary font-bold text-base">€{getMinPrice(item)}</Text>
          <TouchableOpacity
            onPress={() => handleAddToCart(item)}
            className="w-8 h-8 bg-primary rounded-full items-center justify-center"
          >
            <Plus size={16} className="text-primary-foreground" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Search Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border gap-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-input rounded-xl px-4 py-2.5">
          <Search size={18} className="text-muted-foreground mr-2" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleChangeText}
            placeholder="Buscar carnes, ofertas..."
            placeholderTextColor="#a8a29e"
            className="flex-1 text-foreground text-base"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setHasSearched(false); }}>
              <X size={18} className="text-muted-foreground" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {isSearching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#660710" />
        </View>
      ) : !hasSearched ? (
        <View className="flex-1 items-center justify-center px-8">
          <Search size={48} className="text-muted-foreground/30 mb-4" />
          <Text className="text-muted-foreground text-center text-base">
            Busca por nombre de producto, categoría u oferta
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-foreground text-lg font-bold mb-2">Sin resultados</Text>
          <Text className="text-muted-foreground text-center">
            No se encontraron productos para "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
