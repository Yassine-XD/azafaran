import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { Users, Calendar, MapPin, ChevronRight } from "lucide-react-native";
import { StepIndicator } from "./register";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { t } = useLang();
  const [gender, setGender] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Barcelona");
  const [postcode, setPostcode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const GENDER_OPTIONS = [
    { value: "male", label: t("auth.profile_setup.gender_male") },
    { value: "female", label: t("auth.profile_setup.gender_female") },
    { value: "other", label: t("auth.profile_setup.gender_other") },
    { value: "prefer_not_to_say", label: t("auth.profile_setup.gender_prefer_not") },
  ];

  const handleNext = async () => {
    if (!gender) {
      Alert.alert(t("common.error"), t("auth.profile_setup.error_gender"));
      return;
    }
    if (!dateOfBirth) {
      Alert.alert(t("common.error"), t("auth.profile_setup.error_dob"));
      return;
    }
    if (!street.trim() || !city.trim() || !postcode.trim()) {
      Alert.alert(t("common.error"), t("auth.profile_setup.error_address"));
      return;
    }

    setIsSaving(true);

    const profileRes = await api.put("/users/", {
      gender,
      date_of_birth: dateOfBirth.toISOString().split("T")[0],
    });

    const addressRes = await api.post("/users/addresses", {
      label: "Casa",
      street: street.trim(),
      city: city.trim(),
      postcode: postcode.trim(),
      province: "Barcelona",
      country: "ES",
      is_default: true,
    });

    setIsSaving(false);

    if (!profileRes.success) {
      Alert.alert(t("common.error"), t("auth.profile_setup.error_profile"));
      return;
    }
    if (!addressRes.success) {
      Alert.alert(t("common.error"), t("auth.profile_setup.error_address_save"));
      return;
    }

    await refreshProfile();
    router.replace("/terms-accept");
  };

  const inputClass = "flex-row items-center bg-card border border-border rounded-xl px-4 py-3";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <StepIndicator current={1} total={3} />

        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-1">
            {t("auth.profile_setup.title")}
          </Text>
          <Text className="text-muted-foreground text-base">
            {t("auth.profile_setup.subtitle")}
          </Text>
        </View>

        {/* Gender */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Users size={18} color="#ea580c" />
            <Text className="text-foreground font-semibold text-base">{t("auth.profile_setup.gender")}</Text>
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
              {t("auth.profile_setup.dob")}
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
                : t("auth.profile_setup.dob_placeholder")}
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

        {/* Address */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-3">
            <MapPin size={18} color="#ea580c" />
            <Text className="text-foreground font-semibold text-base">
              {t("auth.profile_setup.address_title")}
            </Text>
          </View>

          <View className="mb-3">
            <View className={inputClass}>
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder={t("auth.profile_setup.street")}
                placeholderTextColor="#a8a29e"
                value={street}
                onChangeText={setStreet}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <View className={inputClass}>
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder={t("auth.profile_setup.city")}
                  placeholderTextColor="#a8a29e"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
            <View className="w-28">
              <View className={inputClass}>
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder={t("auth.profile_setup.postcode")}
                  placeholderTextColor="#a8a29e"
                  value={postcode}
                  onChangeText={setPostcode}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isSaving}
          className="bg-primary py-4 rounded-xl items-center"
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground font-bold text-lg">{t("auth.profile_setup.button")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
