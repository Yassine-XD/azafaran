import { useState } from "react";
import { ScrollView, View, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Check } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Display, Body, Small } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

export default function TermsAcceptScreen() {
  const router = useRouter();
  const { t } = useLang();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onContinue = async () => {
    if (!acceptedTerms) return;
    setSubmitting(true);
    const r = await api.post("/users/me/terms", {
      accepts_terms: acceptedTerms,
      accepts_marketing: acceptedMarketing,
    });
    setSubmitting(false);
    if (r.success) {
      await AsyncStorage.setItem("onboarding_done", "1");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", r.error?.message || "No se pudo guardar.");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="px-5 pt-8 pb-12 flex-grow">
        <Display>{t("rebuild.terms.title")}</Display>
        <Body className="mt-3 text-muted-foreground">
          {t("rebuild.terms.subtitle")}
        </Body>

        <View className="mt-8 gap-3">
          <CheckRow
            checked={acceptedTerms}
            onToggle={() => setAcceptedTerms((v) => !v)}
            title={t("rebuild.terms.accept_terms")}
            subtitle={t("rebuild.terms.accept_terms_hint")}
            required
          />
          <CheckRow
            checked={acceptedMarketing}
            onToggle={() => setAcceptedMarketing((v) => !v)}
            title={t("rebuild.terms.accept_marketing")}
            subtitle={t("rebuild.terms.accept_marketing_hint")}
          />
        </View>

        <View className="flex-1" />

        <Button
          title={submitting ? t("common.saving") : t("common.continue")}
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!acceptedTerms}
          className="mt-8"
          onPress={onContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface CheckRowProps {
  checked: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  required?: boolean;
}

function CheckRow({ checked, onToggle, title, subtitle, required }: CheckRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row gap-3 p-4 rounded-2xl bg-surface border border-border active:opacity-80"
    >
      <View
        className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
          checked ? "bg-primary border-primary" : "bg-card border-border"
        }`}
      >
        {checked ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
      </View>
      <View className="flex-1">
        <Body className="font-body-semibold">
          {title} {required ? <Small className="text-sale">*</Small> : null}
        </Body>
        {subtitle ? <Small className="mt-0.5 text-muted-foreground">{subtitle}</Small> : null}
      </View>
    </Pressable>
  );
}
