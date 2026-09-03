// components/DashboardLayout.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
  title,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const resolvedTitle = title || t("dashboardLayout.title");

  const parts = String(location.pathname || "").split("/").filter(Boolean);
  const first = parts[0] || "";
  const basePath = first ? `/${first}` : "";

  const canonicalLinks = [
    { to: `${basePath}`, label: t("dashboardLayout.links.dashboard") },
    { to: `${basePath}/profile`, label: t("dashboardLayout.links.profile") },
    { to: `${basePath}/notes`, label: t("dashboardLayout.links.notes") },
    { to: `${basePath}/timetable`, label: t("dashboardLayout.links.timetable") },
  ];

  const role = String(user?.role || "").toLowerCase();
  const roleLinks = [];

  if (["etudiant", "student"].includes(role)) {
    roleLinks.push({
      to: `${basePath}/student`,
      label: t("dashboardLayout.links.studentSpace"),
    });
    roleLinks.push({
      to: `${basePath}/my-courses`,
      label: t("dashboardLayout.links.myCourses"),
    });
    roleLinks.push({
      to: `${basePath}/student/payments`,
      label: t("dashboardLayout.links.payments"),
    });
    roleLinks.push({
      to: `${basePath}/student/assignments`,
      label: t("dashboardLayout.links.assignments"),
    });
    roleLinks.push({
      to: `${basePath}/student/inscription`,
      label: t("dashboardLayout.links.registrationRequest"),
    });
  } else if (["formateur", "trainer", "teacher"].includes(role)) {
    roleLinks.push({
      to: `${basePath}/teacher`,
      label: t("dashboardLayout.links.teacherSpace"),
    });
    roleLinks.push({
      to: `${basePath}/assignments`,
      label: t("dashboardLayout.links.assignments"),
    });
  } else if (
    ["admin", "administrateur", "administrator", "superadmin", "secretaire"].includes(role)
  ) {
    roleLinks.push({
      to: `${basePath}/etudiants`,
      label: t("dashboardLayout.links.students"),
    });
    roleLinks.push({
      to: `${basePath}/attributions`,
      label: t("dashboardLayout.links.assignmentsAdmin"),
    });
    roleLinks.push({
      to: `${basePath}/emplois`,
      label: t("dashboardLayout.links.timetablesAdmin"),
    });
    roleLinks.push({
      to: `${basePath}/inscriptions`,
      label: t("dashboardLayout.links.registrations"),
    });
  }

  const seen = new Set();
  const links = [...canonicalLinks, ...roleLinks].filter((l) => {
    if (!l?.to) return false;
    if (seen.has(l.to)) return false;
    seen.add(l.to);
    return true;
  });

  const isActive = (linkTo) => {
    const p = location.pathname.replace(/\/+$/, "");
    const tPath = linkTo.replace(/\/+$/, "");
    return p === tPath || p.startsWith(`${tPath}/`);
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
          <aside className="md:col-span-1 bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-3 mb-4">
              {user?.image_url ? (
                <img
                  src={user.image_url}
                  alt={t("dashboardLayout.avatarAlt")}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
                  {initials(user?.full_name || user?.nom || "U")}
                </div>
              )}

              <div>
                <div className="text-sm font-semibold">
                  {user?.full_name || user?.nom || t("dashboardLayout.user")}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>

            <nav className="flex flex-col gap-2 text-sm">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={() =>
                    `block px-3 py-2 rounded ${
                      isActive(l.to)
                        ? "bg-gray-100 font-medium"
                        : "hover:bg-gray-50"
                    }`
                  }
                  end={false}
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{resolvedTitle}</h2>
            </div>

            <div className="space-y-4">{children || <Outlet />}</div>
          </main>
        </div>
      </div>
    </div>
  );
}