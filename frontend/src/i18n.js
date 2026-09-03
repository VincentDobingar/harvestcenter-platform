import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import frCommon from "./locales/fr/common.json";
import enCommon from "./locales/en/common.json";

const savedLanguage = localStorage.getItem("lang") || "fr";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: frCommon,
      },
      en: {
        common: enCommon,
      },
    },
    lng: savedLanguage,
    fallbackLng: "fr",

    ns: ["common"],
    defaultNS: "common",

    interpolation: {
      escapeValue: false,
    },

    debug: false,
  });

export default i18n;