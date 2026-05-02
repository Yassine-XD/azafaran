import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Display, Body } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "ca", label: "Català" },
  { code: "en", label: "English" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setLang, t } = useLang();
  const [selected, setSelected] = useState<Lang>("es");

  const onContinue = async () => {
    await setLang(selected);
    await AsyncStorage.setItem("onboarding_done", "1");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-12 justify-between">
        <View>
          <Display>Bienvenido</Display>
          <Body className="mt-3 text-muted-foreground">
            Carnicería halal certificada, a domicilio.
          </Body>

          <View className="mt-12 gap-3">
            {LANGS.map((l) => {
              const active = l.code === selected;
              return (
                <Button
                  key={l.code}
                  title={l.label}
                  variant={active ? "primary" : "secondary"}
                  size="lg"
                  fullWidth
                  haptic
                  onPress={() => setSelected(l.code)}
                />
              );
            })}
          </View>
        </View>

        <Button
          title={t("common.continue") || "Continuar"}
          variant="primary"
          size="lg"
          fullWidth
          onPress={onContinue}
        />
      </View>
    </SafeAreaView>
  );
}
