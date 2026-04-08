import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";


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
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="mb-4">
          <Text className="text-2xl font-bold text-foreground">Categorías</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/search")} className="flex-row items-center bg-input rounded-xl px-4 py-3">
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
            className="flex-1 bg-card rounded-2xl overflow-hidden shadow-sm border border-border items-center"
            onPress={() =>
              router.push({
                pathname: "/shop",
                params: { category: item.slug, categoryName: item.name },
              })
            }
          >
            <ImageBackground
              className="p-5 w-full h-40 justify-end items-center"
              source={{uri: item.image_url}}
            >
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(0, 0, 0, 0.6)",
                  "rgba(0, 0, 0, 0.85)",
                ]}
                className="absolute bottom-0 left-0 right-0 h-2/3 justify-end p-4"
              >
                {/* Frosted Glass Effect Container */}
                <View className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3">
                  <Text className="text-white text-lg font-bold mb-1">
                    {item.name}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white/80 text-xs">Explore</Text>
                    <View className="bg-primary/90 rounded-full p-1.5">
                      <ChevronRight size={14} className="text-white" />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
