import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Menu, Search, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { brand, shadows } from "@/theme";
import { Gradient } from "./Gradient";
import { DrawerMenu } from "./DrawerMenu";

type Props = {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  showGreeting?: boolean;
};

/**
 * Sticky top bar — menu button on the left, delivery pill in the middle,
 * cart pill on the right, search row underneath.
 * Mirrors the halal-harvest TopBar but stripped of the dark-mode toggle for v1.
 */
export function MobileTopBar({ onMenuPress, onSearchPress, showGreeting = true }: Props) {
  const router = useRouter();
  const { itemCount } = useCart();
  const { t } = useLang();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View className="px-5 pt-3 pb-3 bg-background">
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={() => (onMenuPress ? onMenuPress() : setDrawerOpen(true))}
          className="w-11 h-11 rounded-2xl bg-card items-center justify-center border border-border"
          style={shadows.card}
          hitSlop={6}
        >
          <Menu size={20} color={brand.coal[900]} strokeWidth={2.2} />
        </Pressable>

        {showGreeting && (
          <View className="items-center flex-1 mx-3">
            <Text className="font-body-semibold text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("home.deliver_to")}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-gold" />
              <Text className="font-body-bold text-sm text-foreground" numberOfLines={1}>
                {user ? `${user.first_name} · 12 min` : "Barcelona · 20 min"}
              </Text>
            </View>
          </View>
        )}

        <Pressable
          onPress={() => router.push("/cart")}
          className="rounded-2xl overflow-hidden"
          style={shadows.button}
          hitSlop={6}
        >
          <Gradient name="primary" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <ShoppingBag size={20} color="#FFFFFF" strokeWidth={2.2} />
            {itemCount > 0 && (
              <View
                className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-gold items-center justify-center px-1 border-2 border-background"
              >
                <Text className="text-coal text-[10px] font-body-bold">{itemCount}</Text>
              </View>
            )}
          </Gradient>
        </Pressable>
      </View>

      <Pressable
        onPress={onSearchPress ?? (() => router.push("/search"))}
        className="flex-row items-center gap-2 bg-card border border-border rounded-2xl px-4 h-12"
        style={shadows.card}
      >
        <Search size={16} color={brand.textSecondary} />
        <Text className="flex-1 font-body text-sm text-muted-foreground" numberOfLines={1}>
          {t("home.search_placeholder")}
        </Text>
        <View className="bg-primary/10 px-2 py-1 rounded-lg">
          <Text className="font-body-bold text-[11px] text-primary">Filter</Text>
        </View>
      </Pressable>
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

export default MobileTopBar;
