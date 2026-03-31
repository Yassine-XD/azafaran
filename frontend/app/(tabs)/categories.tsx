import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// Mock Data for Categories
const CATEGORIES = [
  {
    id: "1",
    name: "Pollo",
    count: 24,
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Ternera",
    count: 18,
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Cerdo",
    count: 15,
    image:
      "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Cordero",
    count: 12,
    image:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    name: "Conejo",
    count: 8,
    image:
      "https://images.unsplash.com/photo-1515664898524-2f1943c0f58d?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    name: "Embutidos",
    count: 32,
    image:
      "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "7",
    name: "Hamburguesas",
    count: 10,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "8",
    name: "Mariscos",
    count: 14,
    image:
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&auto=format&fit=crop&q=80",
  },
];

type CategoryItem = (typeof CATEGORIES)[0];

export default function CategoriesScreen() {
  const router = useRouter();

  const renderCategoryItem = ({
    item,
    index,
  }: {
    item: CategoryItem;
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/shop", params: { category: item.name } })
      }
      className="mb-4 overflow-hidden rounded-2xl shadow-sm"
      style={{ width: (width - 48) / 2, height: 180}}
      activeOpacity={0.8}
    >
      {/* Background Image */}
      <Image
        source={{ uri: item.image }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      {/* Frosted Overlay Gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.85)"]}
        className="absolute bottom-0 left-0 right-0 h-2/3 justify-end p-4"
      >
        {/* Frosted Glass Effect Container */}
        <View className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3">
          <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-white/80 text-xs">
              {item.count} productos
            </Text>
            <View className="bg-primary/90 rounded-full p-1.5">
              <ChevronRight size={14} className="text-white" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-foreground">Categorías</Text>
          <ThemeToggle />
        </View>

        {/* Search Bar */}
        <TouchableOpacity className="flex-row items-center bg-input rounded-xl px-4 py-3">
          <Search size={20} className="text-muted-foreground mr-3" />
          <Text className="text-muted-foreground">Buscar carne...</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Grid */}
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48, gap: 0 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
