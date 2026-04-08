import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, MapPin, Phone, CreditCard, Bell, Shield, HelpCircle, Settings, LogOut, ChevronRight, Heart, Globe } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type MenuItem = { id: string; label: string; icon: any; color: string; route?: string };
type MenuSection = { title: string; items: MenuItem[] };

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Mi Cuenta",
    items: [
      { id: "1", label: "Información Personal", icon: User, color: "text-blue-500", route: "/edit-profile" },
      { id: "2", label: "Direcciones", icon: MapPin, color: "text-green-500", route: "/addresses" },
    ],
  },
  {
    title: "Preferencias",
    items: [
      { id: "4", label: "Notificaciones", icon: Bell, color: "text-orange-500", route: "/notification-preferences" },
    ],
  },
  {
    title: "Soporte",
    items: [
      { id: "7", label: "Centro de Ayuda", icon: HelpCircle, color: "text-indigo-500" },
    ],
  },
];

const LANG_OPTIONS = [
  { value: "es", label: "Castellano" },
  { value: "ca", label: "Català" },
  { value: "en", label: "English" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();
  const [selectedLang, setSelectedLang] = useState(user?.preferred_lang || "es");

  const handleLangChange = async (lang: string) => {
    setSelectedLang(lang);
    await api.put("/users/", { preferred_lang: lang });
    await refreshProfile();
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <User size={64} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-bold text-foreground mb-2">Inicia sesión</Text>
        <Text className="text-muted-foreground text-center mb-6">Inicia sesión para ver tu perfil</Text>
        <TouchableOpacity onPress={() => router.push("/login")} className="bg-primary px-8 py-3 rounded-xl">
          <Text className="text-primary-foreground font-bold">Iniciar Sesión</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => item.route && router.push(item.route as any)}
        className="flex-row items-center justify-between py-3 border-b border-border"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
            <Icon size={20} className={item.color} strokeWidth={2.5} />
          </View>
          <Text className="text-foreground font-medium">{item.label}</Text>
        </View>
        <ChevronRight size={20} className="text-muted-foreground" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <View className="px-6 py-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 128 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="p-6">
          <View className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <View className="flex-row items-center gap-4">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center border-2 border-primary">
                <Text className="text-primary text-2xl font-bold">
                  {user.first_name[0]}{user.last_name[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">{user.first_name} {user.last_name}</Text>
                <Text className="text-sm text-muted-foreground mt-1">{user.email}</Text>
              </View>
            </View>

            <View className="flex-row gap-4 mt-5 pt-4 border-t border-border">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <Text className="text-xs text-muted-foreground">Teléfono</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground mt-1">{user.phone || "No añadido"}</Text>
              </View>
              <View className="w-px bg-border" />
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground" />
                  <Text className="text-xs text-muted-foreground">Miembro desde</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground mt-1">
                  {new Date(user.created_at).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="px-6 mb-6">
            <Text className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {section.title}
            </Text>
            <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        {/* Language Picker */}
        <View className="px-6 mb-6">
          <Text className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Idioma
          </Text>
          <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <Globe size={18} color="#ea580c" />
              <Text className="text-foreground font-medium">Selecciona tu idioma</Text>
            </View>
            <View className="flex-row gap-2">
              {LANG_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleLangChange(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    selectedLang === opt.value
                      ? "border-primary bg-primary"
                      : "border-border bg-muted"
                  }`}
                >
                  <Text
                    className={`font-medium text-sm ${
                      selectedLang === opt.value
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
        </View>

        {/* Logout */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-3 bg-destructive/10 py-4 rounded-2xl border border-destructive/20"
          >
            <LogOut size={20} className="text-destructive" strokeWidth={2.5} />
            <Text className="text-destructive font-semibold">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center pb-6">
          <Text className="text-xs text-muted-foreground">Azafaran v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
