// components/DashboardSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  HomeIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  CreditCardIcon,
  UserCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function DashboardSidebar({ mobile = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || "").toLowerCase();

  const isStudent = ["student", "etudiant", "learner"].some(r => role.includes(r));
  const isTeacher = ["teacher", "formateur", "trainer", "instructor"].some(r => role.includes(r));

  const handleClick = () => {
    if (mobile && typeof onClose === "function") onClose();
  };

  async function handleLogout(e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    try {
      // Supporte logout sync ou async
      await Promise.resolve(logout && logout());
    } catch (err) {
      console.error("Logout failed:", err);
      // On continue la redirection même en cas d'erreur côté backend
    } finally {
      // Rediriger vers la page de connexion et remplacer l'historique
      navigate("/account?tab=login", { replace: true });
    }
  }

  // NOTE: paths are RELATIVE (no leading "/") for links that should stay under /dashboard,
  // but for "Accueil" we use absolute to be safe from anywhere.
  const linksCommon = [
    {
      to: isStudent ? "/dashboard/student" : isTeacher ? "/dashboard/teacher" : "/dashboard",
      label: "Accueil",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    { to: "profile", label: "Profil", icon: <UserCircleIcon className="w-5 h-5" /> },
  ];

  const linksStudent = [
    { to: "my-courses", label: "Mes cours", icon: <BookOpenIcon className="w-5 h-5" /> },
    { to: "student/payments", label: "Paiements", icon: <CreditCardIcon className="w-5 h-5" /> },
    { to: "student/assignments", label: "Devoirs", icon: <DocumentCheckIcon className="w-5 h-5" /> },
    { to: "notes", label: "Notes", icon: <AcademicCapIcon className="w-5 h-5" /> },
    { to: "timetable", label: "Emploi du temps", icon: <CalendarIcon className="w-5 h-5" /> },
  ];

  const linksTeacher = [
    { to: "teacher/assignments", label: "Publier devoirs", icon: <DocumentCheckIcon className="w-5 h-5" /> },
    { to: "teacher/notes", label: "Publier notes", icon: <AcademicCapIcon className="w-5 h-5" /> },
    { to: "teacher/timetable", label: "Emploi du temps", icon: <CalendarIcon className="w-5 h-5" /> },
  ];

  const links = [
    ...linksCommon,
    ...(isStudent ? linksStudent : []),
    ...(isTeacher ? linksTeacher : []),
    // Keep this as a marker; we will render it as a button (not a NavLink)
    { to: "logout", label: "Déconnexion", icon: <ArrowRightOnRectangleIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className={`w-64 border-r bg-white min-h-screen p-4 ${mobile ? "" : "hidden md:block"}`}>
      <div className="mb-8">
        <div className="text-xl font-bold tracking-wide flex items-center gap-2 mb-1">
          <AcademicCapIcon className="w-6 h-6 text-blue-600" />
          {isTeacher ? "Espace Formateur" : isStudent ? "Espace Étudiant" : "Tableau de bord"}
        </div>
        <div className="text-xs text-gray-500 pl-1">{user?.email}</div>
      </div>

      <nav className="space-y-2">
        {links.map(link =>
          // render logout as a button that calls handleLogout
          (link.to === "logout" || link.to === "/logout") ? (
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
                `flex items-center gap-3 px-4 py-2 rounded-md font-medium transition-all
               ${isActive ? "bg-blue-100 text-blue-600 shadow-sm" : "hover:bg-gray-100 text-gray-700"}`
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
