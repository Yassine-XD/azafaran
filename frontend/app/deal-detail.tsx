import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function DealDetailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">Detalle Oferta</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-muted-foreground text-center">
          Las ofertas se aplican automáticamente en el carrito con el código promocional.
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/deals")} className="mt-4 bg-primary px-6 py-3 rounded-xl">
          <Text className="text-primary-foreground font-bold">Ver Ofertas</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
