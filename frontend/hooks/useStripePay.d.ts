// TypeScript declaration shim. Metro picks `useStripePay.native.ts` on
// iOS/Android and `useStripePay.web.tsx` on web. This `.d.ts` describes
// the shared shape so the unsuffixed import type-checks without ever
// being bundled.
type User = { first_name: string; last_name: string; email: string } | null;
type PayResult = { success: boolean; error?: string; cancelled?: boolean };

export declare function useStripePay(): {
  payWithCard: (clientSecret: string, user: User) => Promise<PayResult>;
  CardField: (() => JSX.Element) | null;
  isReady?: boolean;
};
