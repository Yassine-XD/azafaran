// Push-notification client glue: permission, Expo token, Android channel,
// register/unregister with backend.
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { api } from "./api";

// Foreground display rules: show banner + play sound + update badge.
// Set once at module load so it's wired before the first notification arrives.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Azafaran",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#fffbf7",
  });
}

export async function requestPushPermission(): Promise<boolean> {
  // Push only works on physical devices and breaks in Expo Go on SDK 53+.
  if (!Device.isDevice) return false;
  if ((Constants as any).appOwnership === "expo") {
    if (__DEV__) {
      console.warn(
        "[notifications] Push notifications are not supported in Expo Go. Build a dev client with EAS.",
      );
    }
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getPushTokenAsync(): Promise<string | null> {
  const projectId =
    (Constants?.expoConfig?.extra as any)?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId;
  if (!projectId) {
    console.warn("[notifications] No EAS projectId — cannot get push token.");
    return null;
  }
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (err) {
    console.warn("[notifications] getExpoPushTokenAsync failed:", err);
    return null;
  }
}

export async function registerWithBackend(
  token: string,
  platform: "ios" | "android",
): Promise<boolean> {
  const res = await api.post("/notifications/token", { token, platform });
  return Boolean(res.success);
}

export async function unregisterWithBackend(token: string): Promise<boolean> {
  const res = await api(`/notifications/token`, {
    method: "DELETE",
    body: { token },
  });
  return Boolean(res.success);
}

export async function markNotificationOpened(logId: string): Promise<void> {
  if (!logId) return;
  await api.post(`/notifications/opened/${logId}`).catch(() => {});
}

export const NotificationsAPI = Notifications;
