// 📁 src/components/NavAuth.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function NavAuth() {
  const { token, user, booting, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu au clic à l'extérieur
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (booting) {
    return (
      <div className="w-24 h-9 rounded-xl bg-gray-200 animate-pulse" aria-hidden />
    );
  }

  // Utilisateur non connecté -> montrer Connexion / Créer un compte
  if (!token) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="px-4 py-2 rounded-xl border border-blue-600 text-blue-700 hover:bg-blue-50 transition text-sm"
        >
          Connexion
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
        >
          Créer un compte
        </Link>
      </div>
    );
  }

  // Utilisateur connecté -> menu profil
  const initial =
    (user?.full_name?.trim()?.charAt(0)?.toUpperCase() ||
      user?.email?.trim()?.charAt(0)?.toUpperCase() ||
      "U");

  function onLogout() {
    logout();
    setOpen(false);
    nav("/", { replace: true });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu utilisateur"
      >
        <span className="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center font-semibold">
          {initial}
        </span>
        <span className="hidden sm:block text-sm">{user?.full_name || user?.email}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white shadow-lg overflow-hidden z-50"
        >
          <Link
            to="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Tableau de bord
          </Link>
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Mon profil
          </Link>
          <Link
            to="/my-courses"
            className="block px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Mes cours
          </Link>
          <Link
            to="/assignments"
            className="block px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Mes devoirs
          </Link>
          <div className="border-t my-1" />
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
