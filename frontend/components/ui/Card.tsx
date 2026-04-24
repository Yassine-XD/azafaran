import React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { shadows } from "@/theme";

type CardBaseProps = {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
};

type PressableCardProps = CardBaseProps & {
  onPress: PressableProps["onPress"];
  onLongPress?: PressableProps["onLongPress"];
  disabled?: boolean;
};

type StaticCardProps = CardBaseProps & ViewProps;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Surface card with burgundy-tinted shadow.
 * Lift-on-press is enabled when `onPress` is provided.
 */
export function Card(props: PressableCardProps | StaticCardProps) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: -lift.value }],
  }));

  const baseClass = "bg-card rounded-2xl overflow-hidden";
  const shadow = props.elevated === false ? undefined : shadows.card;

  if ("onPress" in props && props.onPress) {
    const { onPress, onLongPress, disabled, children, className, style } = props;

    return (
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 16, stiffness: 220 });
          lift.value = withSpring(2, { damping: 16, stiffness: 220 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 200 });
          lift.value = withSpring(0, { damping: 14, stiffness: 200 });
        }}
        className={`${baseClass} ${className ?? ""}`}
        style={[shadow, animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  const { children, className, style, ...rest } = props as StaticCardProps;
  return (
    <View className={`${baseClass} ${className ?? ""}`} style={[shadow, style]} {...rest}>
      {children}
    </View>
  );
}

export default Card;
