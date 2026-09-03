// src/components/Sidebar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function initials(name = "") {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AA";
  return (
    (parts[0]?.[0] || "").toUpperCase() +
    (parts[1]?.[0] || "").toUpperCase()
  );
}

export default function Sidebar({ onLogout }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const loc = useLocation();

  const role = String(user?.role || "").toLowerCase();

  const common = [
    { key: "dashboard", label: t("sidebar.dashboard"), to: "/dashboard" },
    { key: "profile", label: t("sidebar.profile"), to: "/dashboard/profile" },
    { key: "emploi", label: t("sidebar.timetable"), to: "/dashboard/timetable" },
    { key: "notes", label: t("sidebar.notes"), to: "/dashboard/notes" },
  ];

  const teacherOnly = [
    { key: "teacher-space", label: t("sidebar.teacherSpace"), to: "/dashboard/teacher" },
    { key: "devoirs", label: t("sidebar.assignments"), to: "/dashboard/assignments" },
  ];

  const studentOnly = [
    { key: "student-space", label: t("sidebar.studentSpace"), to: "/dashboard/student" },
    { key: "mes-cours", label: t("sidebar.myCourses"), to: "/dashboard/my-courses" },
    { key: "paiements", label: t("sidebar.payments"), to: "/dashboard/student/payments" },
    { key: "devoirs", label: t("sidebar.assignments"), to: "/dashboard/student/assignments" },
    { key: "inscription", label: t("sidebar.registrationRequest"), to: "/dashboard/student/inscription" },
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
          <div className="text-lg font-semibold">
            {user?.full_name || user?.name || t("sidebar.user")}
          </div>
          <div className="text-sm text-gray-500">{user?.role || ""}</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`block py-2 px-3 rounded ${
              loc.pathname.startsWith(item.to)
                ? "bg-gray-100"
                : "hover:bg-gray-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="pt-6">
        <button
          onClick={onLogout}
          className="w-full text-left py-2 px-3 rounded hover:bg-red-50 text-red-600"
        >
          {t("auth.logout")}
        </button>
      </div>
    </aside>
  );
}