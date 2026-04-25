import React from "react";
import { View, Text } from "react-native";

type Props = {
  amount: number | string;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "burgundy" | "light" | "dark";
  compareAt?: number | string;
  suffix?: string;
  align?: "left" | "right" | "center";
};

const SIZES = {
  sm: { main: "text-lg", cmp: "text-xs" },
  md: { main: "text-2xl", cmp: "text-sm" },
  lg: { main: "text-[28px] leading-8", cmp: "text-base" },
  xl: { main: "text-[34px] leading-10", cmp: "text-lg" },
} as const;

const TONE = {
  burgundy: "text-primary",
  light: "text-coal-foreground",
  dark: "text-coal",
} as const;

const ALIGN = {
  left: "items-start",
  right: "items-end",
  center: "items-center",
} as const;

function format(value: number | string, currency: string) {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return `${currency}${value}`;
  return `${currency}${n.toFixed(2)}`;
}

/**
 * Serif price tag. Large, burgundy by default.
 */
export function PriceTag({
  amount,
  currency = "€",
  size = "lg",
  tone = "burgundy",
  compareAt,
  suffix,
  align = "left",
}: Props) {
  const s = SIZES[size];

  return (
    <View className={`flex-col ${ALIGN[align]}`}>
      <View className="flex-row items-baseline gap-2">
        <Text className={`font-display ${s.main} ${TONE[tone]}`}>
          {format(amount, currency)}
        </Text>
        {suffix && (
          <Text className="font-body-medium text-[11px] text-muted-foreground uppercase tracking-widest">
            {suffix}
          </Text>
        )}
      </View>
      {compareAt != null && Number(compareAt) > Number(amount) && (
        <Text className={`font-body-medium ${s.cmp} text-muted-foreground line-through`}>
          {format(compareAt, currency)}
        </Text>
      )}
    </View>
  );
}

export default PriceTag;
