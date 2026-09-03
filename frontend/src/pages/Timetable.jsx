import React from "react";
import { useTranslation } from "react-i18next";

export default function Timetable() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{t("timetablePage.title")}</h1>
      <p>{t("timetablePage.description")}</p>
    </div>
  );
}