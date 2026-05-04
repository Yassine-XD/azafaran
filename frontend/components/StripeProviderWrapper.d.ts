// TypeScript declaration shim for the metro platform split. Metro picks
// `StripeProviderWrapper.native.tsx` on iOS/Android and
// `StripeProviderWrapper.web.tsx` on web at bundle time. TypeScript's
// resolver doesn't speak metro's platform suffixes, so without this
// declaration the unsuffixed `import StripeProviderWrapper from
// "@/components/StripeProviderWrapper"` does not type-check.
//
// This is a `.d.ts` (NOT a `.tsx`) so metro never tries to bundle it,
// which is important — a real .tsx shim would force one platform's
// implementation to be loaded on the other platform's bundle.
import type { ReactNode } from "react";
declare const StripeProviderWrapper: (props: { children: ReactNode }) => JSX.Element;
export default StripeProviderWrapper;
