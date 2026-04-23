import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import TicketAttachmentPicker from "@/components/TicketAttachmentPicker";
import {
  createTicket,
  LocalAttachment,
  TicketCategory,
} from "@/lib/tickets";
import { useLang } from "@/contexts/LanguageContext";

const CATEGORIES: TicketCategory[] = [
  "order",
  "payment",
  "delivery",
  "product",
  "account",
  "other",
];

export default function SupportNewScreen() {
  const router = useRouter();
  const { t } = useLang();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("other");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<LocalAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    subject.trim().length >= 3 && body.trim().length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await createTicket({
      subject: subject.trim(),
      category,
      body: body.trim(),
      files,
    });
    setSubmitting(false);

    if (!res.success || !res.data) {
      Alert.alert(
        t("support.error_title"),
        res.error?.message || t("support.error_generic"),
      );
      return;
    }

    router.replace({
      pathname: "/support-ticket",
      params: { id: res.data.id },
    });
  };

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
          {t("support.new_ticket")}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm font-semibold text-foreground mb-2">
            {t("support.subject")}
          </Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={t("support.subject_placeholder")}
            placeholderTextColor="#a8a29e"
            maxLength={200}
            className="bg-card border border-border rounded-xl px-4 py-3 text-foreground mb-4"
          />

          <Text className="text-sm font-semibold text-foreground mb-2">
            {t("support.category")}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  className={`px-3 py-2 rounded-full border ${
                    active ? "bg-primary border-primary" : "bg-card border-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {t(`support.category_${c}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-sm font-semibold text-foreground mb-2">
            {t("support.message")}
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={t("support.message_placeholder")}
            placeholderTextColor="#a8a29e"
            multiline
            textAlignVertical="top"
            maxLength={5000}
            className="bg-card border border-border rounded-xl px-4 py-3 text-foreground mb-4"
            style={{ minHeight: 140 }}
          />

          <Text className="text-sm font-semibold text-foreground mb-2">
            {t("support.attachments")}
          </Text>
          <TicketAttachmentPicker value={files} onChange={setFiles} />
          <Text className="text-xs text-muted-foreground mt-2">
            {t("support.attach_hint")}
          </Text>
        </ScrollView>

        <View className="px-4 pb-4 pt-2 border-t border-border bg-background">
          <TouchableOpacity
            onPress={submit}
            disabled={!canSubmit}
            className="flex-row items-center justify-center gap-2 bg-primary py-3.5 rounded-xl"
            style={{ opacity: canSubmit ? 1 : 0.5 }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Send size={18} color="white" strokeWidth={2.5} />
                <Text className="text-primary-foreground font-bold">
                  {t("support.send")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
