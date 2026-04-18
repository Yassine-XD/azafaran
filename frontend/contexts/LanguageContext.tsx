import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t as translateFn, isValidLang, type Lang } from "@/lib/i18n";
import { setApiLang } from "@/lib/api";

export const LANG_STORAGE_KEY = "preferred_lang";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((stored) => {
      if (isValidLang(stored)) {
        setLangState(stored);
        setApiLang(stored);
      }
    });
  }, []);

  const setLang = useCallback(async (newLang: Lang) => {
    setLangState(newLang);
    setApiLang(newLang);
    await AsyncStorage.setItem(LANG_STORAGE_KEY, newLang);
  }, []);

  const t = useCallback((key: string) => translateFn(key, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
