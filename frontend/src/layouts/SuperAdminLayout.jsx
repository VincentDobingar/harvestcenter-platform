// src/layouts/SuperAdminLayout.jsx
import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/utils/api";

const navClass = ({ isActive }) =>
  `block px-4 py-3 rounded-xl text-sm font-medium transition ${
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-gray-700 hover:bg-gray-100"
  }`;

export default function SuperAdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      toast.success("Déconnexion réussie.");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("logout error:", error);
      toast.error("Impossible de se déconnecter.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-blue-700">SuperAdmin</h1>
          <p className="text-sm text-gray-500 mt-1">Harvest Center</p>
        </div>

        <nav className="space-y-2 flex-1">
          <NavLink to="/superadmin" end className={navClass}>
            Dashboard
          </NavLink>

          <NavLink to="/superadmin/news" className={navClass}>
            Actualités
          </NavLink>

          <NavLink to="/superadmin/opportunities" className={navClass}>
            Opportunités
          </NavLink>

          <NavLink to="/superadmin/users" className={navClass}>
            Utilisateurs
          </NavLink>

          <NavLink to="/superadmin/media" className={navClass}>
            Médias
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
        >
          Déconnexion
        </button>
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}