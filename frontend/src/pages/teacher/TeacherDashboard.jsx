import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/utils/api";
import QuickLessonForm from "@/components/QuickLessonForm";
import { useAuth } from "@/context/AuthContext";
import { rowsFromResponse } from "@/utils/normalize";
import { toAbsoluteUrl } from "@/utils/url";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { io } from "socket.io-client";

useEffect(() => {
  const socket = io("http://localhost:5000");

  socket.emit("join_teacher", user.id);

  socket.on("new_submission", (data) => {
    toast.success(`📩 ${data.student} a rendu ${data.assignment}`);
  });

  return () => socket.disconnect();
}, []);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TeacherDashboard() {
  const { user, logout, fetchMe } = useAuth();

  const [courses, setCourses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Helper safe display
  const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);

  /* ================================
     Load all teacher data
  ================================= */
  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setErr(null);
      try {
        const [coursesRes, statsRes, chartRes, notifRes, profileRes] = await Promise.all([
          api.get("/teacher/courses").catch(() => ({ data: [] })),
          api.get("/teacher/dashboard-stats").catch(() => ({ data: {} })),
          api.get("/teacher/chart-stats").catch(() => ({ data: [] })),
          api.get("/teacher/notifications").catch(() => ({ data: [] })),
          api.get("/profiles/me").catch(() => ({ data: null })),
        ]);

        if (!mounted) return;

        setCourses(rowsFromResponse(coursesRes.data));
        setDashboardStats(statsRes.data || {});
        setNotifications(notifRes.data || []);

        // Build chart
        const chartLabels = (chartRes.data || []).map(c => c.title);
        const chartGrades = (chartRes.data || []).map(c => Number(c.avg_grade || 0));
        setChartData({
          labels: chartLabels,
          datasets: [
            {
              label: "Moyenne par cours",
              data: chartGrades,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            }
          ]
        });

      } catch (e) {
        console.error("TeacherDashboard loadAll error:", e);
        if (mounted) setErr("Impossible de charger les données");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (user?.id) loadAll();
    return () => { mounted = false; };
  }, [user]);

  /* ================================
     Create quick lesson
  ================================= */
  async function handleCreateLesson(payload) {
    const fd = new FormData();
    fd.append("title", payload.title);
    fd.append("content", payload.content);
    if (payload.file) fd.append("media", payload.file);

    try {
      await api.post("/lessons", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const r = await api.get(`/teacher/courses`);
      setCourses(rowsFromResponse(r.data));
    } catch (e) {
      console.error("Erreur création leçon:", e);
      setErr("Erreur lors de la création de la leçon");
    }
  }

  /* ================================
     Logout
  ================================= */
  function handleLogout() {
    logout();
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            <img
              src={ toAbsoluteUrl(user?.avatar_url || "/images/avatar-placeholder.png") }
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tableau Formateur</h1>
            <div className="text-sm text-gray-500">Bienvenue, {show(user?.full_name)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="px-3 py-2 border rounded text-sm">Déconnexion</button>
          <Link to="/dashboard/profile" onClick={() => fetchMe()} className="px-3 py-2 border rounded text-sm">Mon profil</Link>
        </div>
      </header>

      {loading ? (
        <div>Chargement…</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================================
             Left column: Courses + Quick Lesson
          ================================= */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Dashboard stats */}
            <section className="bg-white p-4 rounded shadow grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-gray-500 text-sm">Cours</div>
                <div className="text-lg font-bold">{dashboardStats.totalCourses || 0}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Étudiants</div>
                <div className="text-lg font-bold">{dashboardStats.totalStudents || 0}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Moyenne générale</div>
                <div className="text-lg font-bold">{(dashboardStats.averageGrade || 0).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Revenus</div>
                <div className="text-lg font-bold">{dashboardStats.totalRevenue || 0} FCFA</div>
              </div>
            </section>

            {/* Courses list */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Mes cours</h2>
              {Array.isArray(courses) && courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map(c => (
                    <div key={c.id} className="p-3 border rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-sm text-gray-500">{c.students_count} étudiants — Moyenne {Number(c.average_grade || 0).toFixed(2)}</div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/teacher/lecons/${c.id}`} className="px-3 py-1 border rounded text-sm">Voir</Link>
                        <Link to={`/teacher/lecons/${c.id}/edit`} className="px-3 py-1 border rounded text-sm">Modifier</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-gray-500">Aucun cours trouvé.</div>}
            </section>

            {/* Quick lesson form */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Publier une leçon rapide</h2>
              <QuickLessonForm onCreate={handleCreateLesson} />
            </section>

            {/* Chart moyenne par cours */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Moyenne par cours 📈</h2>
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </section>

          </div>

          {/* ================================
             Right column: Notifications
          ================================= */}
          <aside className="flex flex-col gap-6">
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Derniers devoirs rendus 🔔</h2>
              {notifications.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {notifications.map((n, idx) => (
                    <li key={idx}>
                      {n.student_name} — {n.assignment_title} ({new Date(n.created_at).toLocaleString()})
                    </li>
                  ))}
                </ul>
              ) : <div className="text-gray-500 text-sm">Aucune notification.</div>}
            </section>
          </aside>

        </div>
      )}
    </div>
  );
}
