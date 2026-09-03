// src/layouts/AdminLayout.jsx
import React, { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Users,
  School,
  BookOpen,
  CalendarDays,
  Image as ImageIcon,
  UserPlus,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

function SidebarLink({ to, icon: Icon, label, exact = false, badge, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          "group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all",
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        )
      }
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </span>

      {badge ? (
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
          {badge}
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
      )}
    </NavLink>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div className="space-y-2">
      <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const userName = useMemo(() => {
    return (
      user?.full_name ||
      user?.name ||
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.email ||
      "Utilisateur"
    );
  }, [user]);

  const closeMobileMenu = () => setOpen(false);

  const nav = (isMobile = false) => (
    <>
      <SidebarSection title="Pilotage">
        <SidebarLink
          to="/admin"
          exact
          icon={LayoutDashboard}
          label="Tableau de bord"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
      </SidebarSection>

      <SidebarSection title="Gestion académique">
        <SidebarLink
          to="/admin/inscriptions/demandes"
          icon={FileText}
          label="Demandes d’inscription"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
        <SidebarLink
          to="/admin/students"
          icon={GraduationCap}
          label="Étudiants inscrits"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
        <SidebarLink
          to="/admin/teachers"
          icon={Users}
          label="Formateurs"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
        <SidebarLink
          to="/admin/classes"
          icon={School}
          label="Classes"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
        <SidebarLink
          to="/admin/courses"
          icon={BookOpen}
          label="Cours"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
        <SidebarLink
          to="/admin/timetables"
          icon={CalendarDays}
          label="Emploi du temps"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
      </SidebarSection>

      <SidebarSection title="Contenu">
        <SidebarLink
          to="/admin/media"
          icon={ImageIcon}
          label="Médias"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
      </SidebarSection>

      <SidebarSection title="Administration">
        <SidebarLink
          to="/admin/utilisateurs/ajouter"
          icon={UserPlus}
          label="Ajouter un utilisateur"
          onClick={isMobile ? closeMobileMenu : undefined}
        />
      </SidebarSection>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex md:w-80 md:flex-col border-r border-slate-200 bg-white">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-slate-200 px-5 py-5">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <img
                  src="/logo-harvest.jpg"
                  alt="Harvest Center"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="text-base font-bold text-slate-900">
                  Harvest Center
                </div>
                <div className="text-xs text-slate-500">Espace admin</div>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
            {nav(false)}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Connecté en tant que
              </div>

              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {userName?.[0]?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {userName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {String(user?.role || "—")}
                  </div>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg border border-slate-200 p-2"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <img
                  src="/images/logo-harvest.jpg"
                  alt="Harvest Center"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold text-slate-900">Harvest Admin</span>
            </Link>
          </div>

          <button
            onClick={() => logout()}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
          >
            Déconnexion
          </button>
        </div>

        {open && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[88vw] bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <img
                      src="/images/logo-harvest.jpg"
                      alt="Harvest Center"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Harvest Center</div>
                    <div className="text-xs text-slate-500">Espace admin</div>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                {nav(true)}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}