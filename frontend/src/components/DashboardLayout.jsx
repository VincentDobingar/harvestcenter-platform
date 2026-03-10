// components/DashboardLayout.jsx

import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * DashboardLayout (reusable)
 * - shows a left sidebar with role-aware links
 * - computes basePath from first path segment so links are absolute
 * - preserves active state for subroutes (startsWith)
 */
export default function DashboardLayout({ children, title = "Tableau de bord" }) {
  const { user } = useAuth();
  const location = useLocation();

  const parts = String(location.pathname || "").split("/").filter(Boolean);
  const first = parts[0] || "";
  const basePath = first ? `/${first}` : "";

  // debug
  // eslint-disable-next-line no-console
  console.debug("DashboardLayout:", { pathname: location.pathname, basePath, user: user ? { id: user.id, role: user.role } : null });

  const canonicalLinks = [
    { to: `${basePath}/dashboard`, label: "Tableau de bord" },
    { to: `${basePath}/profile`, label: "Mon profil" },
  ];

  const role = (user?.role || "").toLowerCase();
  const roleLinks = [];
  if (["etudiant", "student"].includes(role)) {
    roleLinks.push({ to: `${basePath}/cours`, label: "Mes cours" });
    roleLinks.push({ to: `${basePath}/paiements`, label: "Paiements" });
  } else if (["formateur", "trainer", "teacher"].includes(role)) {
    roleLinks.push({ to: `${basePath}/classes`, label: "Mes classes" });
    roleLinks.push({ to: `${basePath}/lessons`, label: "Leçons" });
  } else if (["admin", "administrateur", "administrator", "superadmin", "secretaire"].includes(role)) {
    roleLinks.push({ to: `${basePath}/etudiants`, label: "Étudiants" });
    roleLinks.push({ to: `${basePath}/attributions`, label: "Attributions" });
    roleLinks.push({ to: `${basePath}/emplois`, label: "Emplois du temps" });
    roleLinks.push({ to: `${basePath}/inscriptions`, label: "Inscriptions" });
  }

  // merge & dedupe
  const seen = new Set();
  const links = [...canonicalLinks, ...roleLinks].filter((l) => {
    if (!l || !l.to) return false;
    if (seen.has(l.to)) return false;
    seen.add(l.to);
    return true;
  });

  const isActive = (linkTo) => {
    const p = location.pathname.replace(/\/+$/, "");
    const t = linkTo.replace(/\/+$/, "");
    return p === t || p.startsWith(t + "/");
  };

  const initials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0] || "")
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1 bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-3 mb-4">
              {user?.image_url ? (
                <img src={user.image_url} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
                  {initials(user?.full_name || user?.nom || "U")}
                </div>
              )}

              <div>
                <div className="text-sm font-semibold">{user?.full_name || user?.nom || "Utilisateur"}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>

            <nav className="flex flex-col gap-2 text-sm">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={() =>
                    `block px-3 py-2 rounded ${isActive(l.to) ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`
                  }
                  end={false}
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>

            <div className="space-y-4">{children || <Outlet />}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
