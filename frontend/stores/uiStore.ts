import { create } from "zustand";

/**
 * Ephemeral client-only UI state. Persists nothing — all of this resets
 * across cold launches. For state that survives, use AsyncStorage directly
 * (see CartContext for guest cart, NotificationContext for push token, etc).
 */

type Sort = "date" | "price" | "popularity" | "name";
type Order = "asc" | "desc";

type Filters = {
  category: string | null;
  search: string;
  inStockOnly: boolean;
  sort: Sort;
  order: Order;
};

interface UIState {
  // Filters used by category/search list screens.
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;

  // Sticky toast/snack — last action feedback. One at a time.
  toast: { message: string; tone: "info" | "success" | "error" } | null;
  showToast: (message: string, tone?: "info" | "success" | "error") => void;
  dismissToast: () => void;

  // Whether the onboarding intro has played in this session — guard against
  // double-renders racing the AsyncStorage flag.
  onboardingShownThisSession: boolean;
  markOnboardingShown: () => void;
}

const DEFAULT_FILTERS: Filters = {
  category: null,
  search: "",
  inStockOnly: false,
  sort: "date",
  order: "desc",
};

export const useUIStore = create<UIState>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  toast: null,
  showToast: (message, tone = "info") => set({ toast: { message, tone } }),
  dismissToast: () => set({ toast: null }),

  onboardingShownThisSession: false,
  markOnboardingShown: () => set({ onboardingShownThisSession: true }),
}));
