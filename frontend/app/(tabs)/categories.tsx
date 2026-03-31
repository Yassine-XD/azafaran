import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  ternera: "🥩",
  cordero: "🍖",
  pollo: "🐔",
  conejo: "🐰",
  elaborados: "🌭",
  "bbq-packs": "🔥",
};

const CATEGORY_COLORS = [
  "bg-orange-100",
  "bg-red-100",
  "bg-amber-100",
  "bg-pink-100",
  "bg-stone-100",
  "bg-yellow-100",
  "bg-emerald-100",
  "bg-cyan-100",
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get<Category[]>("/categories/", false);
      if (res.success && res.data) setCategories(res.data);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-foreground">Categorías</Text>
          <ThemeToggle />
        </View>
        <TouchableOpacity className="flex-row items-center bg-input rounded-xl px-4 py-3">
          <Search size={20} className="text-muted-foreground mr-3" />
          <Text className="text-muted-foreground">Buscar categoría...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ gap: 16 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className="flex-1 bg-card rounded-2xl overflow-hidden shadow-sm border border-border p-5 items-center"
            onPress={() => router.push({ pathname: "/shop", params: { category: item.slug, categoryName: item.name } })}
          >
            <View className={`w-16 h-16 rounded-full ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} items-center justify-center mb-3`}>
              <Text className="text-3xl">{CATEGORY_ICONS[item.slug] || "🥩"}</Text>
            </View>
            <Text className="text-foreground font-semibold text-base text-center">{item.name}</Text>
            {item.description && (
              <Text className="text-muted-foreground text-xs text-center mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
