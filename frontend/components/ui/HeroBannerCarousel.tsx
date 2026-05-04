import React from "react";
import { View, Text, FlatList, Pressable, ImageBackground, Dimensions } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { Gradient } from "./Gradient";
import { shadows } from "@/theme";
import type { Banner } from "@/lib/types";

type Props = {
  banners: Banner[];
  onBannerPress?: (banner: Banner) => void;
};

const { width: screenW } = Dimensions.get("window");
// Card width = 88% of screen, capped at 380 so it stays "phone-frame" on tablets/web.
const CARD_W = Math.min(380, screenW * 0.88);
const CARD_H = Math.round((CARD_W / 16) * 10);

/**
 * Horizontally-scrolling banner carousel. Each banner becomes a full-bleed
 * photo card with a dark overlay, gold "Limited" pill, serif title, subtitle,
 * and a light CTA button. Mirrors the halal-harvest hero block.
 */
export function HeroBannerCarousel({ banners, onBannerPress }: Props) {
  if (!banners?.length) return null;

  return (
    <FlatList
      data={banners}
      keyExtractor={(b) => b.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onBannerPress?.(item)}
          style={[{ width: CARD_W, height: CARD_H }, shadows.cardLift]}
          className="rounded-3xl overflow-hidden"
        >
          <ImageBackground
            source={item.image_url ? { uri: item.image_url } : undefined}
            style={{ flex: 1, backgroundColor: "#1A0F0F" }}
            imageStyle={{ resizeMode: "cover" }}
          >
            <Gradient name="overlay" style={{ flex: 1 }}>
              <View className="flex-1 justify-end p-5">
                <View className="self-start bg-gold px-2.5 py-1 rounded-full mb-2">
                  <Text className="text-coal text-[10px] font-body-bold uppercase tracking-widest">
                    Limited
                  </Text>
                </View>
                <Text className="font-display text-white text-2xl leading-7" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text className="font-body text-white/85 text-sm mt-1 mb-3" numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                )}
                <View className="self-start flex-row items-center gap-2 bg-background px-4 py-2 rounded-full">
                  <Text className="font-body-bold text-foreground text-sm">Comprar</Text>
                  <ArrowRight size={14} color="#1A0F0F" />
                </View>
              </View>
            </Gradient>
          </ImageBackground>
        </Pressable>
      )}
    />
  );
}

export default HeroBannerCarousel;
