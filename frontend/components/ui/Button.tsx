import { Pressable, ActivityIndicator, View, type PressableProps } from "react-native";
import * as Haptics from "expo-haptics";
import { Text } from "./Text";
import { cva, cn, type VariantPropsOf } from "@/lib/cva";

const button = cva(
  "flex-row items-center justify-center rounded-xl active:opacity-90",
  {
    variants: {
      variant: {
        primary: "bg-primary",
        secondary: "bg-muted",
        ghost: "bg-transparent",
        destructive: "bg-sale",
      },
      size: {
        sm: "px-3 h-9",
        md: "px-4 h-11",
        lg: "px-5 h-14",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

const label = cva("font-body-semibold", {
  variants: {
    variant: {
      primary: "text-primary-foreground",
      secondary: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-sale-foreground",
    },
    size: {
      sm: "text-small",
      md: "text-body",
      lg: "text-body",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

interface Props extends PressableProps {
  title?: string;
  variant?: VariantPropsOf<typeof button>["variant"];
  size?: VariantPropsOf<typeof button>["size"];
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading,
  leftIcon,
  rightIcon,
  haptic = true,
  className,
  children,
  onPress,
  disabled,
  ...rest
}: Props) {
  return (
    <Pressable
      className={cn(
        button({ variant, size }),
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50",
        className,
      )}
      disabled={disabled || loading}
      onPress={(e) => {
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress?.(e);
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" || variant === "destructive" ? "#fff" : "#0B0B0C"} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leftIcon}
          {title ? <Text className={label({ variant, size })}>{title}</Text> : null}
          {children}
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
