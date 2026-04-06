import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Carne Halal Fresca",
    description: "Productos de la más alta calidad, certificados halal, directamente a tu puerta",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Entrega Rápida",
    description: "Recibe tu pedido en el horario que prefieras. Envío gratis a partir de 30€",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Los Mejores Precios",
    description: "Ofertas exclusivas cada semana. Carnes premium al mejor precio de Barcelona",
    image: "https://images.unsplash.com/photo-1544025162-d76690b67f11?w=800&auto=format&fit=crop&q=80",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem("onboarding_done", "true");
      router.replace("/(tabs)");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboarding_done", "true");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-end px-6 pt-2">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-muted-foreground font-medium">Saltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, idx) => (
          <View key={idx} style={{ width }} className="items-center px-8">
            <Image source={{ uri: slide.image }} className="w-64 h-64 rounded-3xl mt-8 mb-8" resizeMode="cover" />
            <Text className="text-foreground text-2xl font-bold text-center mb-3">{slide.title}</Text>
            <Text className="text-muted-foreground text-center text-base leading-6">{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View className="flex-row justify-center gap-2 mb-6">
        {SLIDES.map((_, idx) => (
          <View key={idx} className={`h-2 rounded-full ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`} />
        ))}
      </View>

      {/* Button */}
      <View className="px-6 pb-6">
        <TouchableOpacity onPress={handleNext} className="bg-primary py-4 rounded-xl items-center">
          <Text className="text-primary-foreground font-bold text-lg">
            {currentIndex === SLIDES.length - 1 ? "Comenzar" : "Siguiente"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
