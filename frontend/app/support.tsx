import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  ChevronRight,
  CircleDot,
} from "lucide-react-native";
import { fetchTickets, Ticket, TicketStatus } from "@/lib/tickets";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_STYLES: Record<
  TicketStatus,
  { bg: string; text: string }
> = {
  open: { bg: "bg-orange-100", text: "text-orange-700" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700" },
  waiting_user: { bg: "bg-amber-100", text: "text-amber-700" },
  resolved: { bg: "bg-green-100", text: "text-green-700" },
  closed: { bg: "bg-muted", text: "text-muted-foreground" },
};

export default function SupportScreen() {
  const router = useRouter();
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchTickets();
    if (res.success && res.data) setTickets(res.data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <MessageCircle size={64} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-bold text-foreground mb-2">
          {t("profile.not_logged_title")}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="bg-primary px-8 py-3 rounded-xl mt-3"
        >
          <Text className="text-primary-foreground font-bold">
            {t("profile.not_logged_button")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">
          {t("support.title")}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="bg-card rounded-2xl p-5 mb-4 border border-border">
            <Text className="text-lg font-bold text-foreground mb-1">
              {t("support.intro_title")}
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              {t("support.intro_subtitle")}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/support-new")}
              className="flex-row items-center justify-center gap-2 bg-primary py-3 rounded-xl"
            >
              <Plus size={18} color="white" strokeWidth={2.5} />
              <Text className="text-primary-foreground font-bold">
                {t("support.new_ticket")}
              </Text>
            </TouchableOpacity>
          </View>

          {tickets.length === 0 ? (
            <View className="items-center py-12">
              <MessageCircle
                size={56}
                className="text-muted-foreground mb-3"
              />
              <Text className="text-foreground font-semibold text-base mb-1">
                {t("support.empty_title")}
              </Text>
              <Text className="text-sm text-muted-foreground text-center px-6">
                {t("support.empty_subtitle")}
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {tickets.map((tk) => {
                const s = STATUS_STYLES[tk.status];
                return (
                  <TouchableOpacity
                    key={tk.id}
                    onPress={() =>
                      router.push({
                        pathname: "/support-ticket",
                        params: { id: tk.id },
                      })
                    }
                    className="bg-card rounded-2xl p-4 border border-border"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-xs font-mono text-muted-foreground">
                            {tk.ticket_number}
                          </Text>
                          {tk.unread_for_user && (
                            <CircleDot size={10} color="#ea580c" />
                          )}
                        </View>
                        <Text
                          className="text-foreground font-semibold mt-0.5"
                          numberOfLines={1}
                        >
                          {tk.subject}
                        </Text>
                      </View>
                      <View className={`px-2 py-0.5 rounded-full ${s.bg}`}>
                        <Text className={`text-[11px] font-semibold ${s.text}`}>
                          {t(`support.status_${tk.status}`)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-xs text-muted-foreground flex-1 pr-2"
                        numberOfLines={1}
                      >
                        {tk.last_message || ""}
                      </Text>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
