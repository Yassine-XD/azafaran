import React, { useEffect } from "react";
import { View, Text, Pressable, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { useLang } from "@/contexts/LanguageContext";
import { MoroccanPattern } from "@/components/ui";
import { shadows } from "@/theme";

const AnimatedView = Animated.View;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Azafarán brand splash.
 * - Dark coal background + subtle Moroccan geometric pattern.
 * - Animated logo mark (saffron thread → circle) fades + scales.
 * - Wordmark in Fraunces, then tagline, then CTA pair.
 * Drives NavigationGuard's "onboarding" slot — users land here after
 * language-select, leave via CTA into register/login.
 */
export default function SplashOnboarding() {
  const router = useRouter();
  const { t } = useLang();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const brandOpacity = useSharedValue(0);
  const brandY = useSharedValue(16);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(10);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(20);
  const ctaScale = useSharedValue(1);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    logoOpacity.value = withTiming(1, { duration: 600, easing: ease });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 700, easing: ease }),
      withSpring(1, { damping: 12, stiffness: 140 }),
    );

    brandOpacity.value = withDelay(500, withTiming(1, { duration: 600, easing: ease }));
    brandY.value = withDelay(500, withTiming(0, { duration: 600, easing: ease }));

    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 550, easing: ease }));
    taglineY.value = withDelay(900, withTiming(0, { duration: 550, easing: ease }));

    ctaOpacity.value = withDelay(1300, withTiming(1, { duration: 500, easing: ease }));
    ctaY.value = withDelay(1300, withTiming(0, { duration: 500, easing: ease }));
    // Reanimated shared values are stable refs — safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }, { scale: ctaScale.value }],
  }));

  const goRegister = () => router.replace("/register");
  const goLogin = () => router.replace("/login");

  return (
    <View className="flex-1 bg-coal">
      <StatusBar barStyle="light-content" backgroundColor="#1A0F0F" />

      {/* Moroccan star tile overlay */}
      <MoroccanPattern color="#C9A961" opacity={0.09} size={72} />

      {/* Gold glow behind logo */}
      <LinearGradient
        colors={["rgba(201,169,97,0.18)", "rgba(26,15,15,0)"]}
        style={{
          position: "absolute",
          top: "18%",
          alignSelf: "center",
          width: 360,
          height: 360,
          borderRadius: 180,
        }}
      />

      <SafeAreaView className="flex-1 px-8 justify-between py-10">
        {/* Eyebrow */}
        <AnimatedView style={brandStyle} className="items-center pt-4">
          <Text className="font-body-semibold text-[11px] uppercase tracking-[4px] text-gold">
            {t("splash.eyebrow")}
          </Text>
        </AnimatedView>

        {/* Brand block */}
        <View className="items-center">
          <AnimatedView style={logoStyle} className="mb-8">
            <LogoMark />
          </AnimatedView>

          <AnimatedView style={brandStyle} className="items-center">
            <Text className="font-display-black text-white text-[54px] leading-[58px] tracking-tight">
              {t("splash.brand")}
            </Text>
            <View className="h-[1px] w-16 bg-gold my-4" />
          </AnimatedView>

          <AnimatedView style={taglineStyle} className="items-center max-w-[320px]">
            <Text className="font-display text-gold text-[20px] leading-7 text-center italic">
              “{t("splash.tagline")}”
            </Text>
            <Text className="font-body text-white/65 text-sm leading-6 text-center mt-6">
              {t("splash.subtitle")}
            </Text>
          </AnimatedView>
        </View>

        {/* CTAs */}
        <AnimatedView style={ctaStyle} className="gap-3">
          <AnimatedPressable
            onPress={goRegister}
            onPressIn={() => (ctaScale.value = withSpring(0.97, { damping: 18, stiffness: 260 }))}
            onPressOut={() => (ctaScale.value = withSpring(1, { damping: 14, stiffness: 220 }))}
            style={shadows.goldGlow}
            className="bg-gold h-14 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <Text className="font-body-bold text-coal text-base tracking-tight">
              {t("splash.cta")}
            </Text>
            <ArrowRight size={18} color="#1A0F0F" strokeWidth={2.4} />
          </AnimatedPressable>

          <Pressable onPress={goLogin} className="h-12 items-center justify-center">
            <Text className="font-body-medium text-white/75 text-sm">
              {t("splash.secondary")}
            </Text>
          </Pressable>
        </AnimatedView>
      </SafeAreaView>
    </View>
  );
}

/**
 * Custom brand mark: concentric saffron threads inside a gold ring.
 * Pure SVG so it scales crisply and avoids a PNG asset round-trip.
 */
function LogoMark() {
  return (
    <View
      className="w-[120px] h-[120px] rounded-full items-center justify-center bg-coal-800 border border-gold/40"
      style={shadows.goldGlow}
    >
      <Svg width={68} height={68} viewBox="0 0 68 68">
        {/* Outer ring */}
        <Circle cx={34} cy={34} r={30} stroke="#C9A961" strokeWidth={1.5} fill="none" />
        {/* Inner 4-point saffron */}
        <Path
          d="M34 8 L40 28 L60 34 L40 40 L34 60 L28 40 L8 34 L28 28 Z"
          fill="#C9A961"
          opacity={0.95}
        />
        {/* Center bead */}
        <Circle cx={34} cy={34} r={3.5} fill="#7A0E1F" />
      </Svg>
    </View>
  );
}
