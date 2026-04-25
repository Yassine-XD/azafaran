// In-memory stash for a notification tap that arrived before the relevant
// React provider was ready (cold start, or before login). Each interested
// drainer calls `consume()`; if it returns a matching action, it handles it,
// otherwise it puts it back via `set()`.

import type { NotificationPayload } from "./notificationPayload";

let pending: NotificationPayload | null = null;

export const pendingNotificationAction = {
  set(action: NotificationPayload | null) {
    pending = action;
  },
  peek(): NotificationPayload | null {
    return pending;
  },
  consume(): NotificationPayload | null {
    const a = pending;
    pending = null;
    return a;
  },
};
