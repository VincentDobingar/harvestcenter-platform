// src/pages/dashboard/DashboardIndex.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";

export default function DashboardIndex() {
  const { user, booting } = useAuth();

  if (booting) return <PageLoader />;

  if (!user) {
    return <Navigate to="/account?tab=login" replace />;
  }

  const role = String(user.role || "").trim().toLowerCase();

  if (role === "superadmin") return <Navigate to="/superadmin" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (["teacher", "formateur"].includes(role)) {
    return <Navigate to="/dashboard/teacher" replace />;
  }
  if (["student", "etudiant"].includes(role)) {
    return <Navigate to="/dashboard/student" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
}