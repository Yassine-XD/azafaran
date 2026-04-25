import React from "react";
import { View, Text, ImageBackground, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { shadows } from "@/theme";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  imageUrl?: string;
  height?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Full-bleed hero with dark gradient overlay, serif headline and strong CTA.
 * Dark image → gradient → serif headline → body → gold-accent CTA.
 */
export function HeroBanner({
  title,
  subtitle,
  eyebrow,
  ctaLabel,
  onCtaPress,
  imageUrl,
  height = 340,
}: Props) {
  const scale = useSharedValue(1);
  const animatedCta = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fallback =
    "https://images.unsplash.com/photo-1544025162-d76690b67f11?w=1200&auto=format&fit=crop&q=80";

  return (
    <View className="rounded-3xl overflow-hidden" style={shadows.cardLift}>
      <ImageBackground
        source={{ uri: imageUrl ?? fallback }}
        style={{ height }}
        imageStyle={{ backgroundColor: "#1A0F0F" }}
      >
        <LinearGradient
          colors={["rgba(26,15,15,0.20)", "rgba(26,15,15,0.55)", "rgba(26,15,15,0.92)"]}
          locations={[0, 0.55, 1]}
          style={{ flex: 1, justifyContent: "flex-end", padding: 24 }}
        >
          {eyebrow && (
            <Text className="font-body-semibold text-[11px] uppercase tracking-[3px] text-gold mb-2">
              {eyebrow}
            </Text>
          )}
          <Text
            className="font-display text-white text-[30px] leading-9 mb-2"
            numberOfLines={3}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="font-body text-white/80 text-sm mb-5" numberOfLines={2}>
              {subtitle}
            </Text>
          )}

          {ctaLabel && onCtaPress && (
            <AnimatedPressable
              onPress={onCtaPress}
              onPressIn={() => {
                scale.value = withSpring(0.97, { damping: 18, stiffness: 260 });
              }}
              onPressOut={() => {
                scale.value = withSpring(1, { damping: 14, stiffness: 220 });
              }}
              style={[{ alignSelf: "flex-start" }, shadows.goldGlow, animatedCta]}
              className="flex-row items-center gap-2 bg-gold h-12 px-5 rounded-full"
            >
              <Text className="font-body-bold text-coal text-sm">{ctaLabel}</Text>
              <ArrowRight size={16} color="#1A0F0F" />
            </AnimatedPressable>
          )}
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

export default HeroBanner;
