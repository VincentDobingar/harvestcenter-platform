// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, GraduationCap, Wallet, Users, School, BookOpen, UserRound, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import api from "@/utils/api";
import { PageHeader, StatCard, StatGrid, Panel, EmptyState, SkeletonGrid } from "@/components/dash";
import { CHART } from "@/components/dash/chartTheme";

const n = (v) => Number(v || 0);
const fmt = (v) => n(v).toLocaleString("fr-FR");

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchStats(initial = false) {
    try {
      if (!initial) setRefreshing(true);
      const res = await api.get("/admin/stats");
      setStats(res.data || {});
    } catch (err) {
      console.error("fetchStats error:", err);
      toast.error("Les statistiques n’ont pas pu être chargées.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats(true);
  }, []);

  const paid = n(stats.paidStudents);
  const unpaid = n(stats.unpaidStudents);
  const paidRate = paid + unpaid ? Math.round((paid / (paid + unpaid)) * 100) : 0;
  const monthly = useMemo(
    () => (Array.isArray(stats.monthlyRegistrations) ? stats.monthlyRegistrations : []).map((m) => ({ ...m, count: n(m.count) })),
    [stats]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle="Inscriptions, effectifs et paiements du centre."
        actions={
          <button type="button" onClick={() => fetchStats()} disabled={refreshing} className="btn-ghost focus-ring">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        }
      />

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <StatGrid>
            <StatCard
              primary
              icon={FileText}
              label="Demandes à traiter"
              value={fmt(stats.pendingRequests)}
              hint={`${fmt(stats.validatedRequests)} déjà validées`}
              to="/admin/inscriptions/demandes"
            />
            <StatCard icon={GraduationCap} label="Étudiants" value={fmt(stats.students)} to="/admin/students" />
            <StatCard
              icon={Wallet}
              label="Encaissé"
              value={fmt(stats.revenue)}
              unit="FCFA"
              tone="ok"
            />
            <StatCard
              icon={Users}
              label="Formateurs"
              value={fmt(stats.teachers)}
              to="/admin/teachers"
            />
          </StatGrid>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="Inscriptions par mois"
              description="Nouvelles demandes reçues"
            >
              {monthly.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={CHART.grid} />
                      <XAxis dataKey="month" tick={CHART.tick} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={CHART.tick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART.tooltip} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Inscriptions"
                        stroke={CHART.primary}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: CHART.primary }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="Pas encore de données">
                  La courbe apparaîtra avec les premières demandes d’inscription.
                </EmptyState>
              )}
            </Panel>

            <Panel title="Frais d’inscription" description="Étudiants à jour de leurs frais">
              <p className="font-display text-[2.4rem] font-semibold leading-none text-ink tabular-nums">{paidRate} %</p>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-paper" role="img" aria-label={`${paid} payés, ${unpaid} non payés`}>
                <div className="bg-ok" style={{ width: `${paidRate}%` }} />
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-mist">
                    <span className="h-2.5 w-2.5 rounded-full bg-ok" /> Payés
                  </dt>
                  <dd className="font-semibold tabular-nums text-ink">{fmt(paid)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-mist">
                    <span className="h-2.5 w-2.5 rounded-full bg-line" /> Non payés
                  </dt>
                  <dd className="font-semibold tabular-nums text-ink">{fmt(unpaid)}</dd>
                </div>
              </dl>
              <Link to="/admin/students" className="mt-5 inline-block text-sm font-medium text-brand hover:text-brand-800">
                Voir les étudiants
              </Link>
            </Panel>
          </div>

          <StatGrid cols={3}>
            <StatCard icon={School} label="Classes" value={fmt(stats.classes)} to="/admin/classes" />
            <StatCard icon={BookOpen} label="Cours" value={fmt(stats.courses)} to="/admin/courses" />
            <StatCard icon={UserRound} label="Comptes utilisateurs" value={fmt(stats.totalUsers)} />
          </StatGrid>
        </>
      )}
    </div>
  );
}
