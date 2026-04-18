import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Shield, Mail, Check } from "lucide-react-native";
import { StepIndicator } from "./register";

export default function TermsAcceptScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { t } = useLang();
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    if (!acceptsTerms) {
      Alert.alert(t("auth.terms.error_title"), t("auth.terms.error_terms"));
      return;
    }

    setIsSaving(true);
    const res = await api.put("/users/", {
      accepts_terms: true,
      accepts_marketing: acceptsMarketing,
    });
    setIsSaving(false);

    if (!res.success) {
      Alert.alert(t("common.error"), t("auth.terms.error_save"));
      return;
    }

    await AsyncStorage.setItem("onboarding_done", "true");
    await refreshProfile();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <StepIndicator current={2} total={3} />

        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-1">
            {t("auth.terms.title")}
          </Text>
          <Text className="text-muted-foreground text-base">
            {t("auth.terms.subtitle")}
          </Text>
        </View>

        {/* Terms & Conditions */}
        <View className="bg-card rounded-2xl border border-border p-5 mb-4">
          <View className="flex-row items-center gap-3 mb-4">
            <Shield size={24} color="#ea580c" />
            <Text className="text-foreground font-bold text-lg">{t("auth.terms.terms_card_title")}</Text>
          </View>
          <Text className="text-muted-foreground text-sm leading-5 mb-4">
            {t("auth.terms.terms_description")}
          </Text>
          <TouchableOpacity onPress={() => router.push("/policies")} className="mb-4">
            <Text className="text-primary font-medium text-sm underline">
              {t("auth.terms.read_terms")}
            </Text>
          </TouchableOpacity>

          {/* Required checkbox */}
          <TouchableOpacity
            onPress={() => setAcceptsTerms(!acceptsTerms)}
            className="flex-row items-start gap-3"
          >
            <View className="mt-0.5">
              {acceptsTerms ? (
                <View className="w-6 h-6 rounded-md bg-primary items-center justify-center">
                  <Check size={16} color="white" />
                </View>
              ) : (
                <View className="w-6 h-6 rounded-md border-2 border-border" />
              )}
            </View>
            <Text className="text-foreground text-sm flex-1 leading-5">
              {t("auth.terms.accept_terms")}{" "}
              <Text className="text-destructive">*</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Marketing opt-in */}
        <View className="bg-card rounded-2xl border border-border p-5 mb-8">
          <View className="flex-row items-center gap-3 mb-4">
            <Mail size={24} color="#ea580c" />
            <Text className="text-foreground font-bold text-lg">{t("auth.terms.marketing_title")}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setAcceptsMarketing(!acceptsMarketing)}
            className="flex-row items-start gap-3"
          >
            <View className="mt-0.5">
              {acceptsMarketing ? (
                <View className="w-6 h-6 rounded-md bg-primary items-center justify-center">
                  <Check size={16} color="white" />
                </View>
              ) : (
                <View className="w-6 h-6 rounded-md border-2 border-border" />
              )}
            </View>
            <Text className="text-foreground text-sm flex-1 leading-5">
              {t("auth.terms.accept_marketing")}{" "}
              <Text className="text-muted-foreground">{t("auth.terms.optional")}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Finish Button */}
        <TouchableOpacity
          onPress={handleFinish}
          disabled={isSaving || !acceptsTerms}
          className={`py-4 rounded-xl items-center ${acceptsTerms ? "bg-primary" : "bg-muted"}`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className={`font-bold text-lg ${acceptsTerms ? "text-primary-foreground" : "text-muted-foreground"}`}>
              {t("auth.terms.button")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
