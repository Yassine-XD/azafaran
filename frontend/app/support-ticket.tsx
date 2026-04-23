import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import {
  ArrowLeft,
  Send,
  FileText,
  ExternalLink,
} from "lucide-react-native";
import TicketAttachmentPicker from "@/components/TicketAttachmentPicker";
import {
  Ticket,
  TicketMessage,
  fetchTicket,
  postMessage,
  attachmentUrl,
  LocalAttachment,
  TicketStatus,
} from "@/lib/tickets";
import { useLang } from "@/contexts/LanguageContext";

const STATUS_STYLES: Record<TicketStatus, { bg: string; text: string }> = {
  open: { bg: "bg-orange-100", text: "text-orange-700" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700" },
  waiting_user: { bg: "bg-amber-100", text: "text-amber-700" },
  resolved: { bg: "bg-green-100", text: "text-green-700" },
  closed: { bg: "bg-muted", text: "text-muted-foreground" },
};

function formatKB(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageBubble({
  msg,
  tReply,
}: {
  msg: TicketMessage;
  tReply: (k: string) => string;
}) {
  const isUser = msg.sender_type === "user";
  return (
    <View
      className={`mb-3 ${isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-primary rounded-br-sm"
            : "bg-card border border-border rounded-bl-sm"
        }`}
      >
        {!isUser && (
          <Text className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 font-semibold">
            {tReply("support.admin_label")}
          </Text>
        )}
        {msg.body.trim().length > 0 && (
          <Text
            className={`${
              isUser ? "text-primary-foreground" : "text-foreground"
            } text-base`}
          >
            {msg.body}
          </Text>
        )}
        {msg.attachments && msg.attachments.length > 0 && (
          <View className="mt-2 gap-2">
            {msg.attachments.map((a) => {
              const url = attachmentUrl(a);
              const isImg = a.mime_type.startsWith("image/");
              if (isImg) {
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => Linking.openURL(url)}
                  >
                    <Image
                      source={{ uri: url }}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => Linking.openURL(url)}
                  className={`flex-row items-center gap-2 px-3 py-2 rounded-xl ${
                    isUser ? "bg-primary-foreground/10" : "bg-muted"
                  }`}
                >
                  <FileText
                    size={18}
                    color={isUser ? "white" : "#ea580c"}
                  />
                  <View className="flex-1">
                    <Text
                      className={`text-xs font-semibold ${
                        isUser ? "text-primary-foreground" : "text-foreground"
                      }`}
                      numberOfLines={1}
                    >
                      {a.file_name}
                    </Text>
                    <Text
                      className={`text-[10px] ${
                        isUser
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatKB(a.size_bytes)}
                    </Text>
                  </View>
                  <ExternalLink
                    size={14}
                    color={isUser ? "white" : "#78716c"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      <Text className="text-[10px] text-muted-foreground mt-1 px-1">
        {new Date(msg.created_at).toLocaleString()}
      </Text>
    </View>
  );
}

export default function SupportTicketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<LocalAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await fetchTicket(id);
    if (res.success && res.data) setTicket(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      const iv = setInterval(load, 15000);
      return () => clearInterval(iv);
    }, [load]),
  );

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const send = async () => {
    if (!id) return;
    const text = body.trim();
    if (!text && files.length === 0) return;
    setSending(true);
    const res = await postMessage(id, text, files);
    setSending(false);
    if (!res.success || !res.data) {
      Alert.alert(
        t("support.error_title"),
        res.error?.message || t("support.error_generic"),
      );
      return;
    }
    setTicket(res.data);
    setBody("");
    setFiles([]);
    scrollToEnd();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-foreground font-semibold text-lg mb-2">
          {t("support.not_found")}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-2 rounded-xl mt-2"
        >
          <Text className="text-primary-foreground font-semibold">
            {t("common_back")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const s = STATUS_STYLES[ticket.status];
  const isClosed = ticket.status === "closed";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text
            className="text-base font-bold text-foreground"
            numberOfLines={1}
          >
            {ticket.subject}
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-[11px] font-mono text-muted-foreground">
              {ticket.ticket_number}
            </Text>
            <View className={`px-2 py-0.5 rounded-full ${s.bg}`}>
              <Text className={`text-[10px] font-semibold ${s.text}`}>
                {t(`support.status_${ticket.status}`)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={scrollToEnd}
        >
          {(ticket.messages || []).map((msg) => (
            <MessageBubble key={msg.id} msg={msg} tReply={t} />
          ))}
        </ScrollView>

        {isClosed ? (
          <View className="px-4 py-3 border-t border-border bg-muted">
            <Text className="text-sm text-muted-foreground text-center">
              {t("support.closed_banner")}
            </Text>
          </View>
        ) : (
          <View className="border-t border-border bg-background px-3 pt-2 pb-3">
            <TicketAttachmentPicker value={files} onChange={setFiles} />
            <View className="flex-row items-end gap-2 mt-2">
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder={t("support.reply_placeholder")}
                placeholderTextColor="#a8a29e"
                multiline
                maxLength={5000}
                className="flex-1 bg-card border border-border rounded-2xl px-4 py-2 text-foreground"
                style={{ maxHeight: 120 }}
              />
              <TouchableOpacity
                onPress={send}
                disabled={
                  sending || (body.trim().length === 0 && files.length === 0)
                }
                className="w-11 h-11 rounded-full bg-primary items-center justify-center"
                style={{
                  opacity:
                    sending || (body.trim().length === 0 && files.length === 0)
                      ? 0.5
                      : 1,
                }}
              >
                {sending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Send size={18} color="white" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
