import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Bell,
  MapPin,
  HelpCircle,
  Languages,
  LogOut,
  ChevronRight,
  Award,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Button, ConfirmModal, Gradient } from "@/components/ui";
import { brand, shadows } from "@/theme";

type MenuItem = {
  id: string;
  label: string;
  sub?: string;
  icon: typeof User;
  route?: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();
  const { lang, setLang, t } = useLang();
  const [logoutModal, setLogoutModal] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLangChange = async (newLang: Lang) => {
    await setLang(newLang);
    await api.put("/users/", { preferred_lang: newLang });
    await refreshProfile();
    setLangOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setLogoutModal(false);
    await logout();
    router.replace("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-primary-tint items-center justify-center mb-6">
          <User size={32} color={brand.burgundy[600]} />
        </View>
        <Text className="font-display text-[22px] text-foreground mb-2">
          {t("profile.not_logged_title")}
        </Text>
        <Text className="font-body text-muted-foreground text-center mb-8 leading-6">
          {t("profile.not_logged_subtitle")}
        </Text>
        <Button
          label={t("profile.not_logged_button")}
          onPress={() => router.push("/login")}
          fullWidth={false}
        />
      </SafeAreaView>
    );
  }

  const langLabel = LANGUAGES.find((l) => l.value === lang)?.label ?? lang;

  const menu: MenuItem[] = [
    {
      id: "info",
      label: t("profile.menu_personal_info"),
      sub: t("profile.menu_info_sub"),
      icon: User,
      route: "/edit-profile",
    },
    {
      id: "notifications",
      label: t("profile.menu_notifications"),
      sub: t("profile.menu_notif_sub"),
      icon: Bell,
      route: "/notification-preferences",
    },
    {
      id: "addresses",
      label: t("profile.menu_directions"),
      sub: t("profile.menu_directions_sub"),
      icon: MapPin,
      route: "/addresses",
    },
    {
      id: "help",
      label: t("profile.menu_help"),
      sub: t("profile.menu_help_sub"),
      icon: HelpCircle,
      route: "/support",
    },
    {
      id: "lang",
      label: t("profile.language_section"),
      sub: langLabel,
      icon: Languages,
      onPress: () => setLangOpen((o) => !o),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-2 pb-5">
          <Text className="font-display text-3xl leading-9 text-foreground">
            {t("profile.title")}
          </Text>
        </View>

        {/* Hero card */}
        <View className="rounded-3xl overflow-hidden mb-5" style={shadows.cardLift}>
          <Gradient name="meat" style={{ padding: 20 }}>
            {/* Decorative gold blur */}
            <View
              style={{
                position: "absolute",
                right: -40,
                top: -40,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: brand.gold[400],
                opacity: 0.25,
              }}
            />
            <View className="flex-row items-center gap-4">
              <View
                className="w-16 h-16 rounded-2xl bg-card items-center justify-center"
                style={shadows.card}
              >
                <Text className="font-display-black text-foreground text-xl">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </Text>
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-display text-white text-xl" numberOfLines={1}>
                  {user.first_name} {user.last_name}
                </Text>
                <Text className="font-body text-white/80 text-xs" numberOfLines={1}>
                  {user.email}
                </Text>
                {user.phone && (
                  <Text className="font-body text-white/80 text-xs">{user.phone}</Text>
                )}
                <View className="self-start flex-row items-center gap-1 bg-gold px-2 py-0.5 rounded-full mt-1.5">
                  <Award size={12} color={brand.coal[900]} strokeWidth={2.4} />
                  <Text className="font-body-bold text-coal text-[10px] uppercase">
                    {t("profile.gold_member")}
                  </Text>
                </View>
              </View>
            </View>
          </Gradient>
        </View>

        {/* Menu list (single card) */}
        <View
          className="bg-card rounded-3xl border border-border overflow-hidden"
          style={shadows.card}
        >
          {menu.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === menu.length - 1;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.onPress) item.onPress();
                  else if (item.route) router.push(item.route as never);
                }}
                className={`flex-row items-center gap-3 p-4 ${
                  isLast ? "" : "border-b border-border"
                }`}
              >
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <Icon size={20} color={brand.burgundy[600]} strokeWidth={2.2} />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-body-bold text-sm text-foreground">{item.label}</Text>
                  {item.sub && (
                    <Text className="font-body text-xs text-muted-foreground">{item.sub}</Text>
                  )}
                </View>
                <ChevronRight size={16} color={brand.textSecondary} />
              </Pressable>
            );
          })}
        </View>

        {/* Inline language selector */}
        {langOpen && (
          <View
            className="bg-card rounded-2xl border border-border mt-3 p-1 flex-row"
            style={shadows.card}
          >
            {LANGUAGES.map((opt) => {
              const active = lang === opt.value;
              if (active) {
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleLangChange(opt.value)}
                    className="flex-1 rounded-xl overflow-hidden"
                  >
                    <Gradient
                      name="primary"
                      style={{ height: 40, alignItems: "center", justifyContent: "center" }}
                    >
                      <Text className="font-body-bold text-xs text-white">{opt.label}</Text>
                    </Gradient>
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleLangChange(opt.value)}
                  className="flex-1 h-10 items-center justify-center"
                >
                  <Text className="font-body-bold text-xs text-muted-foreground">
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Logout */}
        <Pressable
          onPress={() => setLogoutModal(true)}
          className="flex-row items-center justify-center gap-2 h-14 rounded-2xl bg-destructive/10 mt-5"
        >
          <LogOut size={18} color="#B91C1C" strokeWidth={2.4} />
          <Text className="font-body-bold text-destructive text-sm">
            {t("profile.logout")}
          </Text>
        </Pressable>

        <View className="items-center pt-4">
          <Text className="font-body text-[11px] text-muted-foreground">
            v1.0 · Azafarán
          </Text>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={logoutModal}
        tone="destructive"
        title={t("profile.logout_title")}
        message={t("profile.logout_message")}
        confirmLabel={t("profile.logout")}
        cancelLabel={t("profile.logout_cancel")}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutModal(false)}
      />
    </SafeAreaView>
  );
}
