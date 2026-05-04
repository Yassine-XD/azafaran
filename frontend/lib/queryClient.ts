import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton TanStack Query client. The defaults bias toward "fresh enough"
 * data without hammering the API on every screen mount.
 *
 * - 5 min staleTime: a screen revisit within 5 min uses the cache instantly.
 * - 10 min gcTime: cache survives a few back-and-forths between tabs.
 * - retry 1: one quiet retry on transient network blips, no aggressive loop.
 * - refetchOnWindowFocus only on web — RN's "AppState change" rule is
 *   different and we'd rather not refetch every time the user backgrounds.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
