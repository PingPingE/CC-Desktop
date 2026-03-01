import { createContext, useContext, useState, useCallback, createElement, type ReactNode } from "react";
import { ko, type TranslationKey } from "./ko";
import { en } from "./en";

export type Locale = "ko" | "en";

const LOCALE_KEY = "cc-desktop-locale";

const translations: Record<Locale, Record<TranslationKey, string>> = { ko, en };

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "ko" || stored === "en") return stored;
  } catch { /* ignore */ }
  return "ko";
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_KEY, newLocale);
    } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text = translations[locale][key] || translations["ko"][key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [locale]
  );

  return createElement(
    LocaleContext.Provider,
    { value: { locale, setLocale, t } },
    children
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export type { TranslationKey };
