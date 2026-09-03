import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLang = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-300 p-1">
      <button
        type="button"
        onClick={() => changeLanguage("fr")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          currentLang === "fr"
            ? "bg-green-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        FR
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          currentLang === "en"
            ? "bg-green-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        EN
      </button>
    </div>
  );
}