// 📁 src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import LangSelector from "@/components/LangSelector";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const nav = useNavigate();
  const { user, booting, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  const links = [
    { label: "Accueil", to: "/", type: "route" },
    { label: "Présentation", to: "/about", type: "route" },
    { label: "Bourses", to: "/bourses", type: "route" },
    { label: "Formations", to: "/courses", type: "route" },
    { label: "Contact", to: "/contact", type: "route" },
  ];

  const baseLink = "px-3 py-2 text-sm font-medium rounded hover:bg-gray-100 transition";
  const activeLink = "text-brand";
  const inactiveLink = "text-gray-700";

  const isStudent = String(user?.role || "").toLowerCase() === "student";

  async function handleLogout() {
    await logout();
    nav("/", { replace: true });
  }

  return (
    <nav className="relative">
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2">
        {links.map((l) =>
          l.type === "hash" ? (
            <a key={l.label} href={l.to} className={`${baseLink} ${inactiveLink}`}>
              {l.label}
            </a>
          ) : (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          )
        )}

        {!booting && (
          <>
            {!user ? (
              <Link to="/account" className="ml-2 btn-outline-brand">
                Connexion
              </Link>
            ) : (
              <>
                {isStudent && (
                  <Link
                    to="/dashboard/student/inscription"
                    className="btn"
                  >
                    S'inscrire
                  </Link>
                )}

                <div className="ml-2 flex items-center gap-2">
                  <Link to="/dashboard" className="btn-outline-brand">
                    Mon espace
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm rounded hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <div className="ml-2">
          <LangSelector />
        </div>
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100"
        aria-label="Ouvrir le menu"
      >
        {open ? <X /> : <Menu />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg p-2 md:hidden">
          <div className="flex flex-col">
            {links.map((l) =>
              l.type === "hash" ? (
                <a
                  key={l.label}
                  href={l.to}
                  className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
                >
                  {l.label}
                </a>
              ) : (
                <NavLink
                  key={l.label}
                  to={l.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded hover:bg-gray-100 ${
                      isActive ? "text-brand" : "text-gray-700"
                    }`
                  }
                  end={l.to === "/"}
                >
                  {l.label}
                </NavLink>
              )
            )}

            {!booting && (
              <>
                {!user ? (
                  <Link to="/account" className="mt-2 btn-outline-brand">
                    Connexion
                  </Link>
                ) : (
                  <>
                    {isStudent && (
                      <Link to="/dashboard/student/inscription" className="mt-2 btn-brand">
                        S’inscrire
                      </Link>
                    )}

                    <Link to="/dashboard" className="mt-2 btn-outline-brand">
                      Mon espace
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mt-2 px-3 py-2 rounded text-left hover:bg-gray-100 text-red-600"
                    >
                      Déconnexion
                    </button>
                  </>
                )}
              </>
            )}

            <div className="mt-2">
              <LangSelector />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}