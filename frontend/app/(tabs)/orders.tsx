import { useState } from "react";
import { ScrollView, View, RefreshControl, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp, Repeat } from "lucide-react-native";

import { Display, Heading3, Body, Small, Caption } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrders } from "@/hooks/queries";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

function statusLabel(t: (k: string) => string, s: string): string {
  switch (s) {
    case "pending": return t("rebuild.orders.status_pending");
    case "confirmed": return t("rebuild.orders.status_confirmed");
    case "preparing": return t("rebuild.orders.status_preparing");
    case "shipped": return t("rebuild.orders.status_shipped");
    case "delivered": return t("rebuild.orders.status_delivered");
    case "cancelled": return t("rebuild.orders.status_cancelled");
    default: return s;
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const orders = useOrders({ enabled: isAuthenticated });
  const [openId, setOpenId] = useState<string | null>(null);

  const onReorder = async (orderId: string) => {
    const r = await api.post(`/orders/${orderId}/reorder`);
    if (r.success) {
      router.push("/cart");
    } else {
      Alert.alert(t("rebuild.orders.reorder_failed"), r.error?.message || t("rebuild.product.add_failed_retry"));
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <Display className="text-center">{t("rebuild.orders.title")}</Display>
          <Body className="mt-3 text-center text-muted-foreground">
            {t("rebuild.orders.auth_required")}
          </Body>
          <Button
            title={t("rebuild.auth.login_cta")}
            variant="primary"
            size="lg"
            className="mt-8"
            onPress={() => router.push("/login")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-12"
        refreshControl={
          <RefreshControl refreshing={orders.isFetching} onRefresh={orders.refetch} tintColor="#0B0B0C" />
        }
      >
        <View className="px-5 pt-4 pb-6">
          <Display>{t("tabs.orders")}</Display>
        </View>

        <View className="px-5 gap-3">
          {orders.isLoading ? (
            <>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </>
          ) : (orders.data ?? []).length === 0 ? (
            <View className="py-20 items-center">
              <Body className="text-muted-foreground">{t("rebuild.orders.empty")}</Body>
              <Button
                title={t("rebuild.cart.empty_cta")}
                variant="secondary"
                size="md"
                className="mt-4"
                onPress={() => router.push("/(tabs)" as any)}
              />
            </View>
          ) : (
            (orders.data ?? []).map((o: any) => {
              const open = openId === o.id;
              return (
                <View key={o.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                  <Pressable
                    onPress={() => setOpenId(open ? null : o.id)}
                    className="p-4 active:opacity-90"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Caption className="uppercase tracking-wide text-muted-foreground">
                          #{o.order_number}
                        </Caption>
                        <Heading3 className="mt-0.5">
                          {statusLabel(t, o.status)}
                        </Heading3>
                        <Small className="mt-1 text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </Small>
                      </View>
                      <View className="items-end">
                        <Body className="font-mono-semibold">{fmt(Number(o.total))}</Body>
                        <View className="flex-row items-center mt-1">
                          {open ? (
                            <ChevronUp size={16} color="#A1A1A6" strokeWidth={2} />
                          ) : (
                            <ChevronDown size={16} color="#A1A1A6" strokeWidth={2} />
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>

                  {open ? (
                    <View className="px-4 pb-4 border-t border-border">
                      {o.items?.length ? (
                        <View className="mt-3 gap-2">
                          {o.items.map((item: any) => (
                            <View key={item.id} className="flex-row justify-between">
                              <View className="flex-1 pr-3">
                                <Body numberOfLines={1}>
                                  {item.product_snapshot?.name ?? item.product_name}
                                </Body>
                                <Small className="text-muted-foreground">
                                  {item.product_snapshot?.variant_label ?? item.weight_label} ×{" "}
                                  {item.quantity}
                                </Small>
                              </View>
                              <Body className="font-mono-medium">
                                {fmt(Number(item.line_total))}
                              </Body>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      <View className="mt-4 flex-row gap-2">
                        <Button
                          title={t("rebuild.orders.reorder")}
                          variant="secondary"
                          size="sm"
                          leftIcon={<Repeat size={14} color="#0B0B0C" strokeWidth={2} />}
                          onPress={() => onReorder(o.id)}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
