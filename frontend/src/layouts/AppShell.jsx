// src/layouts/AppShell.jsx
// Cadre unique des espaces connectés (étudiant, formateur, admin, direction) :
// barre latérale bleu nuit, barre supérieure avec le titre de la page et le
// compte, contenu sur fond clair. Le menu vient de config/navigation.js.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, Menu, X, ChevronDown, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { navForRole, findNavItem, ROLE_LABELS } from "@/config/navigation";

function displayName(user) {
  return (
    user?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.email ||
    "Utilisateur"
  );
}

function initials(name) {
  const parts = String(name).split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "H";
}

function SidebarNav({ role, onNavigate }) {
  const sections = navForRole(role);

  return (
    <nav className="space-y-6" aria-label="Menu principal">
      {sections.map((section, idx) => (
        <div key={section.title || idx}>
          {section.title && (
            <p className="mb-2 px-3 text-xs font-medium text-white/45">{section.title}</p>
          )}
          <ul className="space-y-0.5">
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <li key={to + label}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] transition ${
                      isActive
                        ? "bg-white/10 font-semibold text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-millet transition-opacity ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-millet" : ""}`} />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({ role, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="focus-ring mx-3 mt-5 flex items-center gap-3 rounded-lg px-2 py-1.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
          <img src="/images/logo-harvest.jpg" alt="" className="h-full w-full object-contain" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-[17px] font-semibold text-white">Harvest Center</span>
          <span className="block text-xs text-millet">{ROLE_LABELS[role] || "Mon espace"}</span>
        </span>
      </Link>

      <div className="mt-7 flex-1 overflow-y-auto px-3 pb-6">
        <SidebarNav role={role} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-white/10 px-3 py-4">
        <a
          href="/"
          className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Voir le site public
        </a>
      </div>
    </div>
  );
}

function UserMenu({ user, role, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const name = displayName(user);
  const profilePath = role === "student" || role === "teacher" ? "/dashboard/profile" : null;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="focus-ring flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2 hover:bg-paper"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-semibold text-white">
          {initials(name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[180px] truncate text-sm font-semibold text-ink">{name}</span>
          <span className="block text-xs text-mist">{ROLE_LABELS[role]}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-mist sm:block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_40px_-12px_rgba(14,42,71,0.35)]"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-mist">{user?.email}</p>
          </div>
          {profilePath && (
            <Link
              role="menuitem"
              to={profilePath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-paper"
            >
              <UserRound className="h-4 w-4 text-mist" /> Mon profil
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-bad hover:bg-bad/5"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell() {
  const { user, logout, normalizeRole } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);

  const role = normalizeRole(user?.role);
  const current = useMemo(() => findNavItem(role, pathname), [role, pathname]);

  useEffect(() => setDrawer(false), [pathname]);

  useEffect(() => {
    document.title = current ? `${current.label} · Harvest Center` : "Harvest Center";
  }, [current]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/account?tab=login", { replace: true });
    }
  }

  return (
    <div className="app-ui min-h-screen bg-paper">
      {/* Barre latérale (bureau) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] bg-ink lg:block">
        <SidebarContent role={role} />
        <div className="woven absolute inset-y-0 right-0 w-1" aria-hidden="true" />
      </aside>

      {/* Tiroir (mobile) */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[82vw] max-w-[300px] bg-ink shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="Fermer le menu"
              className="focus-ring absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent role={role} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="Ouvrir le menu"
              className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-line lg:hidden"
            >
              <Menu className="h-5 w-5 text-ink" />
            </button>
            {/* Le titre de la page est dans la page ; ici, juste le repère de rubrique. */}
            <p className="min-w-0 flex-1 truncate text-sm text-mist">
              <span className="font-medium text-ink">{ROLE_LABELS[role]}</span>
              {current && current.label !== ROLE_LABELS[role] && (
                <span className="hidden sm:inline">
                  <span className="mx-2 text-line">/</span>
                  {current.label}
                </span>
              )}
            </p>
            <UserMenu user={user} role={role} onLogout={handleLogout} />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
