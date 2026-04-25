import { API_BASE_URL } from "./api";

let lastReportedAt = 0;
const MIN_INTERVAL_MS = 10_000; // Throttle: max 1 report per 10 seconds

export async function reportError(error: {
  message: string;
  stack?: string;
  url?: string;
  component?: string;
}): Promise<void> {
  const now = Date.now();
  if (now - lastReportedAt < MIN_INTERVAL_MS) return;
  lastReportedAt = now;

  try {
    await fetch(`${API_BASE_URL}/errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message.slice(0, 2000),
        stack: error.stack?.slice(0, 5000),
        url: error.url?.slice(0, 500),
        component: error.component?.slice(0, 5000),
      }),
    });
  } catch {
    // Silently fail — we don't want error reporting to cause more errors
  }
}
