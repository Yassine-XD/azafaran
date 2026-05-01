// Pure routing logic for notification taps. Both the listener bridge (warm
// taps + cold-start replay) and the CartProvider drainer use this. Keeping it
// pure means the listener doesn't need React context.

import type { Router } from "expo-router";
import type { NotificationPayload } from "./notificationPayload";

type ApplyPromo = (code: string) => Promise<{ success: boolean }>;

export type RouteDeps = {
  router: Pick<Router, "push" | "replace">;
  applyPromo?: ApplyPromo;
  isAuthenticated?: boolean;
};

// Returns true when fully handled. `coupon` and `order` may return false when
// the user is not authenticated yet — in that case the caller should re-stash
// the action via pendingNotificationAction.set().
export async function routeFromPayload(
  payload: NotificationPayload,
  deps: RouteDeps,
): Promise<boolean> {
  const { router, applyPromo, isAuthenticated } = deps;
  switch (payload.type) {
    case "none":
      return true;
    case "screen": {
      // Tab screens live under /(tabs); top-level screens live at /<name>.
      const tabScreens = ["index", "categories", "deals", "orders", "profile"];
      if (tabScreens.includes(payload.screen)) {
        const path =
          payload.screen === "index" ? "/(tabs)" : `/(tabs)/${payload.screen}`;
        router.push(path as any);
      } else {
        router.push(`/${payload.screen}` as any);
      }
      return true;
    }
    case "product":
      router.push({
        pathname: "/product-detail",
        params: { id: payload.productId },
      });
      return true;
    case "order":
      if (!isAuthenticated) return false;
      router.push({
        pathname: "/order-details",
        params: { id: payload.orderId },
      });
      return true;
    case "coupon": {
      if (!isAuthenticated || !applyPromo) return false;
      router.push("/cart");
      // Fire-and-forget — auto-apply silently. Errors surface in cart UI.
      applyPromo(payload.promoCode).catch(() => {});
      return true;
    }
    case "campaign":
      // Generic campaign with no specific destination — open the deals tab.
      router.push("/(tabs)/deals" as any);
      return true;
    case "survey":
      // Survey screen requires auth to record the response.
      if (!isAuthenticated) return false;
      router.push({
        pathname: "/survey",
        params: { id: payload.surveyId },
      });
      return true;
    default:
      return true;
  }
}
