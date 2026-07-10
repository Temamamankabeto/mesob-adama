"use client";

import { useTranslation } from "react-i18next";

export function useLanguage() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);

    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  return {
    t,
    language: i18n.language,
    changeLanguage,
  };
}