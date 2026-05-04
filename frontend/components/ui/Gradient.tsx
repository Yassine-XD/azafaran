import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import type { ViewStyle, StyleProp } from "react-native";

// Brand gradient presets. Use these instead of CSS `gradient-primary` /
// `gradient-meat` / `gradient-gold` / `gradient-overlay` classes from the
// halal-harvest design — those are web-only.
type GradientName = "primary" | "meat" | "gold" | "overlay";

const stops: Record<GradientName, { colors: [string, string, ...string[]]; locations?: number[]; start?: { x: number; y: number }; end?: { x: number; y: number } }> = {
  // Burgundy 600 → 500 (warm wine glow on CTAs)
  primary: {
    colors: ["#7A0E1F", "#A12234"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Deep meat — burgundy 700 → coal 900 (hero overlays, profile card)
  meat: {
    colors: ["#5E0A17", "#1A0F0F"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Premium gold (gold packs, halal pill backgrounds)
  gold: {
    colors: ["#C9A961", "#D9BE74"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Bottom-up dark fade for image overlays
  overlay: {
    colors: ["rgba(26,15,15,0)", "rgba(26,15,15,0.85)"],
    locations: [0.3, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

export function Gradient({
  name,
  style,
  children,
  className,
}: {
  name: GradientName;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  className?: string;
}) {
  const cfg = stops[name];
  return (
    <LinearGradient
      colors={cfg.colors}
      locations={cfg.locations}
      start={cfg.start}
      end={cfg.end}
      style={style}
      // @ts-ignore — nativewind/css-interop forwards className to style
      className={className}
    >
      {children}
    </LinearGradient>
  );
}

export default Gradient;
