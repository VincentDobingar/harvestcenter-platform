// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

/**
 * AdminLayout
 * - Sidebar with quick links for admin staff
 * - Topbar with small user area and mobile sidebar toggle
 *
 * Usage: wrap admin routes with <RequireRole> and render <AdminLayout/>
 */

function SidebarIcon({ children, label }) {
  return (
    <span className="w-6 h-6 inline-flex items-center justify-center mr-2">
      {children}
    </span>
  );
}

function SidebarLink({ to, children, exact = false }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        clsx(
          "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
          isActive ? "text-white" : "text-gray-700",
        )
      }
      style={({ isActive }) => (isActive ? { backgroundColor: "var(--brand)" } : undefined)}
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 bg-white border-r p-4">
        <div className="mb-6">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white grid place-items-center font-bold">HC</div>
            <div>
              <div className="font-semibold">Harvest Center</div>
              <div className="text-xs text-gray-500">Espace admin</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink to="/admin">
            <SidebarIcon label="dashboard">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" fill="currentColor"/></svg>
            </SidebarIcon>
            Tableau de bord
          </SidebarLink>

          <SidebarLink to="/admin/students">
            <SidebarIcon label="students">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" fill="currentColor"/></svg>
            </SidebarIcon>
            Étudiants
          </SidebarLink>

          <SidebarLink to="/admin/classes">
            <SidebarIcon label="classes">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v2H4zM4 10h10v2H4zM4 14h16v6H4z" fill="currentColor"/></svg>
            </SidebarIcon>
            Classes
          </SidebarLink>

          <SidebarLink to="/admin/courses/">
            <SidebarIcon label="courses">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v2H4zM4 10h16v8H4z" fill="currentColor"/></svg>
            </SidebarIcon>
            Cours
          </SidebarLink>

          <SidebarLink to="/admin/teachers">
            <SidebarIcon label="teachers">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-4 0-12 2-12 6v2h24v-2c0-4-8-6-12-6z" fill="currentColor"/></svg>
            </SidebarIcon>
            Formateurs
          </SidebarLink>

          <SidebarLink to="/admin/media">
            <SidebarIcon label="media">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" fill="currentColor"/></svg>
            </SidebarIcon>
            Médias
          </SidebarLink>

          <SidebarLink to="/admin/utilisateurs/ajouter">
            <SidebarIcon label="users">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zM6 11c1.7 0 3-1.3 3-3S7.7 5 6 5 3 6.3 3 8s1.3 3 3 3zm0 2c-2.3 0-7 1.2-7 3.5V20h14v-3.5C13 14.2 8.3 13 6 13zm10 0c-.3 0-.7 0-1 .1 1.1.9 1.9 2.1 1.9 3.4V20h6v-3.5c0-2.3-4.7-3.5-6-3.5z" fill="currentColor"/></svg>
            </SidebarIcon>
            Utilisateurs
          </SidebarLink>
        </nav>

        <div className="mt-auto pt-4 border-t">
          <div className="text-xs text-gray-500 mb-2">Connecté en tant que</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 grid place-items-center text-sm font-semibold">
              {user?.name?.[0] ?? user?.full_name?.[0] ?? (user?.email ? user.email[0] : "U")}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{user?.name ?? user?.full_name ?? user?.email}</div>
              <div className="text-xs text-gray-500">{String(user?.role ?? "—")}</div>
            </div>
            <button
              onClick={() => logout()}
              className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden w-full bg-white border-b p-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen((s) => !s)} className="p-2 rounded-md border">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <Link to="/admin" className="font-semibold">Harvest Admin</Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">{user?.name ?? user?.full_name ?? user?.email}</div>
          <button onClick={() => logout()} className="px-2 py-1 rounded bg-red-600 text-white text-sm">Déconnexion</button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 overflow-auto">
            <div className="mb-4">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white grid place-items-center font-bold">HC</div>
                <div>
                  <div className="font-semibold">Harvest Center</div>
                  <div className="text-xs text-gray-500">Espace admin</div>
                </div>
              </Link>
            </div>

            <nav className="flex flex-col gap-1">
              <SidebarLink to="/admin">Tableau de bord</SidebarLink>
              <SidebarLink to="/admin/students">Étudiants</SidebarLink>
              <SidebarLink to="/admin/classes">Classes</SidebarLink>
              <SidebarLink to="/admin/courses">Cours</SidebarLink>
              <SidebarLink to="/admin/teachers">Formateurs</SidebarLink>
              <SidebarLink to="/admin/media">Médias</SidebarLink>
              <SidebarLink to="/admin/utilisateurs/ajouter">Utilisateurs</SidebarLink>
            </nav>

            <div className="mt-6">
              <button onClick={() => logout()} className="w-full px-3 py-2 rounded bg-red-600 text-white">Déconnexion</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
