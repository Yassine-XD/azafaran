import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/lib/cva";

type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodyMedium"
  | "small"
  | "caption"
  | "micro";

const VARIANT_CLASS: Record<Variant, string> = {
  display: "font-display text-display tracking-tight text-foreground",
  h1: "font-display text-h1 tracking-tight text-foreground",
  h2: "font-body-semibold text-h2 tracking-tight text-foreground",
  h3: "font-body-semibold text-h3 text-foreground",
  body: "font-body text-body text-foreground",
  bodyMedium: "font-body-medium text-body text-foreground",
  small: "font-body text-small text-muted-foreground",
  caption: "font-body-medium text-caption text-muted-foreground",
  micro: "font-body-medium text-micro uppercase tracking-wide text-muted-foreground",
};

interface Props extends TextProps {
  variant?: Variant;
  className?: string;
}

export function Text({ variant = "body", className, ...rest }: Props) {
  return <RNText className={cn(VARIANT_CLASS[variant], className)} {...rest} />;
}

export const Display = (p: Omit<Props, "variant">) => <Text variant="display" {...p} />;
export const Heading1 = (p: Omit<Props, "variant">) => <Text variant="h1" {...p} />;
export const Heading2 = (p: Omit<Props, "variant">) => <Text variant="h2" {...p} />;
export const Heading3 = (p: Omit<Props, "variant">) => <Text variant="h3" {...p} />;
export const Body = (p: Omit<Props, "variant">) => <Text variant="body" {...p} />;
export const Small = (p: Omit<Props, "variant">) => <Text variant="small" {...p} />;
export const Caption = (p: Omit<Props, "variant">) => <Text variant="caption" {...p} />;
export const Micro = (p: Omit<Props, "variant">) => <Text variant="micro" {...p} />;
