import { createContext, useContext } from "react";
import type { Lang } from "../seo/constants";
import type { Dict } from "./types";
import { es } from "./es";
import { ca } from "./ca";
import { en } from "./en";

export const dictionaries: Record<Lang, Dict> = { es, ca, en };

export const LangContext = createContext<Lang>("es");

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT(): Dict {
  return dictionaries[useLang()];
}
