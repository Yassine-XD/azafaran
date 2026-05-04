import { useState } from "react";
import { ScrollView, View, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Heading1, Body, Small } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/queries";

export default function CategoryListScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<"date" | "price">("date");

  const products = useProducts({
    category: slug,
    in_stock: inStockOnly || undefined,
    sort,
    order: sort === "price" ? "asc" : "desc",
    limit: 50,
  });

  const list = products.data?.products ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-5 py-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-muted">
          <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
        </Pressable>
        <Heading1 className="capitalize">{slug?.replaceAll("-", " ")}</Heading1>
      </View>

      {/* Sticky filter bar */}
      <View className="px-5 pb-3 flex-row gap-2">
        <Chip label="Recientes" active={sort === "date"} onPress={() => setSort("date")} />
        <Chip label="Precio" active={sort === "price"} onPress={() => setSort("price")} />
        <Chip label="En stock" active={inStockOnly} onPress={() => setInStockOnly((v) => !v)} />
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-12"
        refreshControl={<RefreshControl refreshing={products.isFetching} onRefresh={products.refetch} tintColor="#0B0B0C" />}
      >
        {products.isLoading ? (
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" style={{ width: "48%" }} />
            ))}
          </View>
        ) : list.length === 0 ? (
          <View className="py-20 items-center">
            <Body className="text-muted-foreground">No hay productos en esta categoría.</Body>
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {list.map((p) => (
              <View key={p.id} style={{ width: "48%" }}>
                <ProductCard product={p as any} onPress={() => router.push(`/product/${p.id}`)} />
              </View>
            ))}
          </View>
        )}
        <Small className="text-muted-foreground text-center mt-4">
          {products.data?.meta.total ?? 0} productos
        </Small>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 h-9 rounded-pill items-center justify-center border ${
        active ? "bg-primary border-primary" : "bg-card border-border"
      } active:opacity-80`}
    >
      <Small
        className={`font-body-semibold ${active ? "text-primary-foreground" : "text-foreground"}`}
      >
        {label}
      </Small>
    </Pressable>
  );
}
