// 6. ✅ src/pages/Trainings.jsx
import { useTranslation } from "react-i18next";

export default function Trainings() {
  const { t } = useTranslation();
  return <h2 className="text-2xl font-semibold">{t("trainings.title")}</h2>;
}