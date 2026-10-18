// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ClipboardList, AlarmClock, BookOpen, CheckCircle2 } from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, StatCard, StatGrid, Panel, EmptyState, Notice, SkeletonGrid } from "@/components/dash";

const safeArray = (v) => (Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : []);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function formatDate(value, lang) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short" });
}

export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";

  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [dashRes, assignRes] = await Promise.allSettled([
        api.get("/student/dashboard"),
        api.get("/assignments"),
      ]);
      if (!mounted) return;

      setDashboard(dashRes.status === "fulfilled" ? dashRes.value?.data ?? {} : {});
      setAssignments(assignRes.status === "fulfilled" ? safeArray(assignRes.value?.data) : []);
      if (dashRes.status === "rejected") {
        setErr(
          t("dashboardStudent.loadErrorNew", {
            defaultValue: "Votre tableau de bord n’a pas pu être chargé. Rechargez la page dans un instant.",
          })
        );
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [t]);

  const stats = useMemo(() => {
    const s = dashboard?.stats || {};
    const total = num(s.total) || assignments.length;
    const submitted = num(s.submitted);
    const late = num(s.late);
    const pending = num(s.pending) || Math.max(total - submitted - late, 0);
    const rate = num(dashboard?.completionRate) || (total ? Math.round((submitted / total) * 100) : 0);
    return { total, submitted, late, pending, rate };
  }, [dashboard, assignments]);

  const upcoming = useMemo(
    () =>
      assignments
        .filter((a) => a?.deadline || a?.due_date)
        .map((a) => ({ ...a, _due: new Date(a.deadline || a.due_date) }))
        .filter((a) => !Number.isNaN(a._due.getTime()) && a._due >= new Date(Date.now() - 86400000))
        .sort((a, b) => a._due - b._due)
        .slice(0, 5),
    [assignments]
  );

  const courses = safeArray(dashboard?.courses);
  const announcements = safeArray(dashboard?.announcements).slice(0, 4);
  const firstName = user?.first_name || String(user?.email || "").split("@")[0];

  const inscriptionNotice = () => {
    const status = dashboard?.inscriptionStatus;
    if (status === "pending" || status === "validated") {
      return (
        <Notice tone="warn">
          {t("dashboardStudent.inscriptionPending", {
            defaultValue:
              "Votre demande d’inscription est en cours de traitement. Vos cours et devoirs apparaîtront dès que l’administration vous aura affecté à une classe.",
          })}
        </Notice>
      );
    }
    if (status === "rejected") {
      return (
        <Notice tone="bad">
          {t("dashboardStudent.inscriptionRejected", {
            defaultValue: "Votre demande d’inscription n’a pas été retenue. Contactez l’administration pour en savoir plus.",
          })}
        </Notice>
      );
    }
    return (
      <Notice
        tone="info"
        action={
          <Link to="/dashboard/student/inscription" className="btn-primary focus-ring !py-2.5 text-sm">
            {t("dashboardStudent.inscriptionCta", { defaultValue: "Faire ma demande" })}
          </Link>
        }
      >
        {t("dashboardStudent.inscriptionMissing", {
          defaultValue: "Vous n’êtes pas encore inscrit à une formation. Déposez votre demande pour accéder à vos cours, devoirs et notes.",
        })}
      </Notice>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboardStudent.hello", { name: firstName, defaultValue: "Bonjour {{name}}" })}
        subtitle={t("dashboardStudent.subtitleNew", {
          defaultValue: "Vos devoirs à rendre, vos cours et les annonces de votre classe.",
        })}
      />

      {err && <Notice tone="bad">{err}</Notice>}
      {!loading && dashboard?.needsInscription && inscriptionNotice()}

      {loading ? (
        <SkeletonGrid />
      ) : (
        <StatGrid>
          <StatCard
            primary
            icon={ClipboardList}
            label={t("dashboardStudent.kpi.pending", { defaultValue: "Devoirs à rendre" })}
            value={stats.pending}
            hint={t("dashboardStudent.kpi.pendingHint", { count: stats.total, defaultValue: "sur {{count}} au total" })}
            to="/dashboard/student/assignments"
          />
          <StatCard
            icon={AlarmClock}
            tone={stats.late > 0 ? "bad" : "default"}
            label={t("dashboardStudent.kpi.late", { defaultValue: "En retard" })}
            value={stats.late}
            hint={
              stats.late > 0
                ? t("dashboardStudent.kpi.lateHint", { defaultValue: "À rendre au plus vite" })
                : t("dashboardStudent.kpi.lateNone", { defaultValue: "Aucun retard" })
            }
          />
          <StatCard
            icon={BookOpen}
            label={t("dashboardStudent.kpi.courses", { defaultValue: "Cours suivis" })}
            value={courses.length}
            to="/dashboard/my-courses"
          />
          <StatCard
            icon={CheckCircle2}
            tone={stats.rate >= 80 ? "ok" : "default"}
            label={t("dashboardStudent.kpi.rate", { defaultValue: "Devoirs rendus" })}
            value={`${stats.rate} %`}
            hint={t("dashboardStudent.kpi.rateHint", { count: stats.submitted, defaultValue: "{{count}} rendus" })}
          />
        </StatGrid>
      )}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title={t("dashboardStudent.upcoming.title", { defaultValue: "Prochains devoirs" })}
            actions={
              <Link to="/dashboard/student/assignments" className="text-sm font-medium text-brand hover:text-brand-800">
                {t("dashboardStudent.upcoming.all", { defaultValue: "Tous les devoirs" })}
              </Link>
            }
            bodyClassName="!p-0"
          >
            {upcoming.length ? (
              <ul className="divide-y divide-line">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{a.title || a.name}</p>
                      {a.course_title && <p className="truncate text-[13px] text-mist">{a.course_title}</p>}
                    </div>
                    <span className="shrink-0 rounded-lg bg-paper px-2.5 py-1 text-[13px] font-medium tabular-nums text-ink">
                      {formatDate(a._due, lang)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5">
                <EmptyState title={t("dashboardStudent.upcoming.emptyTitle", { defaultValue: "Rien à rendre pour l’instant" })}>
                  {t("dashboardStudent.upcoming.empty", {
                    defaultValue: "Les devoirs donnés par vos formateurs apparaîtront ici avec leur date limite.",
                  })}
                </EmptyState>
              </div>
            )}
          </Panel>

          <Panel title={t("dashboardStudent.courses.title", { defaultValue: "Mes cours" })} bodyClassName="!p-0">
            {courses.length ? (
              <ul className="divide-y divide-line">
                {courses.slice(0, 6).map((c) => (
                  <li key={c.id} className="px-5 py-3.5">
                    <p className="font-medium text-ink">{c.title}</p>
                    {c.description && <p className="line-clamp-1 text-[13px] text-mist">{c.description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5">
                <EmptyState title={t("dashboardStudent.courses.emptyTitle", { defaultValue: "Aucun cours" })}>
                  {t("dashboardStudent.courses.empty", { defaultValue: "Vos cours s’afficheront ici une fois inscrit dans une classe." })}
                </EmptyState>
              </div>
            )}
          </Panel>

          {announcements.length > 0 && (
            <Panel className="lg:col-span-3" title={t("dashboardStudent.news.title", { defaultValue: "Annonces de la classe" })} bodyClassName="!p-0">
              <ul className="divide-y divide-line">
                {announcements.map((a) => (
                  <li key={a.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-ink">{a.title}</p>
                      <span className="text-[13px] text-mist">
                        {[a.course_title, formatDate(a.created_at, lang)].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    {(a.content || a.message) && (
                      <p className="mt-1 line-clamp-2 text-sm text-mist">{a.content || a.message}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
