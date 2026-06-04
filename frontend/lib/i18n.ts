"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import om from "@/locales/om.json";
import am from "@/locales/am.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "om", label: "Afaan Oromoo" },
  { code: "am", label: "አማርኛ" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";

  const saved = localStorage.getItem("mesob_language") as SupportedLanguage | null;

  if (saved && SUPPORTED_LANGUAGES.some((item) => item.code === saved)) {
    return saved;
  }

  return "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      om: { translation: om },
      am: { translation: am },
    },
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export function changeLanguage(language: SupportedLanguage) {
  localStorage.setItem("mesob_language", language);
  document.documentElement.lang = language;
  return i18n.changeLanguage(language);
}

export default i18n;
