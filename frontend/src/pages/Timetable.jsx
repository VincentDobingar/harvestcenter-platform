// src/pages/Timetable.jsx
// Pas encore branchée sur l'API des emplois du temps : état clair en attendant.
import React from "react";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, EmptyState } from "@/components/dash";

export default function Timetable() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("timetablePage.title", { defaultValue: "Emploi du temps" })} />
      <Panel>
        <EmptyState title={t("timetablePage.soonTitle", { defaultValue: "L’emploi du temps arrive bientôt ici" })}>
          {t("timetablePage.soon", {
            defaultValue: "Vos horaires de cours seront affichés sur cette page. En attendant, consultez le planning affiché au centre.",
          })}
        </EmptyState>
      </Panel>
    </div>
  );
}
