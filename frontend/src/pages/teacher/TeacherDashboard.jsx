// src/pages/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { BookOpen, Users, GraduationCap, Inbox } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import api from "@/utils/api";
import QuickLessonForm from "@/components/QuickLessonForm";
import { useAuth } from "@/context/AuthContext";
import { rowsFromResponse } from "@/utils/normalize";
import { PageHeader, StatCard, StatGrid, Panel, EmptyState, Notice, SkeletonGrid } from "@/components/dash";
import { CHART } from "@/components/dash/chartTheme";

export default function TeacherDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-GB" : "fr-FR";

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [chartRows, setChartRows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!user?.id) return undefined;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [coursesRes, statsRes, chartRes, notifRes] = await Promise.all([
          api.get("/teacher/courses").catch(() => ({ data: [] })),
          api.get("/teacher/dashboard-stats").catch(() => ({ data: {} })),
          api.get("/teacher/chart-stats").catch(() => ({ data: [] })),
          api.get("/teacher/notifications").catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setCourses(rowsFromResponse(coursesRes.data));
        setStats(statsRes.data || {});
        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
        setChartRows(
          (Array.isArray(chartRes.data) ? chartRes.data : []).map((c) => ({
            name: c.title || t("teacherDashboard.fallback.untitled", { defaultValue: "Sans titre" }),
            value: Number(Number(c.avg_grade || 0).toFixed(2)),
          }))
        );
      } catch (e) {
        console.error("TeacherDashboard load error:", e);
        if (mounted) setErr(t("teacherDashboard.errors.loadData", { defaultValue: "Les données n’ont pas pu être chargées." }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id, t]);

  async function handleCreateLesson(payload) {
    const fd = new FormData();
    fd.append("title", payload.title);
    fd.append("content", payload.content);
    if (payload.file) fd.append("media", payload.file);

    try {
      await api.post("/lessons", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const r = await api.get("/teacher/courses");
      setCourses(rowsFromResponse(r.data));
      toast.success(t("teacherDashboard.success.lessonPublished", { defaultValue: "Leçon publiée" }));
    } catch (e) {
      console.error("Erreur création leçon:", e);
      toast.error(t("teacherDashboard.errors.publishLesson", { defaultValue: "La leçon n’a pas pu être publiée." }));
    }
  }

  const firstName = user?.first_name || String(user?.email || "").split("@")[0];
  const average = Number(stats.averageGrade || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("teacherDashboard.hello", { name: firstName, defaultValue: "Bonjour {{name}}" })}
        subtitle={t("teacherDashboard.subtitleNew", {
          defaultValue: "Vos cours, les devoirs rendus par vos étudiants et leurs résultats.",
        })}
      />

      {err && <Notice tone="bad">{err}</Notice>}

      {loading ? (
        <SkeletonGrid count={3} />
      ) : (
        <StatGrid cols={3}>
          <StatCard
            primary
            icon={BookOpen}
            label={t("teacherDashboard.stats.courses", { defaultValue: "Cours" })}
            value={stats.totalCourses || courses.length || 0}
            to="/dashboard/my-courses"
          />
          <StatCard
            icon={Users}
            label={t("teacherDashboard.stats.students", { defaultValue: "Étudiants" })}
            value={stats.totalStudents || 0}
          />
          <StatCard
            icon={GraduationCap}
            label={t("teacherDashboard.stats.average", { defaultValue: "Moyenne générale" })}
            value={average ? average.toLocaleString(locale, { maximumFractionDigits: 2 }) : "—"}
            hint={t("teacherDashboard.stats.averageHint", { defaultValue: "sur 20, tous cours confondus" })}
          />
        </StatGrid>
      )}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title={t("teacherDashboard.courses.title", { defaultValue: "Mes cours" })} bodyClassName="!p-0">
              {courses.length ? (
                <ul className="divide-y divide-line">
                  {courses.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <p className="min-w-0 truncate font-medium text-ink">{c.title}</p>
                      <p className="shrink-0 text-[13px] tabular-nums text-mist">
                        {t("teacherDashboard.courses.metaNew", {
                          count: c.students_count || 0,
                          average: Number(c.average_grade || 0).toFixed(1),
                          defaultValue: "{{count}} étudiants, moyenne {{average}}",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5">
                  <EmptyState title={t("teacherDashboard.courses.emptyTitle", { defaultValue: "Aucun cours attribué" })}>
                    {t("teacherDashboard.courses.emptyNew", {
                      defaultValue: "L’administration vous attribue vos cours. Ils apparaîtront ici.",
                    })}
                  </EmptyState>
                </div>
              )}
            </Panel>

            <Panel
              title={t("teacherDashboard.chart.titleNew", { defaultValue: "Moyenne par cours" })}
              description={t("teacherDashboard.chart.desc", { defaultValue: "Notes sur 20" })}
            >
              {chartRows.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartRows} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={CHART.grid} />
                      <XAxis dataKey="name" tick={CHART.tick} axisLine={false} tickLine={false} interval={0} />
                      <YAxis domain={[0, 20]} tick={CHART.tick} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: CHART.cursor }} contentStyle={CHART.tooltip} />
                      <Bar dataKey="value" name="Moyenne" fill={CHART.primary} radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title={t("teacherDashboard.chart.emptyTitle", { defaultValue: "Pas encore de notes" })}>
                  {t("teacherDashboard.chart.empty", { defaultValue: "Les moyennes s’afficheront dès les premières notes saisies." })}
                </EmptyState>
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title={t("teacherDashboard.notifications.titleNew", { defaultValue: "Devoirs rendus récemment" })} bodyClassName="!p-0">
              {notifications.length ? (
                <ul className="divide-y divide-line">
                  {notifications.slice(0, 8).map((n, idx) => (
                    <li key={n.id || idx} className="px-5 py-3">
                      <p className="text-sm font-medium text-ink">
                        {n.student_name || n.student || t("teacherDashboard.fallback.unknownStudent", { defaultValue: "Étudiant" })}
                      </p>
                      <p className="text-[13px] text-mist">
                        {n.assignment_title || n.assignment || t("teacherDashboard.fallback.unknownAssignment", { defaultValue: "Devoir" })}
                        {n.created_at ? `, ${new Date(n.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 px-5 py-6 text-sm text-mist">
                  <Inbox className="h-5 w-5" />
                  {t("teacherDashboard.notifications.emptyNew", { defaultValue: "Aucun devoir rendu pour le moment." })}
                </div>
              )}
            </Panel>

            <Panel title={t("teacherDashboard.quickLesson.titleNew", { defaultValue: "Publier une leçon" })}>
              <QuickLessonForm onCreate={handleCreateLesson} />
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
