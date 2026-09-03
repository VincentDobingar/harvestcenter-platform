// src/pages/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";
import QuickLessonForm from "@/components/QuickLessonForm";
import { useAuth } from "@/context/AuthContext";
import { rowsFromResponse } from "@/utils/normalize";
import { toAbsoluteUrl } from "@/utils/url";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [courses, setCourses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      if (!user?.id) return;

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
        setDashboardStats(statsRes.data || {});
        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);

        const chartRows = Array.isArray(chartRes.data) ? chartRes.data : [];
        const chartLabels = chartRows.map((c) => c.title || t("teacherDashboard.fallback.untitled"));
        const chartGrades = chartRows.map((c) => Number(c.avg_grade || 0));

        setChartData({
          labels: chartLabels,
          datasets: [
            {
              label: t("teacherDashboard.chart.averagePerCourse"),
              data: chartGrades,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        });
      } catch (e) {
        console.error("TeacherDashboard loadAll error:", e);
        if (mounted) setErr(t("teacherDashboard.errors.loadData"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();

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
      await api.post("/lessons", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const r = await api.get("/teacher/courses");
      setCourses(rowsFromResponse(r.data));
      toast.success(t("teacherDashboard.success.lessonCreated"));
    } catch (e) {
      console.error("Erreur création leçon:", e);
      setErr(t("teacherDashboard.errors.createLesson"));
      toast.error(t("teacherDashboard.errors.createLesson"));
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            <img
              src={toAbsoluteUrl(user?.avatar_url || "/images/avatar-placeholder.png")}
              alt={t("teacherDashboard.avatarAlt")}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold">{t("teacherDashboard.title")}</h1>
            <div className="text-sm text-gray-500">
              {t("teacherDashboard.welcome", {
                name: show(user?.full_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim()),
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3 py-2 border rounded text-sm"
          >
            {t("teacherDashboard.actions.logout")}
          </button>

          <Link
            to="/dashboard/profile"
            className="px-3 py-2 border rounded text-sm"
          >
            {t("teacherDashboard.actions.profile")}
          </Link>
        </div>
      </header>

      {loading ? (
        <div>{t("teacherDashboard.states.loading")}</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <section className="bg-white p-4 rounded shadow grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-gray-500 text-sm">{t("teacherDashboard.stats.courses")}</div>
                <div className="text-lg font-bold">{dashboardStats.totalCourses || 0}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">{t("teacherDashboard.stats.students")}</div>
                <div className="text-lg font-bold">{dashboardStats.totalStudents || 0}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">{t("teacherDashboard.stats.average")}</div>
                <div className="text-lg font-bold">
                  {Number(dashboardStats.averageGrade || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">{t("teacherDashboard.stats.revenue")}</div>
                <div className="text-lg font-bold">
                  {dashboardStats.totalRevenue || 0} FCFA
                </div>
              </div>
            </section>

            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">{t("teacherDashboard.courses.title")}</h2>

              {Array.isArray(courses) && courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 border rounded flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-sm text-gray-500">
                          {t("teacherDashboard.courses.meta", {
                            count: c.students_count || 0,
                            average: Number(c.average_grade || 0).toFixed(2),
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/teacher/lecons/${c.id}`}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          {t("teacherDashboard.actions.view")}
                        </Link>
                        <Link
                          to={`/teacher/lecons/${c.id}/edit`}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          {t("teacherDashboard.actions.edit")}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">{t("teacherDashboard.courses.empty")}</div>
              )}
            </section>

            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">
                {t("teacherDashboard.quickLesson.title")}
              </h2>
              <QuickLessonForm onCreate={handleCreateLesson} />
            </section>

            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">
                {t("teacherDashboard.chart.title")}
              </h2>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">
                {t("teacherDashboard.notifications.title")}
              </h2>

              {notifications.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {notifications.map((n, idx) => (
                    <li key={idx}>
                      {(n.student_name || n.student || t("teacherDashboard.fallback.unknownStudent"))}
                      {" — "}
                      {(n.assignment_title || n.assignment || t("teacherDashboard.fallback.unknownAssignment"))}
                      {" ("}
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString()
                        : t("teacherDashboard.fallback.justNow")}
                      {")"}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">
                  {t("teacherDashboard.notifications.empty")}
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}