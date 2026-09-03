// 📁 src/components/RequireRole.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";

export default function RequireRole({ allowed = [], children }) {
  const { user, booting, normalizeRole } = useAuth();
  const location = useLocation();

  if (booting) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/account?tab=login"
        replace
        state={{ from: location }}
      />
    );
  }

  const role = normalizeRole(user?.role);
  const normalizedAllowed = Array.isArray(allowed)
    ? allowed.map((r) => normalizeRole(r))
    : [];

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}