import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../app/locales/en/common.json";
import om from "../app/locales/oro/common.json";
import am from "../app/locales/am/common.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    om: {
      translation: om,
    },
    am: {
      translation: am,
    },
  },

  lng: "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;