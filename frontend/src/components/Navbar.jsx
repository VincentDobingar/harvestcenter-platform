// src/components/Navbar.jsx

import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import LangSelector from "@/components/LangSelector";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const nav = useNavigate();
  const { user, booting, logout, normalizeRole, getDashboardPath } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { labelKey: "nav.home", to: "/", type: "route" },
    { labelKey: "nav.about", to: "/about", type: "route" },
    { labelKey: "nav.opportunities", to: "/opportunites", type: "route" },
    { labelKey: "nav.courses", to: "/courses", type: "route" },
    { labelKey: "nav.contact", to: "/contact", type: "route" },
  ];

  const role = normalizeRole(user?.role);
  const isStudent = role === "student";
  const dashboardPath = getDashboardPath(role);

  async function handleLogout() {
    await logout();
    nav("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 px-3 md:px-4 pt-3">
      <div
        className={`max-w-7xl mx-auto rounded-2xl md:rounded-3xl transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-xl border border-slate-200"
            : "bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/images/logo-harvest.jpg"
              alt="Harvest Center"
              className="h-11 w-auto rounded-xl object-cover"
            />
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-slate-900 leading-none">
                Harvest Center
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Language - Culture - Education
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {links.map((l) => (
              <NavLink
                key={l.labelKey}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {t(l.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <LangSelector />

            {!booting && !user && (
              <>
                <Link
                  to="/account"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {t("auth.login")}
                </Link>
                <Link
                  to="/inscription"
                  className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                >
                  {t("auth.apply")}
                </Link>
              </>
            )}

            {!booting && user && (
              <>
                {isStudent && (
                  <Link
                    to="/dashboard/student/inscription"
                    className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    {t("auth.apply")}
                  </Link>
                )}

                <Link
                  to={dashboardPath}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {t("auth.dashboard")}
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  {t("auth.logout")}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl hover:bg-slate-100 transition"
            aria-label={t("common.toggleMenu")}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-slate-200 px-4 pb-4 pt-3">
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <NavLink
                  key={l.labelKey}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-2xl text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  {t(l.labelKey)}
                </NavLink>
              ))}

              <div className="pt-2">
                <LangSelector />
              </div>

              {!booting && !user && (
                <>
                  <Link
                    to="/account"
                    className="mt-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 font-medium"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    to="/inscription"
                    className="inline-flex items-center justify-between mt-2 px-4 py-3 rounded-2xl bg-blue-600 text-white font-semibold"
                  >
                    {t("auth.apply")}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              )}

              {!booting && user && (
                <>
                  {isStudent && (
                    <Link
                      to="/dashboard/student/inscription"
                      className="inline-flex items-center justify-between mt-2 px-4 py-3 rounded-2xl bg-blue-600 text-white font-semibold"
                    >
                      {t("auth.apply")}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}

                  <Link
                    to={dashboardPath}
                    className="mt-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 font-medium"
                  >
                    {t("auth.dashboard")}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="mt-2 px-4 py-3 rounded-2xl text-left bg-red-50 text-red-600 font-medium"
                  >
                    {t("auth.logout")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}