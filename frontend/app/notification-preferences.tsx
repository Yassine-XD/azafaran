import { useEffect, useState } from "react";
import { ScrollView, View, Pressable, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Display, Heading3, Body, Small, Caption } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { NotificationPreferences } from "@/lib/types";

const KEYS: { k: keyof NotificationPreferences; title: string; subtitle: string }[] = [
  { k: "order_updates", title: "Actualizaciones de pedido", subtitle: "Confirmaciones, envíos y entregas." },
  { k: "promotions", title: "Ofertas y promociones", subtitle: "Descuentos y novedades." },
  { k: "reorder_reminders", title: "Recordatorios de reorden", subtitle: "Te avisamos cuando toque repetir." },
  { k: "ai_suggestions", title: "Sugerencias inteligentes", subtitle: "Recomendaciones según tu historial." },
];

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api.get<NotificationPreferences>("/users/me/notification-preferences").then((r) => {
      if (r.success && r.data) setPrefs(r.data);
      setLoading(false);
    });
  }, [isAuthenticated]);

  const toggle = async (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    const r = await api.put("/users/me/notification-preferences", next);
    if (!r.success) {
      setPrefs(prefs);
      Alert.alert(t("common.error"), r.error?.message || t("rebuild.product.add_failed_retry"));
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-5 py-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-muted">
          <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
        </Pressable>
        <Display>{t("rebuild.profile.notifications")}</Display>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12">
        {!isAuthenticated ? (
          <View className="py-10">
            <Body className="text-muted-foreground">
              {t("rebuild.orders.auth_required")}
            </Body>
          </View>
        ) : loading ? (
          <View className="gap-3 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </View>
        ) : prefs ? (
          <View className="mt-2">
            <Caption className="uppercase tracking-wide text-muted-foreground mb-2 px-1">
              Tipos de notificación
            </Caption>
            <View className="rounded-2xl bg-card border border-border overflow-hidden">
              {KEYS.map((row, i) => (
                <View
                  key={row.k}
                  className={`flex-row items-center px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <View className="flex-1 pr-3">
                    <Heading3>{row.title}</Heading3>
                    <Small className="mt-0.5 text-muted-foreground">{row.subtitle}</Small>
                  </View>
                  <Switch
                    value={!!prefs[row.k]}
                    onValueChange={() => toggle(row.k)}
                    trackColor={{ false: "#E5E5E7", true: "#1F1F22" }}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
