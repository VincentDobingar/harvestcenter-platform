// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Sidebar role-aware + styled order:
 * Tableau de bord
 * [AA] (nom / initiales)
 * Emplois du temps
 * Notes
 * Mes cours / Devoirs (selon role)
 * Déconnexion
 */

function initials(name = "") {
  const parts = (name || "").trim().split(/\s+/);
  return parts.length === 0 ? "AA" : (parts[0][0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

export default function Sidebar({ onLogout }) {
  const { user } = useAuth();
  const loc = useLocation();

  const role = String(user?.role || "").toLowerCase();

  const common = [
    { key: "dashboard", label: "Tableau de bord", to: role.includes("teacher") ? "/teacher" : "/student" },
    { key: "profile", label: "Profil", to: "/profile" }, // profile affiché dans dashboard area (voir routing)
    { key: "emploi", label: "Emplois du temps", to: role.includes("teacher") ? "/teacher/emploi" : "/student/emploi" },
    { key: "notes", label: "Notes", to: role.includes("teacher") ? "/teacher/notes" : "/student/notes" },
  ];

  const teacherOnly = [
    { key: "mes-cours", label: "Mes cours", to: "/teacher/mes-cours" },
    { key: "devoirs", label: "Devoirs", to: "/teacher/devoirs" },
  ];

  const studentOnly = [
    { key: "mes-cours", label: "Mes cours", to: "/student/courses" },
    { key: "paiements", label: "Paiements", to: "/student/paiements" },
    { key: "devoirs", label: "Devoirs", to: "/student/devoirs" },
  ];

  const items = [
    ...common,
    ...(role.includes("teacher") ? teacherOnly : studentOnly),
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r p-4 flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          {initials(user?.full_name || user?.name || user?.fullName)}
        </div>
        <div>
          <div className="text-lg font-semibold">{user?.full_name || user?.name || "Utilisateur"}</div>
          <div className="text-sm text-gray-500">{user?.role || ""}</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {items.map((i) => (
          <Link
            key={i.key}
            to={i.to}
            className={`block py-2 px-3 rounded ${loc.pathname.startsWith(i.to) ? "bg-gray-100" : "hover:bg-gray-50"}`}
          >
            {i.label}
          </Link>
        ))}
      </nav>

      <div className="pt-6">
        <button onClick={onLogout} className="w-full text-left py-2 px-3 rounded hover:bg-red-50 text-red-600">Déconnexion</button>
      </div>
    </aside>
  );
}
