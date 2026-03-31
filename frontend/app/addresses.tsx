import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, MapPin, Check, Trash2, Edit3 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import type { Address } from "@/lib/types";

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [province, setProvince] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = useCallback(async () => {
    const res = await api.get<Address[]>("/users/addresses");
    if (res.success && res.data) setAddresses(res.data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const resetForm = () => {
    setLabel(""); setStreet(""); setCity(""); setPostcode(""); setProvince(""); setInstructions(""); setIsDefault(false);
    setEditingId(null); setShowForm(false);
  };

  const startEdit = (addr: Address) => {
    setLabel(addr.label); setStreet(addr.street); setCity(addr.city); setPostcode(addr.postcode);
    setProvince(addr.province); setInstructions(addr.instructions || ""); setIsDefault(addr.is_default);
    setEditingId(addr.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!label.trim() || !street.trim() || !city.trim() || !postcode.trim()) {
      Alert.alert("Error", "Completa los campos obligatorios");
      return;
    }
    setSaving(true);
    const body = { label, street, city, postcode, province: province || "Barcelona", country: "ES", instructions, is_default: isDefault };

    const res = editingId
      ? await api.put(`/users/addresses/${editingId}`, body)
      : await api.post("/users/addresses", body);

    setSaving(false);
    if (res.success) {
      resetForm();
      fetchAddresses();
    } else {
      Alert.alert("Error", res.error?.message || "No se pudo guardar");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar", "¿Eliminar esta dirección?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        await api.delete(`/users/addresses/${id}`);
        fetchAddresses();
      }},
    ]);
  };

  const handleSetDefault = async (id: string) => {
    await api.patch(`/users/addresses/${id}/default`);
    fetchAddresses();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground ml-2">Direcciones</Text>
        </View>
        {!showForm && (
          <TouchableOpacity onPress={() => setShowForm(true)} className="bg-primary p-2 rounded-lg">
            <Plus size={20} className="text-primary-foreground" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Address Form */}
          {showForm && (
            <View className="bg-card rounded-2xl border border-border p-4 mb-4">
              <Text className="text-foreground font-bold text-lg mb-3">{editingId ? "Editar" : "Nueva"} Dirección</Text>
              {[
                { label: "Etiqueta (Casa, Trabajo...)", value: label, set: setLabel },
                { label: "Calle y número *", value: street, set: setStreet },
                { label: "Ciudad *", value: city, set: setCity },
                { label: "Código Postal *", value: postcode, set: setPostcode, keyboard: "numeric" as const },
                { label: "Provincia", value: province, set: setProvince },
                { label: "Instrucciones de entrega", value: instructions, set: setInstructions },
              ].map((field) => (
                <View key={field.label} className="mb-3">
                  <Text className="text-muted-foreground text-xs mb-1">{field.label}</Text>
                  <TextInput
                    className="bg-muted/50 rounded-xl px-4 py-3 text-foreground"
                    value={field.value}
                    onChangeText={field.set}
                    placeholderTextColor="#a8a29e"
                    keyboardType={field.keyboard || "default"}
                  />
                </View>
              ))}
              <TouchableOpacity onPress={() => setIsDefault(!isDefault)} className="flex-row items-center gap-2 mb-4">
                <View className={`w-5 h-5 rounded border ${isDefault ? "bg-primary border-primary" : "border-border"} items-center justify-center`}>
                  {isDefault && <Check size={12} color="white" />}
                </View>
                <Text className="text-foreground text-sm">Dirección predeterminada</Text>
              </TouchableOpacity>
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={resetForm} className="flex-1 border border-border py-3 rounded-xl items-center">
                  <Text className="text-foreground font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={saving} className="flex-1 bg-primary py-3 rounded-xl items-center">
                  {saving ? <ActivityIndicator color="white" size="small" /> : <Text className="text-primary-foreground font-bold">Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Address List */}
          {addresses.length === 0 && !showForm ? (
            <View className="items-center justify-center py-20">
              <MapPin size={48} className="text-muted-foreground mb-4" />
              <Text className="text-lg font-semibold text-foreground mb-1">Sin direcciones</Text>
              <Text className="text-muted-foreground text-center">Añade una dirección para tus entregas</Text>
            </View>
          ) : (
            addresses.map((addr) => (
              <View key={addr.id} className="bg-card rounded-2xl border border-border p-4 mb-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-foreground font-bold">{addr.label}</Text>
                      {addr.is_default && (
                        <View className="bg-primary/10 px-2 py-0.5 rounded">
                          <Text className="text-primary text-xs font-medium">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-sm mt-1">{addr.street}</Text>
                    <Text className="text-muted-foreground text-sm">{addr.city}, {addr.postcode}</Text>
                    {addr.instructions && <Text className="text-muted-foreground text-xs mt-1 italic">{addr.instructions}</Text>}
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => startEdit(addr)} className="p-2">
                      <Edit3 size={16} className="text-muted-foreground" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(addr.id)} className="p-2">
                      <Trash2 size={16} className="text-destructive" />
                    </TouchableOpacity>
                  </View>
                </View>
                {!addr.is_default && (
                  <TouchableOpacity onPress={() => handleSetDefault(addr.id)} className="mt-3 pt-3 border-t border-border">
                    <Text className="text-primary text-sm font-medium">Establecer como predeterminada</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
