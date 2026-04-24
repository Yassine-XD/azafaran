import React from "react";
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { shadows } from "@/theme";

export type ButtonVariant = "primary" | "dark" | "gold" | "outline" | "ghost";
export type ButtonSize = "md" | "lg";

type Props = Omit<PressableProps, "style" | "children"> & {
  label: string;
  onPress?: PressableProps["onPress"];
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "h-12 px-5",
  lg: "h-14 px-6",
};

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  dark: "bg-coal",
  gold: "bg-gold",
  outline: "bg-transparent border-2 border-primary",
  ghost: "bg-transparent",
};

const VARIANT_LABEL: Record<ButtonVariant, string> = {
  primary: "text-primary-foreground",
  dark: "text-coal-foreground",
  gold: "text-coal",
  outline: "text-primary",
  ghost: "text-primary",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Primary brand button.
 * - 56px tap target at `size="lg"` (spec default for sticky CTAs).
 * - Burgundy base with gold-tinted shadow on press-in.
 * - Spring-animated press state via reanimated.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const elevate = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: elevate.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 260 });
    elevate.value = withTiming(0.92, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
    elevate.value = withTiming(1, { duration: 160 });
  };

  const containerClass = [
    "flex-row items-center justify-center rounded-2xl",
    SIZE_CLASSES[size],
    VARIANT_CONTAINER[variant],
    fullWidth ? "w-full" : "self-start",
    disabled || loading ? "opacity-60" : "",
  ].join(" ");

  const shadow =
    variant === "primary" || variant === "dark"
      ? shadows.button
      : variant === "gold"
      ? shadows.goldGlow
      : undefined;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={containerClass}
      style={[shadow, animatedStyle, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? undefined : "#fff"}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text
            className={`font-body-semibold text-base tracking-tight ${VARIANT_LABEL[variant]}`}
          >
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </AnimatedPressable>
  );
}

export default Button;
