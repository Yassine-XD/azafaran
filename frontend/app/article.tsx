import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { api } from "@/lib/api";
import type { Banner } from "@/lib/types";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get<Banner>(`/promotions/banners/${id}`, false);
      if (res.success && res.data) setArticle(res.data);
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-foreground text-lg font-semibold mb-4">
          Artículo no encontrado
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-primary-foreground font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header image with back button overlay */}
        {article.image_url ? (
          <View className="relative">
            <Image
              source={{ uri: article.image_url }}
              className="w-full h-64"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-4 left-4 bg-black/40 rounded-full p-2"
            >
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center px-4 py-3 border-b border-border">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <ArrowLeft size={22} className="text-foreground" />
            </TouchableOpacity>
          </View>
        )}

        {/* Article content */}
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-foreground mb-2">
            {article.title}
          </Text>
          {article.subtitle && (
            <Text className="text-muted-foreground text-base mb-6">
              {article.subtitle}
            </Text>
          )}
          {article.content && (
            <Text className="text-foreground text-base leading-relaxed">
              {article.content}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
