import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Plus, Star, Flame } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { shadows } from "@/theme";
import { PriceTag } from "./PriceTag";

type Props = {
  image?: string;
  name: string;
  category?: string;
  price: number | string;
  compareAt?: number | string;
  rating?: number | null;
  isPack?: boolean;
  isDeal?: boolean;
  onPress?: () => void;
  onAdd?: () => void;
  width?: number | "full";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Reused product card — home rows, category rows, grid.
 * Large square hero image (no white padding), serif price, floating gold
 * "+" in the bottom-right with a real shadow.
 */
export function ProductCard({
  image,
  name,
  category,
  price,
  compareAt,
  rating,
  isPack,
  isDeal,
  onPress,
  onAdd,
  width = 176,
}: Props) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: -lift.value }],
  }));

  const widthStyle = width === "full" ? undefined : { width };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 16, stiffness: 220 });
        lift.value = withSpring(2, { damping: 16, stiffness: 220 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 200 });
        lift.value = withSpring(0, { damping: 14, stiffness: 200 });
      }}
      style={[widthStyle, shadows.card, animatedStyle]}
      className="bg-card rounded-2xl overflow-hidden"
    >
      <View className="relative aspect-square bg-muted">
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
        ) : null}

        {/* Status pills */}
        <View className="absolute top-3 left-3 flex-row gap-1.5">
          {isDeal && (
            <View className="bg-wine px-2.5 py-1 rounded-full">
              <Text className="text-white text-[10px] font-body-bold tracking-wider">
                OFERTA
              </Text>
            </View>
          )}
          {isPack && (
            <View className="bg-gold px-2.5 py-1 rounded-full flex-row items-center gap-1">
              <Flame size={10} color="#1A0F0F" strokeWidth={2.5} />
              <Text className="text-coal text-[10px] font-body-bold tracking-wider">
                PACK
              </Text>
            </View>
          )}
        </View>

        {rating != null && rating > 0 && (
          <View className="absolute top-3 right-3 bg-coal/75 px-2 py-1 rounded-full flex-row items-center gap-1">
            <Star size={10} fill="#C9A961" color="#C9A961" />
            <Text className="text-white text-[11px] font-body-semibold">
              {Number(rating).toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <View className="p-3.5 pt-3">
        {category && (
          <Text
            className="text-[10px] text-muted-foreground font-body-semibold uppercase tracking-widest mb-1"
            numberOfLines={1}
          >
            {category}
          </Text>
        )}
        <Text
          className="font-display-semibold text-[15px] leading-5 text-foreground mb-2"
          numberOfLines={2}
        >
          {name}
        </Text>

        <View className="flex-row items-end justify-between">
          <PriceTag amount={price} compareAt={compareAt} size="md" />
          {onAdd && (
            <Pressable
              onPress={onAdd}
              className="w-10 h-10 rounded-full bg-primary items-center justify-center"
              style={shadows.goldGlow}
              hitSlop={8}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
            </Pressable>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default ProductCard;
