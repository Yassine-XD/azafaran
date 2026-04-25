import React, { useEffect } from "react";
import { View, Text, Pressable, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useLang } from "@/contexts/LanguageContext";
import { MoroccanPattern } from "@/components/ui";
import { brand, shadows } from "@/theme";

const AnimatedView = Animated.View;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Brand splash. Light parchment background, brand wordmark from
 * assets/images/icon.png as the focal point, italic burgundy tagline
 * underneath, and a gold CTA pair. Drives NavigationGuard's "onboarding"
 * slot — users land here after language-select and exit via CTA into
 * register/login.
 */
export default function SplashOnboarding() {
  const router = useRouter();
  const { t } = useLang();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.92);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(8);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(12);
  const ctaScale = useSharedValue(1);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    logoOpacity.value = withTiming(1, { duration: 700, easing: ease });
    logoScale.value = withTiming(1, { duration: 800, easing: ease });
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 600, easing: ease }));
    taglineY.value = withDelay(500, withTiming(0, { duration: 600, easing: ease }));
    ctaOpacity.value = withDelay(900, withTiming(1, { duration: 500, easing: ease }));
    ctaY.value = withDelay(900, withTiming(0, { duration: 500, easing: ease }));
    // Reanimated shared values are stable refs — safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }, { scale: ctaScale.value }],
  }));

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor={brand.parchment} />

      {/* Subtle gold zellige overlay — heritage cue without going dark */}
      <MoroccanPattern color={brand.gold[500]} opacity={0.07} size={84} />

      <SafeAreaView className="flex-1 px-8 justify-between py-12">
        <View />

        {/* Brand block — icon already contains the wordmark */}
        <View className="items-center">
          <AnimatedView style={logoStyle} className="items-center">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 240, height: 240 }}
              resizeMode="contain"
            />
          </AnimatedView>

          <AnimatedView style={taglineStyle} className="items-center mt-2 max-w-[300px]">
            <View className="h-[1px] w-12 bg-gold mb-5" />
            <Text className="font-display text-primary text-[19px] leading-7 text-center italic">
              “{t("splash.tagline")}”
            </Text>
          </AnimatedView>
        </View>

        {/* CTAs */}
        <AnimatedView style={ctaStyle} className="gap-3">
          <AnimatedPressable
            onPress={() => router.replace("/register")}
            onPressIn={() => (ctaScale.value = withSpring(0.97, { damping: 18, stiffness: 260 }))}
            onPressOut={() => (ctaScale.value = withSpring(1, { damping: 14, stiffness: 220 }))}
            style={shadows.button}
            className="bg-primary h-14 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <Text className="font-body-bold text-primary-foreground text-base tracking-tight">
              {t("splash.cta")}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
          </AnimatedPressable>

          <Pressable
            onPress={() => router.replace("/login")}
            className="h-12 items-center justify-center"
          >
            <Text className="font-body-medium text-foreground/70 text-sm">
              {t("splash.secondary")}
            </Text>
          </Pressable>
        </AnimatedView>
      </SafeAreaView>
    </View>
  );
}
