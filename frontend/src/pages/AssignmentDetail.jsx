// src/pages/AssignmentDetail.jsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import api from "@/utils/api";

export default function AssignmentDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-GB" : "fr-FR";

  const [assignment, setAssignment] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get(`/assignments/${id}`);
        if (!mounted) return;
        setAssignment(data?.data || data || null);
      } catch (e) {
        if (!mounted) return;
        setErr(
          e?.response?.data?.error ||
            t("assignmentDetailPage.errors.load", {
              defaultValue: "Impossible de charger le devoir.",
            })
        );
        setAssignment(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, t]);

  if (!assignment && !err) {
    return (
      <div className="p-4">
        {t("common.loading", { defaultValue: "Chargement..." })}
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="text-red-600 text-sm">{err}</div>
        <Link to="/dashboard/assignments" className="text-blue-600 underline">
          {t("assignmentDetailPage.back", { defaultValue: "Retour aux devoirs" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Link to="/dashboard/assignments" className="text-blue-600 underline">
        {t("assignmentDetailPage.back", { defaultValue: "Retour aux devoirs" })}
      </Link>

      <h1 className="text-2xl font-bold">
        {assignment?.title || t("assignmentDetailPage.title", { defaultValue: "Détail du devoir" })}
      </h1>

      <div className="rounded-2xl bg-white shadow p-4 space-y-3">
        <div>
          <span className="font-medium">
            {t("assignmentDetailPage.deadline", { defaultValue: "Date limite" })}:
          </span>{" "}
          {assignment?.due_at
            ? new Date(assignment.due_at).toLocaleString(locale)
            : "—"}
        </div>

        <div>
          <span className="font-medium">
            {t("assignmentDetailPage.maxScore", { defaultValue: "Note maximale" })}:
          </span>{" "}
          {assignment?.max_score ?? 20}
        </div>

        <div>
          <span className="font-medium">
            {t("assignmentDetailPage.instructions", { defaultValue: "Consignes" })}:
          </span>
          <p className="mt-2 text-gray-700 whitespace-pre-line">
            {assignment?.instructions || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}