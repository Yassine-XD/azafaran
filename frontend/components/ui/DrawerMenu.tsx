import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import {
  X,
  Bell,
  ShoppingBag,
  CreditCard,
  User,
  Grid,
  Tag,
  Award,
  Receipt,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Gradient } from "./Gradient";
import { brand, shadows } from "@/theme";

type Item = { label: string; route: string; icon: typeof Receipt };

/**
 * Slide-in left drawer that mirrors halal-harvest's top-bar menu — user
 * avatar header, list of nav links, and a gradient-meat promo card at the
 * bottom that pushes a coupon code.
 */
export function DrawerMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();

  const items: Item[] = [
    { label: t("tabs.orders"), route: "/(tabs)/orders", icon: Receipt },
    { label: t("cart.title"), route: "/cart", icon: ShoppingBag },
    { label: t("profile.menu_personal_info"), route: "/edit-profile", icon: User },
    { label: t("tabs.categories"), route: "/(tabs)/categories", icon: Grid },
    { label: t("tabs.deals"), route: "/(tabs)/deals", icon: Tag },
    { label: "Direcciones", route: "/addresses", icon: CreditCard },
  ];

  const go = (route: string) => {
    onClose();
    router.push(route as never);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable className="flex-1 bg-coal/50" onPress={onClose}>
        <Pressable
          onPress={() => {}}
          className="h-full bg-card p-6"
          style={{ width: "78%", maxWidth: 320, ...shadows.cardLift }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <View className="rounded-2xl overflow-hidden" style={{ width: 48, height: 48 }}>
                <Gradient
                  name="primary"
                  style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                >
                  <Text className="font-display-black text-white text-lg">
                    {user ? `${user.first_name[0]}${user.last_name[0]}` : "AZ"}
                  </Text>
                </Gradient>
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-sm text-foreground" numberOfLines={1}>
                  {user ? `${user.first_name} ${user.last_name}` : "Azafarán"}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Award size={10} color={brand.gold[600]} strokeWidth={2.4} />
                  <Text className="font-body-bold text-[10px] text-gold-deep uppercase">
                    {t("profile.gold_member")}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-xl bg-muted items-center justify-center"
              hitSlop={6}
            >
              <X size={16} color={brand.coal[900]} />
            </Pressable>
          </View>

          {/* Nav list */}
          <View className="gap-1">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <Pressable
                  key={it.route}
                  onPress={() => go(it.route)}
                  className="flex-row items-center gap-3 px-4 py-3 rounded-xl"
                >
                  <Icon size={16} color={brand.coal[900]} strokeWidth={2.2} />
                  <Text className="font-body-bold text-sm text-foreground">{it.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Promo card */}
          <View className="mt-auto rounded-2xl overflow-hidden" style={shadows.cardLift}>
            <Gradient name="meat" style={{ padding: 16 }}>
              <Bell size={20} color="#FFFFFF" strokeWidth={2.2} />
              <Text className="font-display text-white text-lg mt-2">20% de descuento</Text>
              <Text className="font-body text-white/80 text-xs">Usa el código FRESH20</Text>
            </Gradient>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default DrawerMenu;
