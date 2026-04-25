import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { parseNotificationPayload } from "@/lib/notificationPayload";
import { pendingNotificationAction } from "@/lib/pendingNotificationAction";
import { routeFromPayload } from "@/lib/notificationRouter";
import { markNotificationOpened } from "@/lib/notifications";

// Listens for notification taps (warm + cold start) and routes the user.
// Mounted inside every provider so it has access to router / auth / cart.
export function NotificationsBridge() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { applyPromo } = useCart();
  const handledColdStart = useRef(false);

  // Cold-start tap: app was killed when the notification arrived.
  useEffect(() => {
    if (handledColdStart.current) return;
    handledColdStart.current = true;
    (async () => {
      try {
        const last = await Notifications.getLastNotificationResponseAsync();
        if (!last) return;
        handleResponse(last);
      } catch {}
    })();
    // We deliberately want to run once at mount regardless of auth state;
    // handleResponse handles re-stashing if auth isn't ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warm tap: app was already running (foreground or background).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      handleResponse,
    );
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  // Drain any pending action when auth becomes ready (covers cold-start
  // notifications that arrived before the user was authenticated).
  useEffect(() => {
    if (isLoading) return;
    const action = pendingNotificationAction.peek();
    if (!action) return;
    // Coupon actions are drained inside CartContext; skip here.
    if (action.type === "coupon") return;
    pendingNotificationAction.consume();
    routeFromPayload(action, {
      router,
      applyPromo,
      isAuthenticated,
    }).then((handled) => {
      if (!handled) pendingNotificationAction.set(action);
    });
    if (action.logId) markNotificationOpened(action.logId);
  }, [isLoading, isAuthenticated, router, applyPromo]);

  function handleResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as
      | Record<string, unknown>
      | undefined;
    const payload = parseNotificationPayload(data);
    if (!payload) return;
    if (payload.logId) markNotificationOpened(payload.logId);
    routeFromPayload(payload, {
      router,
      applyPromo,
      isAuthenticated,
    }).then((handled) => {
      if (!handled) pendingNotificationAction.set(payload);
    });
  }

  return null;
}
