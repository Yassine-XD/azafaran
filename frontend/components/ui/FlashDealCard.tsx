import React from "react";
import { View, Text, Pressable } from "react-native";
import { Flame, ArrowRight } from "lucide-react-native";
import { Gradient } from "./Gradient";
import { shadows } from "@/theme";

type Props = {
  eyebrow?: string;
  title: string;
  onPress?: () => void;
};

/**
 * Wide CTA tile that links to /deals. Dark "meat" gradient background, gold
 * pulsing flame icon, eyebrow + title, arrow on the right.
 */
export function FlashDealCard({ eyebrow = "Oferta flash", title, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="rounded-3xl overflow-hidden" style={shadows.cardLift}>
      <Gradient name="meat" style={{ padding: 20 }}>
        <View className="flex-row items-center gap-4">
          <View className="w-14 h-14 rounded-2xl bg-gold items-center justify-center">
            <Flame size={26} color="#1A0F0F" strokeWidth={2.2} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="font-body-bold text-[10px] uppercase tracking-widest text-white/80">
              {eyebrow}
            </Text>
            <Text className="font-display text-white text-lg leading-6" numberOfLines={2}>
              {title}
            </Text>
          </View>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </Gradient>
    </Pressable>
  );
}

export default FlashDealCard;
