import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  tone?: "burgundy" | "wine" | "coal";
};

const ACTIVE_BG = {
  burgundy: "bg-primary",
  wine: "bg-wine",
  coal: "bg-coal",
} as const;

const ACTIVE_TEXT = {
  burgundy: "text-primary-foreground",
  wine: "text-wine-foreground",
  coal: "text-coal-foreground",
} as const;

/**
 * Pill-shaped filter chip. Active state fills with the tone color, inactive is
 * white with a soft border — gives the filter bar enough contrast to read as a
 * real control.
 */
export function Chip({ label, active = false, onPress, icon, tone = "burgundy" }: Props) {
  const containerClass = [
    "flex-row items-center gap-1.5 h-9 px-4 rounded-full border",
    active ? `${ACTIVE_BG[tone]} border-transparent` : "bg-card border-border",
  ].join(" ");

  const textClass = [
    "font-body-semibold text-xs",
    active ? ACTIVE_TEXT[tone] : "text-foreground",
  ].join(" ");

  return (
    <Pressable onPress={onPress} className={containerClass}>
      {icon ? <View>{icon}</View> : null}
      <Text className={textClass}>{label}</Text>
    </Pressable>
  );
}

export default Chip;
