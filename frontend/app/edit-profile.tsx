import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, Phone, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { ConfirmModal } from "@/components/ui";

type FeedbackState =
  | { kind: "validation"; message: string }
  | { kind: "saveError"; message: string }
  | { kind: "saved" }
  | { kind: "deleteConfirm" }
  | { kind: "deleteError"; message: string }
  | null;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshProfile, logout } = useAuth();
  const { t } = useLang();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setFeedback({ kind: "validation", message: "Nombre y apellido son obligatorios" });
      return;
    }
    setSaving(true);
    const res = await api.put("/users/", {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
    });
    setSaving(false);
    if (res.success) {
      await refreshProfile();
      setFeedback({ kind: "saved" });
    } else {
      setFeedback({ kind: "saveError", message: res.error?.message || "No se pudo guardar" });
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const res = await api.delete("/users/");
    setDeleting(false);
    if (!res.success) {
      setFeedback({
        kind: "deleteError",
        message: res.error?.message || t("profile.delete_account_error"),
      });
      return;
    }
    setFeedback(null);
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">Editar Perfil</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-1">Nombre</Text>
            <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
              <User size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Nombre"
                placeholderTextColor="#a8a29e"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-1">Apellido</Text>
            <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
              <TextInput
                className="flex-1 text-foreground text-base"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Apellido"
                placeholderTextColor="#a8a29e"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-1">Teléfono</Text>
            <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
              <Phone size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                value={phone}
                onChangeText={setPhone}
                placeholder="+34..."
                placeholderTextColor="#a8a29e"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-1">Email</Text>
            <View className="flex-row items-center bg-muted/50 border border-border rounded-xl px-4 py-3">
              <Text className="text-muted-foreground text-base">{user?.email}</Text>
            </View>
            <Text className="text-muted-foreground text-xs mt-1">El email no se puede cambiar</Text>
          </View>

          <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-primary py-4 rounded-xl items-center mt-4">
            {saving ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground font-bold text-lg">Guardar</Text>}
          </TouchableOpacity>

          {/* Account deletion (Play Store policy) — kept low-key under personal info */}
          <View className="mt-10 pt-6 border-t border-border">
            <Pressable
              onPress={() => setFeedback({ kind: "deleteConfirm" })}
              className="flex-row items-center justify-center gap-2 py-3"
            >
              <Trash2 size={16} color="#B91C1C" strokeWidth={2.4} />
              <Text className="font-body-semibold text-destructive text-[14px]">
                {t("profile.delete_account")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={feedback?.kind === "validation"}
        tone="destructive"
        title="Falta información"
        message={feedback?.kind === "validation" ? feedback.message : undefined}
        confirmLabel="Entendido"
        onConfirm={() => setFeedback(null)}
        onCancel={() => setFeedback(null)}
      />

      <ConfirmModal
        visible={feedback?.kind === "saveError"}
        tone="destructive"
        title="No se pudo guardar"
        message={feedback?.kind === "saveError" ? feedback.message : undefined}
        confirmLabel="Reintentar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setFeedback(null);
          handleSave();
        }}
        onCancel={() => setFeedback(null)}
      />

      <ConfirmModal
        visible={feedback?.kind === "saved"}
        tone="success"
        title="Guardado"
        message="Perfil actualizado correctamente"
        confirmLabel="Continuar"
        onConfirm={() => {
          setFeedback(null);
          router.back();
        }}
        onCancel={() => {
          setFeedback(null);
          router.back();
        }}
      />

      <ConfirmModal
        visible={feedback?.kind === "deleteConfirm"}
        tone="destructive"
        title={t("profile.delete_account_title")}
        message={t("profile.delete_account_message")}
        confirmLabel={t("profile.delete_account_confirm")}
        cancelLabel={t("profile.logout_cancel")}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => (deleting ? null : setFeedback(null))}
      />

      <ConfirmModal
        visible={feedback?.kind === "deleteError"}
        tone="destructive"
        title={t("profile.delete_account_title")}
        message={feedback?.kind === "deleteError" ? feedback.message : undefined}
        confirmLabel="Entendido"
        onConfirm={() => setFeedback(null)}
        onCancel={() => setFeedback(null)}
      />
    </SafeAreaView>
  );
}
