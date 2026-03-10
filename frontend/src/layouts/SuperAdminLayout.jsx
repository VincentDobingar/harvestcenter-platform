// src/layouts/SuperAdminLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

/**
 * Minimal SuperAdmin layout:
 * - simple sidebar with links for superadmin area
 * - renders <Outlet/> for child routes
 */
export default function SuperAdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r p-4">
        <h1 className="text-lg font-bold mb-4">SuperAdmin</h1>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/superadmin" className="px-3 py-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/superadmin/news" className="px-3 py-2 rounded hover:bg-gray-100">Actualités</Link>
          <Link to="/superadmin/media" className="px-3 py-2 rounded hover:bg-gray-100">Médias</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
