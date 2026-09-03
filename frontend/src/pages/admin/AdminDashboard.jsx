// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function StatCard({ title, value, colorClass = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    classes: 0,
    courses: 0,
    pendingRequests: 0,
    validatedRequests: 0,
    paidStudents: 0,
    unpaidStudents: 0,
    revenue: 0,
    monthlyRegistrations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await api.get("/admin/stats");
      setStats((prev) => ({
        ...prev,
        ...(res.data || {}),
      }));
    } catch (err) {
      console.error("fetchStats error:", err);
      toast.error("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }

  const usersCompare = useMemo(
    () => [
      { name: "Étudiants", value: Number(stats.students || 0) },
      { name: "Formateurs", value: Number(stats.teachers || 0) },
    ],
    [stats]
  );

  const paymentCompare = useMemo(
    () => [
      { name: "Payés", value: Number(stats.paidStudents || 0) },
      { name: "Non payés", value: Number(stats.unpaidStudents || 0) },
    ],
    [stats]
  );

  const monthlyData = Array.isArray(stats.monthlyRegistrations)
    ? stats.monthlyRegistrations
    : [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Tableau de bord administrateur
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Vue globale sur les inscriptions, étudiants, enseignants, classes et paiements.
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          Chargement…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Utilisateurs" value={stats.totalUsers || 0} />
            <StatCard title="Étudiants" value={stats.students || 0} colorClass="text-blue-600" />
            <StatCard title="Formateurs" value={stats.teachers || 0} colorClass="text-indigo-600" />
            <StatCard title="Classes" value={stats.classes || 0} colorClass="text-emerald-600" />
            <StatCard title="Cours" value={stats.courses || 0} colorClass="text-amber-600" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Demandes en attente" value={stats.pendingRequests || 0} colorClass="text-orange-500" />
            <StatCard title="Demandes validées" value={stats.validatedRequests || 0} colorClass="text-cyan-600" />
            <StatCard title="Étudiants payés" value={stats.paidStudents || 0} colorClass="text-green-600" />
            <StatCard title="Revenus" value={`${Number(stats.revenue || 0).toLocaleString()} FCFA`} colorClass="text-violet-600" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Étudiants vs formateurs
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usersCompare}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Paiements étudiants
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentCompare} dataKey="value" nameKey="name" outerRadius={110} label>
                      <Cell />
                      <Cell />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Inscriptions par mois
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}