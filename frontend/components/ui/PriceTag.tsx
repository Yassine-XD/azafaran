import React from "react";
import { View, Text } from "react-native";

type Props = {
  amount: number | string;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "burgundy" | "light" | "dark";
  compareAt?: number | string;
  /** Suffix that follows the main price, e.g. "€/u." or "€/kg". */
  suffix?: string;
  /** Optional secondary per-kg price displayed in a muted column on the right. */
  pricePerKg?: number | null;
  /** Struck-through compare-at per-kg, only renders when greater than pricePerKg. */
  compareAtPerKg?: number | null;
  /** Subscript shown below the main row, e.g. "Peso aprox. 200 g". */
  weightLabel?: string;
  /** Per-kg short suffix, defaults to "€/kg". */
  perKgSuffix?: string;
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
 * Serif price tag. Defaults to a single per-unit price; pass `pricePerKg`
 * to enable the Ametller-style dual-tier layout (big "X,XX €/u." on the
 * left, muted "Y,YY €/kg" on the right).
 */
export function PriceTag({
  amount,
  currency = "€",
  size = "lg",
  tone = "burgundy",
  compareAt,
  suffix,
  pricePerKg,
  compareAtPerKg,
  weightLabel,
  perKgSuffix = "€/kg",
  align = "left",
}: Props) {
  const s = SIZES[size];
  const dual = pricePerKg != null && Number.isFinite(pricePerKg) && pricePerKg > 0;

  if (dual) {
    return (
      <View className="flex-row items-start justify-between w-full">
        <View className="flex-col items-start flex-1 min-w-0">
          <View className="flex-row items-baseline gap-1">
            <Text className={`font-display ${s.main} ${TONE[tone]}`}>
              {format(amount, currency)}
            </Text>
            {suffix && (
              <Text className="font-body-medium text-[11px] text-muted-foreground">
                {suffix}
              </Text>
            )}
          </View>
          {compareAt != null && Number(compareAt) > Number(amount) && (
            <Text
              className={`font-body-medium ${s.cmp} text-muted-foreground line-through`}
            >
              {format(compareAt, currency)}
            </Text>
          )}
          {weightLabel && (
            <Text className="font-body text-[11px] text-muted-foreground mt-0.5">
              {weightLabel}
            </Text>
          )}
        </View>
        <View className="items-end pl-2">
          <Text className="font-body-bold text-xs text-muted-foreground">
            {format(pricePerKg!, currency)}
          </Text>
          <Text className="font-body text-[10px] text-muted-foreground -mt-0.5">
            {perKgSuffix}
          </Text>
          {compareAtPerKg != null &&
            Number.isFinite(compareAtPerKg) &&
            compareAtPerKg > pricePerKg! && (
              <Text className="font-body text-[11px] text-muted-foreground line-through mt-0.5">
                {format(compareAtPerKg, currency)}
              </Text>
            )}
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-col ${ALIGN[align]}`}>
      <View className="flex-row items-baseline gap-1">
        <Text className={`font-display ${s.main} ${TONE[tone]}`}>
          {format(amount, currency)}
        </Text>
        {suffix && (
          <Text className="font-body-medium text-[11px] text-muted-foreground">
            {suffix}
          </Text>
        )}
      </View>
      {compareAt != null && Number(compareAt) > Number(amount) && (
        <Text
          className={`font-body-medium ${s.cmp} text-muted-foreground line-through`}
        >
          {format(compareAt, currency)}
        </Text>
      )}
      {weightLabel && (
        <Text className="font-body text-[11px] text-muted-foreground mt-0.5">
          {weightLabel}
        </Text>
      )}
    </View>
  );
}

export default PriceTag;
