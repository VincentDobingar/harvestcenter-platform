// src/components/RolePrivateRoute.jsx

import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function RolePrivateRoute({ allowedRoles = ["student"] || ["teacher"] || ["etudiant"] || ["formateur"], children }) {
  const [state, setState] = useState({ loading: true, user: null });
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/auth/me"); // endpoint général pour récupérer l'utilisateur connecté et son rôle
        const user = data?.user ?? data;            // Adapté pour plusieurs formats
        if (alive) setState({ loading: false, user });
      } catch {
        if (alive) setState({ loading: false, user: null });
      }
    })();
    return () => { alive = false; };
  }, []);

  if (state.loading) return <div className="p-6">Chargement…</div>;

  if (!state.user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  const roles = Array.isArray(state.user.roles)
    ? state.user.roles
    : [state.user.role || ""];

  const hasAccess = allowedRoles.some(r => roles.includes(r));
  if (!hasAccess) return <div className="p-6 text-red-600">Accès refusé.</div>;

  // Redirections vers dashboard approprié selon rôle
  if (roles.includes("student") || roles.includes("etudiant")) {
    if (!location.pathname.startsWith("/dashboard/student")) {
      return <Navigate to="/dashboard/student" replace />;
    }
  } else if (roles.includes("teacher") || roles.includes("formateur")) {
    if (!location.pathname.startsWith("/dashboard/teacher")) {
      return <Navigate to="/dashboard/teacher" replace />;
    }
  }

  return children;
}
