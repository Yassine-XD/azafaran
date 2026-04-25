import React, { createContext, useContext, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAuth } from "./AuthContext";
import {
  getPushTokenAsync,
  registerWithBackend,
  requestPushPermission,
  setupAndroidChannel,
  unregisterWithBackend,
} from "@/lib/notifications";

type NotificationContextType = {
  pushToken: string | null;
};

const NotificationContext = createContext<NotificationContextType>({
  pushToken: null,
});

// Provider: on first auth, request permission, fetch the Expo token, and
// register it with the backend. On logout, deactivate it.
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const tokenRef = useRef<string | null>(null);
  const registeringRef = useRef(false);

  useEffect(() => {
    setupAndroidChannel().catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (tokenRef.current || registeringRef.current) return;
      registeringRef.current = true;

      (async () => {
        try {
          const granted = await requestPushPermission();
          if (!granted) return;
          const token = await getPushTokenAsync();
          if (!token) return;
          const platform: "ios" | "android" =
            Platform.OS === "ios" ? "ios" : "android";
          const ok = await registerWithBackend(token, platform);
          if (ok) tokenRef.current = token;
        } finally {
          registeringRef.current = false;
        }
      })();
    } else if (tokenRef.current) {
      const t = tokenRef.current;
      tokenRef.current = null;
      unregisterWithBackend(t).catch(() => {});
    }
  }, [isAuthenticated, isLoading]);

  return (
    <NotificationContext.Provider value={{ pushToken: tokenRef.current }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
