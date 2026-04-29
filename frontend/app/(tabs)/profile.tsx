import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  MapPin,
  Phone,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Globe,
  Calendar,
  Trash2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Button, Card, HalalBadge } from "@/components/ui";
import { brand, shadows } from "@/theme";

type MenuItem = {
  id: string;
  label: string;
  icon: typeof User;
  route?: string;
  iconBg: string;
  iconColor: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();
  const { lang, setLang, t } = useLang();

  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: t("profile.section_account"),
      items: [
        {
          id: "1",
          label: t("profile.menu_personal_info"),
          icon: User,
          iconBg: "bg-primary-tint",
          iconColor: brand.burgundy[600],
          route: "/edit-profile",
        },
        {
          id: "2",
          label: t("profile.menu_addresses"),
          icon: MapPin,
          iconBg: "bg-gold/15",
          iconColor: brand.gold[600],
          route: "/addresses",
        },
      ],
    },
    {
      title: t("profile.section_preferences"),
      items: [
        {
          id: "4",
          label: t("profile.menu_notifications"),
          icon: Bell,
          iconBg: "bg-primary-tint",
          iconColor: brand.burgundy[600],
          route: "/notification-preferences",
        },
      ],
    },
    {
      title: t("profile.section_support"),
      items: [
        {
          id: "7",
          label: t("profile.menu_help"),
          icon: HelpCircle,
          iconBg: "bg-gold/15",
          iconColor: brand.gold[600],
          route: "/support",
        },
      ],
    },
  ];

  const handleLangChange = async (newLang: Lang) => {
    await setLang(newLang);
    await api.put("/users/", { preferred_lang: newLang });
    await refreshProfile();
  };

  const handleLogout = () => {
    Alert.alert(t("profile.logout_title"), t("profile.logout_message"), [
      { text: t("profile.logout_cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("profile.delete_account_title"),
      t("profile.delete_account_message"),
      [
        { text: t("profile.logout_cancel"), style: "cancel" },
        {
          text: t("profile.delete_account_confirm"),
          style: "destructive",
          onPress: async () => {
            const res = await api.delete("/users/");
            if (!res.success) {
              Alert.alert(
                t("profile.delete_account_title"),
                res.error?.message || t("profile.delete_account_error"),
              );
              return;
            }
            await logout();
            router.replace("/login");
          },
        },
      ],
    );
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

  const renderMenuItem = (item: MenuItem, isLast: boolean) => {
    const Icon = item.icon;
    return (
      <Pressable
        key={item.id}
        onPress={() => item.route && router.push(item.route as never)}
        className={`flex-row items-center gap-3 py-3 ${isLast ? "" : "border-b border-borderSoft border-border"}`}
      >
        <View className={`w-10 h-10 rounded-2xl items-center justify-center ${item.iconBg}`}>
          <Icon size={18} color={item.iconColor} strokeWidth={2.4} />
        </View>
        <Text className="flex-1 font-body-semibold text-[15px] text-foreground">
          {item.label}
        </Text>
        <ChevronRight size={18} color={brand.textSecondary} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <View className="px-5 pt-2 pb-4">
        <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Azafarán
        </Text>
        <Text className="font-display text-[30px] leading-9 text-foreground">
          {t("profile.title")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card with gold halal accent */}
        <Card className="overflow-hidden mb-7">
          <View className="bg-coal px-5 pt-5 pb-12">
            <View className="flex-row items-center gap-4">
              <View
                className="w-16 h-16 rounded-2xl bg-primary items-center justify-center"
                style={shadows.button}
              >
                <Text className="font-display-black text-white text-xl">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-display text-white text-[20px]">
                  {user.first_name} {user.last_name}
                </Text>
                <Text className="font-body text-white/65 text-xs mt-0.5">{user.email}</Text>
              </View>
              <HalalBadge label={t("home.halal_badge")} size="sm" />
            </View>
          </View>

          <View className="px-5 -mt-7 pb-5">
            <View
              className="bg-card rounded-2xl px-4 py-4 flex-row"
              style={shadows.card}
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Phone size={12} color={brand.textSecondary} strokeWidth={2.4} />
                  <Text className="font-body-semibold text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("profile.phone_label")}
                  </Text>
                </View>
                <Text className="font-body-semibold text-[14px] text-foreground">
                  {user.phone || t("profile.not_added")}
                </Text>
              </View>
              <View className="w-px bg-border mx-3" />
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Calendar size={12} color={brand.textSecondary} strokeWidth={2.4} />
                  <Text className="font-body-semibold text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("profile.member_since")}
                  </Text>
                </View>
                <Text className="font-body-semibold text-[14px] text-foreground">
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-3 px-1">
              {section.title}
            </Text>
            <Card className="px-4 py-1">
              {section.items.map((item, idx) => renderMenuItem(item, idx === section.items.length - 1))}
            </Card>
          </View>
        ))}

        {/* Language */}
        <View className="mb-6">
          <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-3 px-1">
            {t("profile.language_section")}
          </Text>
          <Card className="p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Globe size={16} color={brand.gold[600]} strokeWidth={2.4} />
              <Text className="font-body-semibold text-[13px] text-foreground">
                {t("profile.language_label")}
              </Text>
            </View>
            <View className="flex-row bg-muted rounded-2xl p-1">
              {LANGUAGES.map((opt) => {
                const active = lang === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleLangChange(opt.value)}
                    className={`flex-1 items-center justify-center py-2.5 rounded-xl ${active ? "bg-primary" : ""}`}
                    style={active ? shadows.button : undefined}
                  >
                    <Text
                      className={`font-body-semibold text-[13px] ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-3 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 mb-4"
        >
          <LogOut size={18} color="#B91C1C" strokeWidth={2.4} />
          <Text className="font-body-bold text-destructive text-[15px]">
            {t("profile.logout")}
          </Text>
        </Pressable>

        {/* Delete account (Play Store policy: in-app account deletion) */}
        <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-3 px-1 mt-2">
          {t("profile.section_danger")}
        </Text>
        <Pressable
          onPress={handleDeleteAccount}
          className="flex-row items-center justify-center gap-3 h-14 rounded-2xl border border-destructive/40 mb-4"
        >
          <Trash2 size={18} color="#B91C1C" strokeWidth={2.4} />
          <Text className="font-body-bold text-destructive text-[15px]">
            {t("profile.delete_account")}
          </Text>
        </Pressable>

        <View className="items-center pt-2">
          <Text className="font-body text-[11px] text-muted-foreground">
            {t("profile.version")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
