import React from "react";
import { View } from "react-native";
import Svg, { Path, Defs, Pattern, Rect, G } from "react-native-svg";

type Props = {
  color?: string;
  opacity?: number;
  size?: number;
};

/**
 * Repeating 8-point Moroccan star — the heritage accent used on the splash
 * background and as a subtle divider motif. Drawn once, tiled via <Pattern>
 * so it scales to any surface without blowing up the DOM.
 */
export function MoroccanPattern({
  color = "#C9A961",
  opacity = 0.08,
  size = 64,
}: Props) {
  const id = "zellige";
  const mid = size / 2;

  // 8-point star traced out of two overlaid squares.
  const star = (() => {
    const r = size * 0.34;
    const pts: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      pts.push([mid + Math.cos(a) * r, mid + Math.sin(a) * r]);
    }
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ") + " Z";
  })();

  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={id}
            x="0"
            y="0"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <G opacity={opacity}>
              <Path d={star} stroke={color} strokeWidth={1.2} fill="none" />
              {/* Inner diamond for density */}
              <Path
                d={`M${mid},${mid - size * 0.14} L${mid + size * 0.14},${mid} L${mid},${mid + size * 0.14} L${mid - size * 0.14},${mid} Z`}
                stroke={color}
                strokeWidth={1}
                fill="none"
              />
            </G>
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export default MoroccanPattern;
