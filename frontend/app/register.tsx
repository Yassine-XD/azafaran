import { useState } from "react";
import { ScrollView, View, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, Link } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Display, Heading3, Body, Small } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { lang } = useLang();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid =
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.password.length >= 8;

  const onSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    const r = await register({ ...form, preferred_lang: lang });
    setSubmitting(false);
    if (r.success) {
      router.replace("/terms-accept");
    } else {
      Alert.alert("No se pudo crear la cuenta", r.error || "Inténtalo de nuevo");
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
          <Display>Crea tu cuenta</Display>
          <Body className="mt-2 text-muted-foreground">Tarda menos de un minuto.</Body>

          <View className="mt-8 gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label="Nombre" value={form.first_name} onChange={(v) => set("first_name", v)} />
              </View>
              <View className="flex-1">
                <Field label="Apellido" value={form.last_name} onChange={(v) => set("last_name", v)} />
              </View>
            </View>
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => set("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Teléfono"
              value={form.phone}
              onChange={(v) => set("phone", v)}
              keyboardType="phone-pad"
            />
            <Field
              label="Contraseña"
              value={form.password}
              onChange={(v) => set("password", v)}
              secureTextEntry
              hint="Mínimo 8 caracteres"
            />
          </View>

          <Button
            title={submitting ? "Creando…" : "Crear cuenta"}
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!valid}
            className="mt-6"
            onPress={onSubmit}
          />

          <View className="mt-6 flex-row justify-center gap-1">
            <Small className="text-muted-foreground">¿Ya tienes cuenta?</Small>
            <Link href="/login" replace>
              <Small className="font-body-semibold text-foreground">Inicia sesión</Small>
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
  hint?: string;
}

function Field({ label, value, onChange, keyboardType, autoCapitalize, secureTextEntry, hint }: FieldProps) {
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
      {hint ? <Small className="mt-1 text-muted-foreground">{hint}</Small> : null}
    </View>
  );
}
