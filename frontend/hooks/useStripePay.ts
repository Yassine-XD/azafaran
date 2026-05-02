// TypeScript resolution shim. Metro picks `useStripePay.native.ts` on
// iOS/Android and `useStripePay.web.tsx` on web; this file is the
// no-suffix fallback so `import { useStripePay } from "@/hooks/useStripePay"`
// type-checks. At runtime metro never falls through to this file.
export { useStripePay } from "./useStripePay.native";
