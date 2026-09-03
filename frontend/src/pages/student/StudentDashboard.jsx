// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import api from "@/utils/api";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function StudentDashboard() {
  const { t } = useTranslation();

  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setErr("");

        const [dashboardRes, assignmentsRes] = await Promise.allSettled([
          api.get("/student/dashboard"),
          api.get("/assignments"),
        ]);

        if (!mounted) return;

        const dashboardData =
          dashboardRes.status === "fulfilled"
            ? dashboardRes.value?.data ?? {}
            : {};

        const assignmentsData =
          assignmentsRes.status === "fulfilled"
            ? assignmentsRes.value?.data ?? []
            : [];

        setDashboard(dashboardData);
        setAssignments(safeArray(assignmentsData));

        if (
          dashboardRes.status === "rejected" &&
          assignmentsRes.status === "rejected"
        ) {
          setErr(
            t("dashboardStudent.loadError", {
              defaultValue: "Impossible de charger le tableau de bord étudiant.",
            })
          );
        }
      } catch (e) {
        console.error("StudentDashboard load error:", e);
        if (!mounted) return;

        setDashboard({});
        setAssignments([]);
        setErr(
          t("dashboardStudent.loadError", {
            defaultValue: "Impossible de charger le tableau de bord étudiant.",
          })
        );
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [t]);

  const assignmentStats = useMemo(() => {
    const total =
      safeNumber(dashboard?.assignments?.total, assignments.length) ||
      assignments.length;

    const submitted =
      safeNumber(dashboard?.assignments?.submitted) ||
      safeArray(assignments).filter((a) =>
        ["submitted", "done", "completed"].includes(
          String(a.status || "").toLowerCase()
        )
      ).length;

    const late =
      safeNumber(dashboard?.assignments?.late) ||
      safeArray(assignments).filter((a) =>
        ["late", "overdue"].includes(String(a.status || "").toLowerCase())
      ).length;

    const pending =
      safeNumber(dashboard?.assignments?.pending) ||
      Math.max(total - submitted - late, 0);

    const completionRate =
      safeNumber(dashboard?.assignments?.completionRate) ||
      (total > 0 ? Math.round((submitted / total) * 100) : 0);

    return {
      total,
      submitted,
      pending,
      late,
      completionRate,
    };
  }, [dashboard, assignments]);

  const averageScore = useMemo(() => {
    const score =
      dashboard?.grades?.score ??
      dashboard?.grades?.average ??
      dashboard?.average_score;

    if (score !== undefined && score !== null && score !== "") {
      return safeNumber(score);
    }

    return null;
  }, [dashboard]);

  const ranking = dashboard?.ranking ?? dashboard?.classRanking ?? null;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t("dashboardStudent.title", { defaultValue: "Espace étudiant" })}
        </h1>
        <p className="text-gray-500">
          {t("dashboardStudent.subtitle", {
            defaultValue: "Tableau de bord académique",
          })}
        </p>
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/student/assignments"
          className="rounded-2xl bg-white shadow p-5 border hover:shadow-md transition"
        >
          <div className="text-sm text-gray-500">
            {t("dashboardStudent.myAssignments", {
              defaultValue: "📝 Mes devoirs",
            })}
          </div>
          <div className="mt-2 text-3xl font-bold">{assignmentStats.total}</div>
        </Link>

        <Link
          to="/dashboard/my-courses"
          className="rounded-2xl bg-white shadow p-5 border hover:shadow-md transition"
        >
          <div className="text-sm text-gray-500">
            {t("dashboardStudent.myCourses", {
              defaultValue: "📚 Mes cours",
            })}
          </div>
          <div className="mt-2 text-3xl font-bold">
            {safeNumber(dashboard?.courses_count ?? dashboard?.courses?.length ?? 0)}
          </div>
        </Link>

        <div className="rounded-2xl bg-white shadow p-5 border">
          <div className="text-sm text-gray-500">
            {t("dashboardStudent.classRanking", {
              defaultValue: "🏆 Classement de la classe",
            })}
          </div>
          <div className="mt-2 text-3xl font-bold">
            {ranking?.position ?? "—"}
          </div>
          {!ranking?.position && (
            <div className="mt-1 text-sm text-gray-500">
              {t("dashboardStudent.noRanking", {
                defaultValue: "Aucun classement disponible.",
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow p-5 border space-y-4">
        <h2 className="text-xl font-semibold">
          {t("dashboardStudent.assignments.title", {
            defaultValue: "📊 Devoirs",
          })}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-gray-500">
              {t("dashboardStudent.assignments.total", { defaultValue: "Total" })}
            </div>
            <div className="text-2xl font-bold mt-1">{assignmentStats.total}</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-gray-500">
              {t("dashboardStudent.assignments.submitted", {
                defaultValue: "Soumis",
              })}
            </div>
            <div className="text-2xl font-bold mt-1">
              {assignmentStats.submitted}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-gray-500">
              {t("dashboardStudent.assignments.pending", {
                defaultValue: "En attente",
              })}
            </div>
            <div className="text-2xl font-bold mt-1">
              {assignmentStats.pending}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-gray-500">
              {t("dashboardStudent.assignments.late", {
                defaultValue: "En retard",
              })}
            </div>
            <div className="text-2xl font-bold mt-1">{assignmentStats.late}</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-gray-500">
              {t("dashboardStudent.assignments.completionRate", {
                defaultValue: "Taux de complétion",
              })}
            </div>
            <div className="text-2xl font-bold mt-1">
              {assignmentStats.completionRate}%
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {assignmentStats.total > 0 && assignmentStats.submitted === assignmentStats.total
            ? t("dashboardStudent.assignments.excellent", {
                defaultValue: "🏆 Excellent – Tous les devoirs soumis",
              })
            : `${t("dashboardStudent.assignments.academicRisk", {
                defaultValue: "📉 Risque académique",
              })}: ${
                assignmentStats.late > 0
                  ? t("dashboardStudent.assignments.riskHigh", {
                      defaultValue: "Élevé",
                    })
                  : assignmentStats.pending > 0
                  ? t("dashboardStudent.assignments.riskMedium", {
                      defaultValue: "Moyen",
                    })
                  : t("dashboardStudent.assignments.riskLow", {
                      defaultValue: "Faible",
                    })
              }`}
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow p-5 border">
        <h2 className="text-xl font-semibold">
          {t("dashboardStudent.grades.title", {
            defaultValue: "📈 Évolution des notes",
          })}
        </h2>

        <div className="mt-4 text-sm text-gray-500">
          {t("dashboardStudent.grades.score", { defaultValue: "Score" })}
        </div>
        <div className="text-3xl font-bold mt-1">
          {averageScore !== null ? averageScore : "—"}
        </div>
      </div>
    </div>
  );
}