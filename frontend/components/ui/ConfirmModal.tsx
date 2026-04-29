import React, { useEffect } from "react";
import { Modal, View, Text, Pressable, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react-native";
import { brand, shadows } from "@/theme";

export type ConfirmModalTone = "destructive" | "success" | "info";

type Props = {
  visible: boolean;
  tone?: ConfirmModalTone;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
};

const TONE_ACCENT: Record<ConfirmModalTone, { bg: string; ring: string; fg: string }> = {
  destructive: { bg: "bg-destructive/10", ring: "border-destructive/30", fg: "#B91C1C" },
  success: { bg: "bg-gold/15", ring: "border-gold/40", fg: brand.gold[600] },
  info: { bg: "bg-primary-tint", ring: "border-primary/20", fg: brand.burgundy[600] },
};

const TONE_BUTTON: Record<ConfirmModalTone, string> = {
  destructive: "bg-destructive",
  success: "bg-primary",
  info: "bg-primary",
};

function ToneIcon({ tone, color }: { tone: ConfirmModalTone; color: string }) {
  if (tone === "destructive") return <AlertTriangle size={28} color={color} strokeWidth={2.2} />;
  if (tone === "success") return <CheckCircle2 size={28} color={color} strokeWidth={2.2} />;
  return <Info size={28} color={color} strokeWidth={2.2} />;
}

/**
 * Branded confirmation dialog. Replaces RN's `Alert.alert` for richer styling,
 * tone-driven accent (destructive / success / info), and consistent
 * burgundy-themed UI.
 */
export function ConfirmModal({
  visible,
  tone = "info",
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false,
  icon,
  onConfirm,
  onCancel,
}: Props) {
  const overlay = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (visible) {
      overlay.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      scale.value = withSpring(1, { damping: 16, stiffness: 220 });
    } else {
      overlay.value = withTiming(0, { duration: 140 });
      scale.value = withTiming(0.94, { duration: 140 });
    }
  }, [visible, overlay, scale]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
    transform: [{ scale: scale.value }],
  }));

  const accent = TONE_ACCENT[tone];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View
        style={overlayStyle}
        className="flex-1 items-center justify-center px-6"
      >
        <Pressable
          onPress={onCancel}
          className="absolute inset-0 bg-black/55"
          accessibilityLabel="Close"
        />
        <Animated.View
          style={[shadows.cardLift, cardStyle]}
          className="w-full max-w-sm rounded-3xl bg-card px-6 pt-7 pb-5"
        >
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center self-center mb-4 border ${accent.bg} ${accent.ring}`}
          >
            {icon ?? <ToneIcon tone={tone} color={accent.fg} />}
          </View>

          <Text className="font-display text-[22px] leading-7 text-foreground text-center">
            {title}
          </Text>

          {message ? (
            <Text className="font-body text-[14px] leading-6 text-muted-foreground text-center mt-2">
              {message}
            </Text>
          ) : null}

          <View className="mt-6 gap-2">
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className={`h-13 rounded-2xl items-center justify-center ${TONE_BUTTON[tone]} ${loading ? "opacity-70" : ""}`}
              style={[shadows.button, { height: 52 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-body-bold text-[15px] text-primary-foreground">
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
            {cancelLabel ? (
              <Pressable
                onPress={onCancel}
                disabled={loading}
                className="h-13 rounded-2xl items-center justify-center bg-muted/60"
                style={{ height: 52 }}
              >
                <Text className="font-body-semibold text-[15px] text-foreground">
                  {cancelLabel}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default ConfirmModal;
