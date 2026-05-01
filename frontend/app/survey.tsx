import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

type QuestionType =
  | "text"
  | "single_choice"
  | "multi_choice"
  | "rating"
  | "yes_no"
  | "number";

type Question = {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
};

export default function SurveyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();

  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [notAvailable, setNotAvailable] = useState(false);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const me = await api.get<{ submitted: boolean }>(`/surveys/${id}/me`);
      if (cancelled) return;
      if (!me.success) {
        setNotAvailable(true);
        setLoading(false);
        return;
      }
      if (me.data?.submitted) {
        setSubmitted(true);
        setLoading(false);
        return;
      }
      const s = await api.get<Survey>(`/surveys/${id}`);
      if (cancelled) return;
      if (!s.success || !s.data) {
        setNotAvailable(true);
      } else {
        setSurvey(s.data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const setAnswer = (qid: string, value: unknown) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
    if (errors[qid]) setErrors((e) => ({ ...e, [qid]: false }));
  };

  const validate = (): boolean => {
    if (!survey) return false;
    const next: Record<string, boolean> = {};
    let ok = true;
    for (const q of survey.questions) {
      if (!q.required) continue;
      const v = answers[q.id];
      const empty =
        v === undefined ||
        v === null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0);
      if (empty) {
        next[q.id] = true;
        ok = false;
      }
    }
    setErrors(next);
    return ok;
  };

  const submit = async () => {
    if (!survey) return;
    setSubmitError(null);
    if (!validate()) {
      setSubmitError(t("survey.validation_error"));
      return;
    }
    setSubmitting(true);
    const res = await api.post(`/surveys/${survey.id}/responses`, { answers });
    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      return;
    }
    if (res.error?.code === "SURVEY_ALREADY_SUBMITTED") {
      setSubmitted(true);
      return;
    }
    setSubmitError(res.error?.message || t("survey.validation_error"));
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-muted-foreground mt-3">{t("survey.loading")}</Text>
      </SafeAreaView>
    );
  }

  if (notAvailable) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <Header title={t("survey.title")} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-foreground text-center text-base">
            {t("survey.not_available")}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-5 py-3 bg-primary rounded-xl"
          >
            <Text className="text-white font-semibold">{t("survey.close")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <Header title={t("survey.title")} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <CheckCircle2 size={48} color="#ea580c" />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center">
            {t("survey.thank_you_title")}
          </Text>
          <Text className="text-muted-foreground text-center mt-2">
            {t("survey.thank_you_body")}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-5 py-3 bg-primary rounded-xl"
          >
            <Text className="text-white font-semibold">{t("survey.close")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!survey) return null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title={t("survey.title")} onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-foreground">
            {survey.title}
          </Text>
          {survey.description ? (
            <Text className="text-muted-foreground mt-1 mb-4">
              {survey.description}
            </Text>
          ) : (
            <View className="h-4" />
          )}

          {survey.questions.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              index={idx}
              question={q}
              value={answers[q.id]}
              error={errors[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
              tRequired={t("survey.required")}
              tYes={t("survey.yes")}
              tNo={t("survey.no")}
              tTextPh={t("survey.text_placeholder")}
              tNumberPh={t("survey.number_placeholder")}
            />
          ))}

          {submitError ? (
            <Text className="text-red-600 text-sm mb-3">{submitError}</Text>
          ) : null}

          <TouchableOpacity
            onPress={submit}
            disabled={submitting}
            className={`py-4 rounded-xl items-center ${
              submitting ? "bg-primary/60" : "bg-primary"
            }`}
          >
            <Text className="text-white font-semibold">
              {submitting ? t("survey.submitting") : t("survey.submit")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View className="px-4 py-3 flex-row items-center border-b border-border">
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 items-center justify-center"
      >
        <ArrowLeft size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-foreground ml-2">{title}</Text>
    </View>
  );
}

function QuestionBlock({
  index,
  question,
  value,
  error,
  onChange,
  tRequired,
  tYes,
  tNo,
  tTextPh,
  tNumberPh,
}: {
  index: number;
  question: Question;
  value: unknown;
  error?: boolean;
  onChange: (value: unknown) => void;
  tRequired: string;
  tYes: string;
  tNo: string;
  tTextPh: string;
  tNumberPh: string;
}) {
  return (
    <View
      className={`mb-5 p-4 rounded-2xl border ${
        error ? "border-red-400 bg-red-50" : "border-border bg-card"
      }`}
    >
      <Text className="text-foreground font-semibold mb-2">
        {index + 1}. {question.label}
        {question.required ? (
          <Text className="text-red-500"> *</Text>
        ) : null}
      </Text>

      {question.type === "text" && (
        <TextInput
          className="border border-border rounded-xl px-3 py-3 text-foreground"
          placeholder={tTextPh}
          placeholderTextColor="#9ca3af"
          multiline
          value={typeof value === "string" ? value : ""}
          onChangeText={(v) => onChange(v)}
        />
      )}

      {question.type === "number" && (
        <TextInput
          className="border border-border rounded-xl px-3 py-3 text-foreground"
          placeholder={tNumberPh}
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={value === undefined || value === null ? "" : String(value)}
          onChangeText={(v) => {
            if (v === "") {
              onChange(undefined);
              return;
            }
            const n = Number(v);
            onChange(Number.isNaN(n) ? undefined : n);
          }}
        />
      )}

      {question.type === "yes_no" && (
        <View className="flex-row gap-2">
          {[true, false].map((opt) => {
            const selected = value === opt;
            return (
              <Pressable
                key={String(opt)}
                onPress={() => onChange(opt)}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  selected
                    ? "bg-primary border-primary"
                    : "bg-card border-border"
                }`}
              >
                <Text
                  className={selected ? "text-white font-semibold" : "text-foreground"}
                >
                  {opt ? tYes : tNo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.type === "single_choice" && question.options && (
        <View className="gap-2">
          {question.options.map((opt) => {
            const selected = value === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => onChange(opt)}
                className={`flex-row items-center py-3 px-3 rounded-xl border ${
                  selected
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    selected ? "border-primary" : "border-muted-foreground"
                  }`}
                >
                  {selected ? (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  ) : null}
                </View>
                <Text className="text-foreground flex-1">{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.type === "multi_choice" && question.options && (
        <View className="gap-2">
          {question.options.map((opt) => {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            const selected = arr.includes(opt);
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  const next = selected
                    ? arr.filter((x) => x !== opt)
                    : [...arr, opt];
                  onChange(next);
                }}
                className={`flex-row items-center py-3 px-3 rounded-xl border ${
                  selected
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded mr-3 items-center justify-center border-2 ${
                    selected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {selected ? (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  ) : null}
                </View>
                <Text className="text-foreground flex-1">{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.type === "rating" && (
        <View className="flex-row justify-around py-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = typeof value === "number" && value >= n;
            return (
              <Pressable key={n} onPress={() => onChange(n)} className="p-1">
                <Star
                  size={32}
                  color={filled ? "#ea580c" : "#d1d5db"}
                  fill={filled ? "#ea580c" : "none"}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
