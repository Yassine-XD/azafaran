import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, Phone } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
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
      Alert.alert("Guardado", "Perfil actualizado correctamente");
      router.back();
    } else {
      Alert.alert("Error", res.error?.message || "No se pudo guardar");
    }
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
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
