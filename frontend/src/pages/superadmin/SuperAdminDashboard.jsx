// src/pages/superadmin/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";

export default function SuperAdminDashboard() {
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

  const cards = [
    {
      label: "Utilisateurs",
      value: stats.users,
      bg: "bg-blue-50",
    },
    {
      label: "News",
      value: stats.news,
      bg: "bg-green-50",
    },
    {
      label: "Opportunités",
      value: stats.opportunities,
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord superadmin</h1>
        <p className="text-gray-500 mt-1">
          Vue d’ensemble de la plateforme Harvest Center.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`${card.bg} rounded-2xl p-5 shadow-sm border border-gray-100`}
            >
              <div className="text-sm text-gray-500">{card.label}</div>
              <div className="text-3xl font-bold mt-2">{card.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-2">Accès rapide</h2>
        <p className="text-gray-600">
          Utilise le menu à gauche pour gérer les actualités, les opportunités,
          les utilisateurs et les médias.
        </p>
      </div>
    </div>
  );
}