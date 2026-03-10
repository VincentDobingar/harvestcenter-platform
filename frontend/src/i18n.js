// 📁 src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const lang = localStorage.getItem("lang") || "fr";

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      translation: {
        welcome: "Bienvenue au Harvest Center",
        courses: "Nous proposons des formations en anglais, chinois, espagnol...",
      },
    },
    en: {
      translation: {
        welcome: "Welcome to Harvest Center",
        courses: "We offer training in English, Chinese, Spanish...",
      },
    },
  },
  lng: lang,
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
