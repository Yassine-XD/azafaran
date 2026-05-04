import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/cva";

interface Props extends ViewProps {
  variant?: "flat" | "elevated";
  className?: string;
}

export function Card({ variant = "flat", className, ...rest }: Props) {
  return (
    <View
      className={cn(
        "rounded-2xl bg-card",
        variant === "flat" && "border border-border",
        variant === "elevated" && "shadow-card",
        className,
      )}
      {...rest}
    />
  );
}
