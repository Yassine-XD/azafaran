import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Users, Calendar, Globe, ChevronRight, Minus, Plus } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const GENDER_OPTIONS = [
  { value: "male", label: "Hombre" },
  { value: "female", label: "Mujer" },
  { value: "other", label: "Otro" },
  { value: "prefer_not_to_say", label: "Prefiero no decir" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "es", label: "Castellano" },
  { value: "ca", label: "Català" },
  { value: "en", label: "English" },
] as const;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [gender, setGender] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [familySize, setFamilySize] = useState(2);
  const [preferredLang, setPreferredLang] = useState("es");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const payload: Record<string, any> = {
      preferred_lang: preferredLang,
      family_size: familySize,
    };
    if (gender) payload.gender = gender;
    if (dateOfBirth) payload.date_of_birth = dateOfBirth.toISOString().split("T")[0];

    const res = await api.put("/users/", payload);
    setIsSaving(false);

    if (res.success) {
      await refreshProfile();
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "No se pudo guardar. Inténtalo de nuevo.");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">
            ¡Bienvenido{user?.first_name ? `, ${user.first_name}` : ""}!
          </Text>
          <Text className="text-muted-foreground text-base">
            Cuéntanos un poco sobre ti para personalizar tu experiencia.
          </Text>
        </View>

        {/* Gender */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Users size={18} color="#ea580c" />
            <Text className="text-foreground font-semibold text-base">Género</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setGender(opt.value)}
                className={`px-4 py-2.5 rounded-xl border ${
                  gender === opt.value
                    ? "border-primary bg-primary"
                    : "border-border bg-card"
                }`}
              >
                <Text
                  className={`font-medium ${
                    gender === opt.value ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date of Birth */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Calendar size={18} color="#ea580c" />
            <Text className="text-foreground font-semibold text-base">
              Fecha de nacimiento
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
          >
            <Text className={dateOfBirth ? "text-foreground" : "text-muted-foreground"}>
              {dateOfBirth
                ? dateOfBirth.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Seleccionar fecha"}
            </Text>
            <ChevronRight size={18} className="text-muted-foreground" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) setDateOfBirth(date);
              }}
            />
          )}
        </View>

        {/* Family Size */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Users size={18} color="#ea580c" />
            <Text className="text-foreground font-semibold text-base">
              Miembros de la familia
            </Text>
          </View>
          <View className="flex-row items-center justify-center gap-6 bg-card border border-border rounded-xl py-4">
            <TouchableOpacity
              onPress={() => setFamilySize(Math.max(1, familySize - 1))}
              className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            >
              <Minus size={20} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground w-12 text-center">
              {familySize}
            </Text>
            <TouchableOpacity
              onPress={() => setFamilySize(Math.min(20, familySize + 1))}
              className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            >
              <Plus size={20} className="text-foreground" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-3">
            <Globe size={18} color="#ea580c" />
            <Text className="text-foreground font-semibold text-base">Idioma</Text>
          </View>
          <View className="flex-row gap-2">
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setPreferredLang(opt.value)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  preferredLang === opt.value
                    ? "border-primary bg-primary"
                    : "border-border bg-card"
                }`}
              >
                <Text
                  className={`font-medium ${
                    preferredLang === opt.value
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className="bg-primary py-4 rounded-xl items-center mb-3"
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground font-bold text-lg">
              Guardar y continuar
            </Text>
          )}
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={handleSkip} className="py-3 items-center">
          <Text className="text-muted-foreground font-medium">Omitir por ahora</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
