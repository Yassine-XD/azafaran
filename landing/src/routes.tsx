import type { RouteRecord } from "vite-react-ssg";
import type { ReactNode } from "react";
import { LangContext } from "./i18n";
import type { Lang } from "./seo/constants";
import LandingPage from "./pages/LandingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RouteError from "./pages/RouteError";

function withLang(lang: Lang, children: ReactNode) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

const errorElement = <RouteError />;

export const routes: RouteRecord[] = [
  { path: "/", element: withLang("es", <LandingPage />), errorElement },
  { path: "/privacy", element: withLang("es", <PrivacyPage />), errorElement },
  { path: "/terms", element: withLang("es", <TermsPage />), errorElement },

  { path: "/ca", element: withLang("ca", <LandingPage />), errorElement },
  { path: "/ca/privacy", element: withLang("ca", <PrivacyPage />), errorElement },
  { path: "/ca/terms", element: withLang("ca", <TermsPage />), errorElement },

  { path: "/en", element: withLang("en", <LandingPage />), errorElement },
  { path: "/en/privacy", element: withLang("en", <PrivacyPage />), errorElement },
  { path: "/en/terms", element: withLang("en", <TermsPage />), errorElement },

  { path: "*", element: <NotFoundPage />, errorElement },
];
