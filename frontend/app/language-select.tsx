import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";

import { Heading1, Body } from "@/components/ui/Text";
import { useLang } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "ca", label: "Català" },
  { code: "en", label: "English" },
];

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { lang, setLang, t } = useLang();

  const onPick = async (l: Lang) => {
    await setLang(l);
    router.back();
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
        </Pressable>
      </View>

      <View className="px-5 pt-2">
        <Heading1>{t("rebuild.language.title")}</Heading1>
        <Body className="mt-1 text-muted-foreground">{t("rebuild.language.subtitle")}</Body>
      </View>

      <View className="px-5 mt-6 gap-2">
        {LANGS.map((l) => {
          const active = l.code === lang;
          return (
            <Pressable
              key={l.code}
              onPress={() => onPick(l.code)}
              className="flex-row items-center justify-between p-4 rounded-2xl bg-surface border border-border active:opacity-80"
            >
              <Body className="font-body-semibold">{l.label}</Body>
              {active ? <Check size={20} color="#0B0B0C" strokeWidth={2} /> : null}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
