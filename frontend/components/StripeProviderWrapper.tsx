// TypeScript resolution shim for the metro platform split. Metro picks
// `StripeProviderWrapper.native.tsx` on iOS/Android and
// `StripeProviderWrapper.web.tsx` on web at bundle time. TypeScript's
// resolver doesn't speak metro's platform suffixes, so without this file
// the unsuffixed `import StripeProviderWrapper from "@/components/StripeProviderWrapper"`
// does not type-check.
//
// At runtime this file is never executed; metro always resolves to one of
// the platform-specific siblings before this falls through.
export { default } from "./StripeProviderWrapper.native";
