import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { useLang } from "@/contexts/LanguageContext";

const ONBOARDING_KEY = "onboarding_done";

/**
 * Browse-first navigation guard.
 *
 * The new UX explicitly does NOT force unauthenticated users to log in
 * before they can shop. The only navigation rule the guard enforces is:
 *
 * - On the very first launch (no preferred_lang AND no onboarding_done
 *   flag in AsyncStorage), redirect to /onboarding so the user picks a
 *   language and sees the 3-card intro. After that, they can land
 *   wherever they want.
 *
 * Auth-required screens enforce auth themselves at point of use
 * (e.g. /checkout redirects to /login when not authenticated). The
 * guard intentionally does not push anyone to /login.
 */
export function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { lang } = useLang();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    (async () => {
      const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (onboardingDone) return;

      // If the language was set previously (e.g. legacy install) but no
      // onboarding flag, mark onboarding as done silently rather than
      // re-introducing it.
      const preferredLang = await AsyncStorage.getItem("preferred_lang");
      if (preferredLang && lang) {
        await AsyncStorage.setItem(ONBOARDING_KEY, "1");
        return;
      }

      // Don't redirect if already on the onboarding flow.
      const top = segments[0];
      if (top === "onboarding" || top === "language-select") return;

      router.replace("/onboarding");
    })();
  }, [router, segments, lang]);

  return <>{children}</>;
}
