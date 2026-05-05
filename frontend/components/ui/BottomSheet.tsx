import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  Dimensions,
  StyleSheet,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { shadows } from "@/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max sheet height as a fraction of the window. Defaults to 0.9. */
  maxHeightPct?: number;
};

const ENTER_MS = 320;
const EXIT_MS = 240;

/**
 * Reusable bottom sheet — backdrop fades, content slides up from the bottom.
 * Owns its own animation (Modal animation is set to "none") so the backdrop
 * and sheet move on independent timelines, and so it works on react-native-web
 * where Modal's built-in slide animation isn't fully supported.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  maxHeightPct = 0.9,
}: Props) {
  const screenH = Dimensions.get("window").height;
  // Internal mounted state — keep the Modal mounted through the exit animation.
  const [mounted, setMounted] = useState(visible);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(screenH);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.value = withTiming(1, {
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
      });
    } else if (mounted) {
      opacity.value = withTiming(0, {
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
      });
      translateY.value = withTiming(
        screenH,
        { duration: EXIT_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
    // screenH is stable for the session; we intentionally exclude it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.55,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#1A0F0F" }, backdropStyle]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            // Cap the backdrop opacity below 1 so the underlying screen still peeks through.
            android_disableSound
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: `${Math.round(maxHeightPct * 100)}%`,
            },
            sheetStyle,
            shadows.cardLift,
          ]}
        >
          <View
            className="bg-card overflow-hidden"
            style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
          >
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default BottomSheet;
