import React from "react";
import { View, Text } from "react-native";
import { Truck, Sparkles, Flame } from "lucide-react-native";
import { brand, shadows } from "@/theme";

/**
 * Three-up trust badges shown under the hero. Free delivery / Halal certified /
 * Same-day fresh — all three are static promises tied to brand identity.
 */
export function TrustStrip() {
  const items = [
    { icon: Truck, label: "Envío", sub: "Gratis +50€" },
    { icon: Sparkles, label: "Halal", sub: "Certificado" },
    { icon: Flame, label: "Mismo día", sub: "Corte fresco" },
  ];

  return (
    <View className="flex-row gap-2 px-5">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <View
            key={it.label}
            className="flex-1 bg-card rounded-2xl p-3 items-center border border-border"
            style={shadows.card}
          >
            <Icon size={16} color={brand.burgundy[600]} strokeWidth={2.2} />
            <Text className="font-body-bold text-[12px] text-foreground mt-1">
              {it.label}
            </Text>
            <Text className="font-body text-[10px] text-muted-foreground">{it.sub}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default TrustStrip;
