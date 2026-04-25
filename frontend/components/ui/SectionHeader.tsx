import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";

type Props = {
  title: string;
  eyebrow?: string;
  accent?: "burgundy" | "gold";
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
};

/**
 * Section header with a left accent bar (burgundy or gold) and a serif title.
 * Use above every horizontal product row and content section.
 */
export function SectionHeader({
  title,
  eyebrow,
  accent = "burgundy",
  actionLabel,
  onActionPress,
  className = "",
}: Props) {
  const barColor = accent === "gold" ? "bg-gold" : "bg-primary";

  return (
    <View className={`flex-row items-end justify-between ${className}`}>
      <View className="flex-row items-start gap-3 flex-1">
        <View className={`w-1 self-stretch rounded-full mt-1 ${barColor}`} />
        <View className="flex-1">
          {eyebrow && (
            <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
              {eyebrow}
            </Text>
          )}
          <Text className="font-display text-[22px] leading-7 text-foreground">
            {title}
          </Text>
        </View>
      </View>

      {actionLabel && onActionPress && (
        <Pressable
          onPress={onActionPress}
          className="flex-row items-center gap-1 pl-3"
          hitSlop={8}
        >
          <Text className="font-body-semibold text-sm text-primary">{actionLabel}</Text>
          <ChevronRight size={16} color="#7A0E1F" />
        </Pressable>
      )}
    </View>
  );
}

export default SectionHeader;
