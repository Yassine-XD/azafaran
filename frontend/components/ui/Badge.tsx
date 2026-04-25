import React from "react";
import { View, Text, type ViewStyle, type StyleProp } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { shadows } from "@/theme";

type Props = {
  label: string;
  tone?: "gold" | "burgundy" | "coal" | "neutral";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TONE_CONTAINER = {
  gold: "bg-gold",
  burgundy: "bg-primary",
  coal: "bg-coal",
  neutral: "bg-muted",
} as const;

const TONE_TEXT = {
  gold: "text-coal",
  burgundy: "text-primary-foreground",
  coal: "text-coal-foreground",
  neutral: "text-foreground",
} as const;

const SIZES = {
  sm: { container: "h-6 px-2.5", text: "text-[10px]" },
  md: { container: "h-8 px-3", text: "text-xs" },
} as const;

export function Badge({
  label,
  tone = "gold",
  size = "md",
  icon,
  glow = false,
  style,
}: Props) {
  const s = SIZES[size];
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full ${s.container} ${TONE_CONTAINER[tone]}`}
      style={[glow ? shadows.goldGlow : undefined, style]}
    >
      {icon}
      <Text className={`${s.text} font-body-bold uppercase tracking-wider ${TONE_TEXT[tone]}`}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Halal Certificado — always gold, always with the shield icon, subtle glow.
 */
export function HalalBadge({
  label,
  size = "md",
  style,
}: {
  label: string;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Badge
      label={label}
      tone="gold"
      size={size}
      glow
      icon={<ShieldCheck size={size === "sm" ? 12 : 14} color="#1A0F0F" />}
      style={style}
    />
  );
}

export default Badge;
