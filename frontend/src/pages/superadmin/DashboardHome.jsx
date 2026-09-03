// src/pages/superadmin/DashboardHome.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    users: 0,
    news: 0,
    opportunities: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/dashboard");
      setStats({
        users: res.data?.users ?? 0,
        news: res.data?.news ?? 0,
        opportunities: res.data?.opportunities ?? 0,
      });
    } catch (error) {
      console.error("dashboard stats error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tableau de bord</h2>
        <p className="text-gray-500">
          Vue d’ensemble de la plateforme Harvest Center.
        </p>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-2xl p-5">
            <div className="text-sm text-gray-500">Utilisateurs</div>
            <div className="text-3xl font-bold">{stats.users}</div>
          </div>

          <div className="bg-green-50 rounded-2xl p-5">
            <div className="text-sm text-gray-500">News</div>
            <div className="text-3xl font-bold">{stats.news}</div>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-5">
            <div className="text-sm text-gray-500">Opportunités</div>
            <div className="text-3xl font-bold">{stats.opportunities}</div>
          </div>
        </div>
      )}
    </div>
  );
}