import React, { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Bell, ShoppingBag, Tag, RotateCcw } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import type { NotificationPreferences } from "@/lib/types";

type PrefItem = {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: any;
};

const PREF_ITEMS: PrefItem[] = [
  { key: "order_updates", label: "Actualizaciones de Pedido", description: "Estado del pedido y entrega", icon: ShoppingBag },
  { key: "reorder_reminders", label: "Recordatorios de Compra", description: "Te avisamos cuando sea hora de comprar", icon: RotateCcw },
  { key: "promotions", label: "Promociones", description: "Ofertas y descuentos exclusivos", icon: Tag },
  { key: "ai_suggestions", label: "Sugerencias", description: "Recomendaciones personalizadas", icon: Bell },
];

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get<NotificationPreferences>("/notifications/preferences");
      if (res.success && res.data) setPrefs(res.data);
      setIsLoading(false);
    })();
  }, []);

  const togglePref = async (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    const newValue = !prefs[key];
    setPrefs({ ...prefs, [key]: newValue });
    const res = await api.put("/notifications/preferences", { [key]: newValue });
    if (!res.success) {
      setPrefs({ ...prefs, [key]: !newValue }); // revert
      Alert.alert("Error", "No se pudo actualizar");
    }
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
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">Notificaciones</Text>
      </View>

      <View className="p-4">
        <View className="bg-card rounded-2xl border border-border p-4">
          {PREF_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <View key={item.key} className={`flex-row items-center justify-between py-4 ${idx < PREF_ITEMS.length - 1 ? "border-b border-border" : ""}`}>
                <View className="flex-row items-center flex-1 mr-4">
                  <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3">
                    <Icon size={20} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">{item.label}</Text>
                    <Text className="text-muted-foreground text-xs mt-0.5">{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={prefs?.[item.key] ?? true}
                  onValueChange={() => togglePref(item.key)}
                  trackColor={{ false: "#d6d3d1", true: "#ea580c" }}
                  thumbColor="white"
                />
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
