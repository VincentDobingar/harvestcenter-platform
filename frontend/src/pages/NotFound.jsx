// 📁 src/pages/NotFound.jsx
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex items-center justify-center text-2xl">
      {t("notFoundPage.message")}
    </div>
  );
}
