import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";

export default function RequireRole({ allowed = [], children }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  // ⏳ attendre chargement auth
  if (booting) {
    return <PageLoader />;
  }

  // ❌ utilisateur non connecté
  if (!user) {
    return (
      <Navigate
        to="/account"
        state={{ next: location.pathname + location.search }}
        replace
      />
    );
  }

  const role = String(user.role || "").toLowerCase();

  // ❌ rôle non autorisé
  if (allowed.length && !allowed.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ autorisé
  return children;
}