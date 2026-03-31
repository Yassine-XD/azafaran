import React from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  MapPin,
  Clock,
  Star,
  ShoppingCart,
  Search,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// Mock Data
const PROMOS = [
  {
    id: "1",
    title: "50% OFF Pollo",
    subtitle: "Fresh chicken breast",
    color: ["#ea580c", "#f97316"],
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    title: "Free Delivery",
    subtitle: "On orders over €30",
    color: ["#059669", "#10b981"],
    image:
      "https://images.unsplash.com/photo-1544025162-d76690b67f11?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    title: "BBQ Pack",
    subtitle: "Weekend special",
    color: ["#dc2626", "#ef4444"],
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60",
  },
];

const CATEGORIES = [
  { id: "1", name: "Pollo", icon: "🐔", color: "bg-orange-100" },
  { id: "2", name: "Ternera", icon: "🥩", color: "bg-red-100" },
  { id: "3", name: "Cerdo", icon: "🥓", color: "bg-pink-100" },
  { id: "4", name: "Cordero", icon: "🍖", color: "bg-amber-100" },
  { id: "5", name: "Conejo", icon: "🐰", color: "bg-stone-100" },
  { id: "6", name: "Embutidos", icon: "🌭", color: "bg-yellow-100" },
];

const PRODUCTS = [
  {
    id: "1",
    name: "Pechuga de Pollo",
    weight: "500g",
    price: 5.5,
    originalPrice: 7.0,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=60",
    badge: "OFERTA",
  },
  {
    id: "2",
    name: "Chuletón de Ternera",
    weight: "1kg",
    price: 24.9,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop&q=60",
    badge: "PREMIUM",
  },
  {
    id: "3",
    name: "Costillas BBQ",
    weight: "800g",
    price: 12.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "4",
    name: "Salchichas Ibéricas",
    weight: "400g",
    price: 8.5,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&auto=format&fit=crop&q=60",
  },
];

type PromoItem = (typeof PROMOS)[0];
type CategoryItem = (typeof CATEGORIES)[0];
type ProductItem = (typeof PRODUCTS)[0];

export default function HomeScreen() {
  const router = useRouter();

  const renderPromoItem = ({ item }: { item: PromoItem }) => (
    <TouchableOpacity className="w-[85%] mr-4 rounded-2xl overflow-hidden shadow-lg">
      <LinearGradient
        colors={item.color}
        style={{
          height: 180,
          borderRadius: 16,
          padding: 20,
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text className="text-white text-2xl font-bold">{item.title}</Text>
          <Text className="text-white/80 text-sm mt-1">{item.subtitle}</Text>
        </View>
        <Image
          source={{ uri: item.image }}
          className="w-24 h-24 rounded-full absolute bottom-2 right-2 border-2 border-white/30"
          resizeMode="cover"
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity className="items-center mr-4" onPress={() =>
        router.push({ pathname: "/shop", params: { category: item.name } })
      }>
      <View
        className={`w-16 h-16 rounded-full ${item.color} items-center justify-center mb-2`}
      >
        <Text className="text-2xl">{item.icon}</Text>
      </View>
      <Text className="text-xs text-foreground font-medium">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/product-detail", params: { id: item.id } })
      }
      className="flex-1 mr-4 bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-32"
          resizeMode="cover"
        />
        {item.badge && (
          <View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded-md">
            <Text className="text-primary-foreground text-xs font-bold">
              {item.badge}
            </Text>
          </View>
        )}
        <TouchableOpacity className="absolute bottom-2 right-2 bg-background rounded-full p-2 shadow-md">
          <ShoppingCart size={18} className="text-foreground" />
        </TouchableOpacity>
      </View>
      <View className="p-3">
        <Text
          className="text-foreground font-semibold text-sm mb-1"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          <Clock size={12} className="text-muted-foreground mr-1" />
          <Text className="text-xs text-muted-foreground">30 min</Text>
          <Star
            size={12}
            className="text-yellow-500 ml-2 mr-1"
            fill="#eab308"
          />
          <Text className="text-xs text-muted-foreground">{item.rating}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-primary font-bold">
              €{item.price.toFixed(2)}
            </Text>
            {item.originalPrice && (
              <Text className="text-muted-foreground text-xs line-through">
                €{item.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
          <Text className="text-xs text-muted-foreground">{item.weight}</Text>
        </View>
      </View>
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
          <View>
            <View className="flex-row items-center">
              <MapPin size={16} className="text-primary mr-1" />
              <Text className="text-sm text-muted-foreground">Entregar en</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">
              Calle Granada 12, Madrid
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              className="relative"
            >
              <ShoppingCart size={24} className="text-foreground" />
              <View className="absolute -top-1 -right-1 bg-primary w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-primary-foreground text-[10px] font-bold">
                  2
                </Text>
              </View>
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity className="flex-row items-center bg-input rounded-xl px-4 py-3">
          <Search size={20} className="text-muted-foreground mr-3" />
          <Text className="text-muted-foreground">
            Buscar carnes, ofertas...
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Promo Carousel */}
        <View className="mb-6">
          <FlatList
            data={PROMOS}
            renderItem={renderPromoItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            pagingEnabled
          />
        </View>

        {/* Categories */}
        <View className="mb-6">
          <View className="px-6 flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">
              Categorías
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm text-primary font-medium">Ver todo</Text>
              <ChevronRight size={16} className="text-primary" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        

        {/* Popular Products */}
        <View className="mb-6">
          <View className="px-6 flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Popular</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm text-primary font-medium">Ver todo</Text>
              <ChevronRight size={16} className="text-primary" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={PRODUCTS}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/*Chicken Products*/}
        <View className="mb-6">
          <View className="px-6 flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Pollo</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm text-primary font-medium">Ver todo</Text>
              <ChevronRight size={16} className="text-primary" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={PRODUCTS}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/*Meat Products*/}
        <View className="mb-6">
          <View className="px-6 flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Ternera</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm text-primary font-medium">Ver todo</Text>
              <ChevronRight size={16} className="text-primary" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={PRODUCTS}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>


        {/* Fresh Halal Banner */}
        <View className="px-6 mb-6">
          <LinearGradient
            colors={["#ea580c", "#c2410c"]}
            style={{
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text className="text-white text-2xl font-bold tracking-tight">
                FRESCA
              </Text>
              <Text className="text-white/90 text-lg">· HALAL ·</Text>
              <Text className="text-white text-xl font-bold tracking-tight">
                CERTIFICADA
              </Text>
            </View>
            <View className="bg-white/20 rounded-full p-3">
              <Text className="text-3xl">🏆</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
