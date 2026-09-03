  // components/DashboardSidebar.jsx
  import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import {
  HomeIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  CreditCardIcon,
  UserCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export default function DashboardSidebar({
  mobile = false,
  onClose = () => {},
}) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = String(user?.role || "").toLowerCase();

  const isStudent = ["student", "etudiant", "learner"].some((r) =>
    role.includes(r)
  );
  const isTeacher = ["teacher", "formateur", "trainer", "instructor"].some((r) =>
    role.includes(r)
  );

  const handleClick = () => {
    if (mobile && typeof onClose === "function") onClose();
  };

  async function handleLogout(e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    try {
      await Promise.resolve(logout && logout());
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/account?tab=login", { replace: true });
    }
  }

  const linksCommon = [
    {
      to: isStudent
        ? "/dashboard/student"
        : isTeacher
        ? "/dashboard/teacher"
        : "/dashboard",
      label: t("dashboardSidebar.home"),
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      to: "profile",
      label: t("dashboardSidebar.profile"),
      icon: <UserCircleIcon className="w-5 h-5" />,
    },
  ];

  const linksStudent = [
    {
      to: "my-courses",
      label: t("dashboardSidebar.myCourses"),
      icon: <BookOpenIcon className="w-5 h-5" />,
    },
    {
      to: "student/payments",
      label: t("dashboardSidebar.payments"),
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
    {
      to: "student/assignments",
      label: t("dashboardSidebar.assignments"),
      icon: <DocumentCheckIcon className="w-5 h-5" />,
    },
    {
      to: "student/inscription",
      label: t("dashboardSidebar.registrationRequest"),
      icon: <PencilSquareIcon className="w-5 h-5" />,
    },
    {
      to: "notes",
      label: t("dashboardSidebar.notes"),
      icon: <AcademicCapIcon className="w-5 h-5" />,
    },
    {
      to: "timetable",
      label: t("dashboardSidebar.timetable"),
      icon: <CalendarIcon className="w-5 h-5" />,
    },
  ];

  const linksTeacher = [
    {
      to: "assignments",
      label: t("dashboardSidebar.assignments"),
      icon: <DocumentCheckIcon className="w-5 h-5" />,
    },
    {
      to: "notes",
      label: t("dashboardSidebar.notes"),
      icon: <AcademicCapIcon className="w-5 h-5" />,
    },
    {
      to: "timetable",
      label: t("dashboardSidebar.timetable"),
      icon: <CalendarIcon className="w-5 h-5" />,
    },
  ];

  const links = [
    ...linksCommon,
    ...(isStudent ? linksStudent : []),
    ...(isTeacher ? linksTeacher : []),
    {
      to: "logout",
      label: t("auth.logout"),
      icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className={`w-64 border-r bg-white min-h-screen p-4 ${
        mobile ? "" : "hidden md:block"
      }`}
    >
      <div className="mb-8">
        <div className="text-xl font-bold tracking-wide flex items-center gap-2 mb-1">
          <AcademicCapIcon className="w-6 h-6 text-blue-600" />
          {isTeacher
            ? t("dashboardSidebar.teacherSpace")
            : isStudent
            ? t("dashboardSidebar.studentSpace")
            : t("dashboardSidebar.dashboard")}
        </div>
        <div className="text-xs text-gray-500 pl-1">{user?.email}</div>
      </div>

      <nav className="space-y-2">
        {links.map((link) =>
          link.to === "logout" ? (
            <button
              key={link.to}
              onClick={handleLogout}
              type="button"
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-3 font-medium"
            >
              {link.icon}
              <span className="truncate">{link.label}</span>
            </button>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md font-medium transition-all ${
                  isActive
                    ? "bg-blue-100 text-blue-600 shadow-sm"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
              onClick={handleClick}
              end
            >
              {link.icon}
              <span className="truncate">{link.label}</span>
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}