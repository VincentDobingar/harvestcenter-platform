// src/pages/Notes.jsx
// Pas encore branchée sur l'API des notes : on affiche un état clair plutôt
// qu'un texte de développement.
import React from "react";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, EmptyState } from "@/components/dash";

export default function Notes() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("notesPage.title", { defaultValue: "Notes" })} />
      <Panel>
        <EmptyState title={t("notesPage.soonTitle", { defaultValue: "Les notes arrivent bientôt ici" })}>
          {t("notesPage.soon", {
            defaultValue: "Vos notes par cours seront consultables sur cette page. En attendant, demandez-les à votre formateur.",
          })}
        </EmptyState>
      </Panel>
    </div>
  );
}
