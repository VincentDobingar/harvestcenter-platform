// 📁 src/components/LangSelector.jsx
import { useTranslation } from "react-i18next";

export default function LangSelector() {
  const { i18n } = useTranslation();
  const change = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <select
      onChange={change}
      value={i18n.language}
      className="border rounded px-2 py-1 text-sm text-[#1F75BB]"
      aria-label="Language selector"
    >
      <option value="fr">FR</option>
      <option value="en">EN</option>
    </select>
  );
}
