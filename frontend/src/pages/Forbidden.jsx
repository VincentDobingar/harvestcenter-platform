import { useTranslation } from "react-i18next";

export default function Forbidden() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">403</h1>
        <p className="mt-2 text-gray-600">{t("forbiddenPage.message")}</p>
      </div>
    </div>
  );
}