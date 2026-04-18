import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLang } from "@/contexts/LanguageContext";
import { getSlides } from "@/lib/i18n";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = getSlides(lang);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("/register");
    }
  };

  const handleSkip = () => {
    router.replace("/register");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-end px-6 pt-2">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-muted-foreground font-medium">{t("onboarding.skip")}</Text>
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
        {slides.map((slide, idx) => (
          <View key={idx} style={{ width }} className="items-center px-8">
            <Image
              source={{ uri: ["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1544025162-d76690b67f11?w=800&auto=format&fit=crop&q=80"][idx] }}
              className="w-64 h-64 rounded-3xl mt-8 mb-8"
              resizeMode="cover"
            />
            <Text className="text-foreground text-2xl font-bold text-center mb-3">{slide.title}</Text>
            <Text className="text-muted-foreground text-center text-base leading-6">{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View className="flex-row justify-center gap-2 mb-6">
        {slides.map((_, idx) => (
          <View key={idx} className={`h-2 rounded-full ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`} />
        ))}
      </View>

      {/* Button */}
      <View className="px-6 pb-6">
        <TouchableOpacity onPress={handleNext} className="bg-primary py-4 rounded-xl items-center">
          <Text className="text-primary-foreground font-bold text-lg">
            {currentIndex === slides.length - 1 ? t("onboarding.start") : t("onboarding.next")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
