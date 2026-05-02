import { ScrollView, View, RefreshControl, Pressable } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Heading1, Heading2, Small } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCategories } from "@/hooks/queries";
import { useLang } from "@/contexts/LanguageContext";

export default function CategoriesScreen() {
  const router = useRouter();
  const { t } = useLang();
  const { data, isLoading, isFetching, refetch } = useCategories();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-12"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#0B0B0C" />}
      >
        <View className="px-5 pt-4 pb-6">
          <Heading1>{t("tabs.categories")}</Heading1>
          <Small className="mt-1 text-muted-foreground">
            {t("home.categories_subtitle") || "Cordero, ternera, pollo y más"}
          </Small>
        </View>

        <View className="px-5">
          {isLoading ? (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-[3/2] rounded-2xl" style={{ width: "48%" }} />
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {(data || []).map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/category/${c.slug}` as any)}
                  style={{ width: "48%" }}
                  className="aspect-[3/2] rounded-2xl overflow-hidden bg-muted active:opacity-90"
                >
                  {c.image_url ? (
                    <Image
                      source={{ uri: c.image_url }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : null}
                  <View className="absolute inset-0 bg-foreground/30" />
                  <View className="absolute inset-0 p-3 justify-end">
                    <Heading2 className="text-background">{c.name}</Heading2>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
