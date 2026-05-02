import { useState } from "react";
import { ScrollView, View, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, Link } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Display, Heading3, Body, Small } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    const r = await login(email.trim(), password);
    setSubmitting(false);
    if (r.success) {
      router.back();
    } else {
      Alert.alert(t("rebuild.auth.login_failed_title"), r.error || t("rebuild.product.add_failed_retry"));
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-5 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-muted"
          >
            <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-5 pb-12 flex-grow">
          <Display>{t("rebuild.auth.login_title")}</Display>
          <Body className="mt-2 text-muted-foreground">{t("rebuild.auth.login_subtitle")}</Body>

          <View className="mt-8 gap-4">
            <Field
              label={t("rebuild.auth.email")}
              value={email}
              onChange={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label={t("rebuild.auth.password")}
              value={password}
              onChange={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title={submitting ? t("rebuild.auth.logging_in") : t("rebuild.auth.login_cta")}
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!email.trim() || !password}
            className="mt-6"
            onPress={onSubmit}
          />

          <View className="mt-6 flex-row justify-center gap-1">
            <Small className="text-muted-foreground">{t("rebuild.auth.no_account")}</Small>
            <Link href="/register" replace>
              <Small className="font-body-semibold text-foreground">{t("rebuild.auth.sign_up")}</Small>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  secureTextEntry?: boolean;
}

function Field({ label, value, onChange, keyboardType, autoCapitalize, secureTextEntry }: FieldProps) {
  return (
    <View>
      <Heading3 className="mb-2">{label}</Heading3>
      <View className="px-4 h-12 rounded-xl bg-card border border-border justify-center">
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          style={{ fontFamily: "Inter_400Regular", fontSize: 15, color: "#0B0B0C" }}
          placeholderTextColor="#A1A1A6"
        />
      </View>
    </View>
  );
}
