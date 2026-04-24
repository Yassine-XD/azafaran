import type { RouteRecord } from "vite-react-ssg";
import type { ReactNode } from "react";
import { LangContext } from "./i18n";
import type { Lang } from "./seo/constants";
import LandingPage from "./pages/LandingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";

function withLang(lang: Lang, children: ReactNode) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const routes: RouteRecord[] = [
  { path: "/", element: withLang("es", <LandingPage />) },
  { path: "/privacy", element: withLang("es", <PrivacyPage />) },
  { path: "/terms", element: withLang("es", <TermsPage />) },

  { path: "/ca", element: withLang("ca", <LandingPage />) },
  { path: "/ca/privacy", element: withLang("ca", <PrivacyPage />) },
  { path: "/ca/terms", element: withLang("ca", <TermsPage />) },

  { path: "/en", element: withLang("en", <LandingPage />) },
  { path: "/en/privacy", element: withLang("en", <PrivacyPage />) },
  { path: "/en/terms", element: withLang("en", <TermsPage />) },

  { path: "*", element: <NotFoundPage /> },
];
