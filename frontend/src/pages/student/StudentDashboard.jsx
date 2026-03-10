// src/pages/student/StudentDashboard.jsx
import React, { lazy, useEffect, useState } from "react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils/url";

/* Chart.js */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
const LineChart = React.lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Line })));

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

/* helpers */
const asArray = (v) => (Array.isArray(v) ? v : []);
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

export default function StudentDashboard() {
  const { user, fetchMe } = useAuth();

  const [inscriptions, setInscriptions] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [summary, setSummary] = useState(null);

  const [stats, setStats] = useState(null);
  const [grades, setGrades] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setErr(null);
      try {
        const [
          insRes,
          payRes,
          profileRes,
          dashRes,
          gradesRes,
          rankingRes
        ] = await Promise.all([
          api.get(`/students/${user?.id}/enrollments`).catch(() => ({ data: [] })),
          api.get(`/profiles/${user?.id}/payments`).catch(() => ({ data: [] })),
          api.get("/profiles/me").catch(() => ({ data: null })),
          api.get("/student/dashboard").catch(() => ({ data: null })),
          api.get("/student/grades").catch(() => ({ data: [] })),
          api.get("/student/ranking").catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

        setInscriptions(asArray(insRes.data));
        setPaiements(asArray(payRes.data));
        setSummary(profileRes.data);
        setStats(dashRes?.data?.stats || null);
        setGrades(asArray(gradesRes.data));
        setRanking(asArray(rankingRes.data));
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Erreur lors du chargement des données");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (user?.id) loadAll();
    return () => (mounted = false);
  }, [user]);

  /* ===== LOGIC ===== */
  const completionRate = stats ? pct(stats.submitted, stats.total) : 0;
  const isExcellent = stats && stats.total > 0 && stats.submitted === stats.total;
  const riskLevel =
    completionRate >= 80 ? "low" : completionRate >= 50 ? "medium" : "high";

  const riskColor = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  }[riskLevel];

  const gradeChartData = {
    labels: grades.map((g) => g.course),
    datasets: [
      {
        label: "Score",
        data: grades.map((g) => g.score),
        borderColor: "#2563eb",
        backgroundColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* ===== HEADER ===== */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Espace étudiant</h1>
        <p className="text-gray-500">Tableau de bord académique</p>
      </header>

      {/* ===== PDF EXPORT ===== */}
      <button
        onClick={() => window.open("/student/dashboard/export-pdf")}
        className="px-3 py-2 bg-purple-600 text-white rounded mb-4"
      >
        📄 Télécharger PDF
      </button>

      {/* ===== STATS ASSIGNMENTS ===== */}
      {stats && (
        <section className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">📊 Assignments</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <StatCard title="Total" value={stats.total} color="bg-blue-500" />
            <StatCard title="Submitted" value={stats.submitted} color="bg-green-500" />
            <StatCard title="Pending" value={stats.pending} color="bg-yellow-400 text-black" />
            <StatCard title="Late" value={stats.late} color="bg-red-500" />
          </div>

          {/* Completion */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Taux de complétion</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className="h-2 bg-blue-600 rounded" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          {/* Badge */}
          {isExcellent && (
            <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              🏆 Excellent – Tous les devoirs soumis
            </div>
          )}

          {/* Risk */}
          <div className={`mt-3 p-3 rounded text-sm ${riskColor}`}>
            📉 Risque académique :
            <b className="ml-1">
              {riskLevel === "low" && "Faible"}
              {riskLevel === "medium" && "Moyen"}
              {riskLevel === "high" && "Élevé"}
            </b>
          </div>
        </section>
      )}

      {/* ===== GRADES CHART ===== */}
      {grades.length > 0 && (
        <section className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">📈 Évolution des notes</h2>
          <Line data={gradeChartData} />
        </section>
      )}

      {/* ===== ACTIONS ===== */}
      <section className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-3">
          <Link to="/dashboard/my-courses" className="btn-primary">📚 Mes cours</Link>
          <Link to="/dashboard/assignments" className="btn-secondary">📝 Mes devoirs</Link>
        </div>
      </section>

      {/* ===== CLASSEMENT ===== */}
      <section className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">🏆 Classement de la classe</h2>
        {ranking.length === 0 ? (
          <div>Aucun classement disponible.</div>
        ) : (
          <ol className="list-decimal ml-5 text-sm">
            {ranking.map((r, idx) => (
              <li key={r.id} className="mb-1">
                #{idx + 1} {r.full_name} — Moyenne: {Number(r.average_score).toFixed(2)}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

/* ===== SMALL COMPONENT ===== */
function StatCard({ title, value, color }) {
  return (
    <div className={`p-4 rounded text-white ${color}`}>
      <div className="text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
