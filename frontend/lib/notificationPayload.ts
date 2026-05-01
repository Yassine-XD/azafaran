// Mirror of the backend NotificationPayload contract.
// Sent in Expo `data` and persisted in notification_log.data.
export type NotificationPayload =
  | { v: 1; type: "none"; logId?: string; campaignId?: string }
  | {
      v: 1;
      type: "screen";
      screen: "index" | "categories" | "deals" | "orders" | "profile";
      logId?: string;
      campaignId?: string;
    }
  | {
      v: 1;
      type: "product";
      productId: string;
      logId?: string;
      campaignId?: string;
    }
  | {
      v: 1;
      type: "coupon";
      promoCode: string;
      logId?: string;
      campaignId?: string;
    }
  | {
      v: 1;
      type: "order";
      orderId: string;
      logId?: string;
      campaignId?: string;
    }
  | {
      v: 1;
      type: "campaign";
      logId?: string;
      campaignId?: string;
      screen?: string;
    }
  | {
      v: 1;
      type: "survey";
      surveyId: string;
      logId?: string;
      campaignId?: string;
    };

// Best-effort runtime parser — Expo `data` is an arbitrary record.
export function parseNotificationPayload(
  data: Record<string, unknown> | undefined | null,
): NotificationPayload | null {
  if (!data || typeof data !== "object") return null;
  const type = (data as any).type;
  if (typeof type !== "string") return null;
  const base = { v: 1 as const, logId: (data as any).logId, campaignId: (data as any).campaignId };
  switch (type) {
    case "none":
      return { ...base, type: "none" };
    case "screen": {
      const screen = (data as any).screen;
      if (typeof screen !== "string") return null;
      return { ...base, type: "screen", screen } as NotificationPayload;
    }
    case "product": {
      const productId = (data as any).productId;
      if (typeof productId !== "string") return null;
      return { ...base, type: "product", productId };
    }
    case "coupon": {
      const promoCode = (data as any).promoCode;
      if (typeof promoCode !== "string") return null;
      return { ...base, type: "coupon", promoCode };
    }
    case "order": {
      const orderId = (data as any).orderId;
      if (typeof orderId !== "string") return null;
      return { ...base, type: "order", orderId };
    }
    case "campaign":
      return { ...base, type: "campaign", screen: (data as any).screen };
    case "survey": {
      const surveyId = (data as any).surveyId;
      if (typeof surveyId !== "string") return null;
      return { ...base, type: "survey", surveyId };
    }
    default:
      return null;
  }
}
