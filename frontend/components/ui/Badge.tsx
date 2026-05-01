import { View } from "react-native";
import { Text } from "./Text";
import { cva, cn, type VariantPropsOf } from "@/lib/cva";

const badge = cva(
  "self-start flex-row items-center px-2 py-0.5 rounded-full",
  {
    variants: {
      variant: {
        promo: "bg-sale",
        halal: "bg-halal",
        scarcity: "bg-foreground",
        new: "bg-muted",
        neutral: "bg-muted",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

const text = cva("font-body-semibold text-2xs uppercase tracking-wide", {
  variants: {
    variant: {
      promo: "text-sale-foreground",
      halal: "text-halal-foreground",
      scarcity: "text-background",
      new: "text-foreground",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: { variant: "neutral" },
});

interface Props {
  variant?: VariantPropsOf<typeof badge>["variant"];
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", label, icon, className }: Props) {
  return (
    <View className={cn(badge({ variant }), className)}>
      {icon ? <View className="mr-1">{icon}</View> : null}
      <Text className={text({ variant })}>{label}</Text>
    </View>
  );
}
