import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Globe, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useLang } from "@/contexts/LanguageContext";
import { LANGUAGES, type Lang } from "@/lib/i18n";

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const [selected, setSelected] = useState<Lang>(lang);

  const handleContinue = async () => {
    await setLang(selected);
    router.replace("/onboarding");
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-center px-8">
      {/* Header */}
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
          <Globe size={40} color="#660710" />
        </View>
        <Text className="text-3xl font-bold text-foreground text-center mb-3">
          {t("language_select.title")}
        </Text>
        <Text className="text-muted-foreground text-center text-base leading-6">
          {t("language_select.subtitle")}
        </Text>
      </View>

      {/* Language Options */}
      <View className="gap-3 mb-10">
        {LANGUAGES.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSelected(opt.value)}
              className={`flex-row items-center py-4 px-5 rounded-2xl border-2 ${
                isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <Text className={`font-semibold text-lg flex-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </Text>
              {isSelected && (
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Check size={16} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleContinue}
        className="bg-primary py-4 rounded-xl items-center"
      >
        <Text className="text-primary-foreground font-bold text-lg">
          {t("language_select.continue")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
