// src/pages/dashboard/DashboardIndex.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * DashboardIndex
 * 
 * Page d'index du dashboard qui redirige automatiquement selon le rôle
 * - Student -> /dashboard/student
 * - Teacher -> /dashboard/teacher
 * - Admin/SuperAdmin -> /admin ou /superadmin
 * - Sinon -> /login
 */
export default function DashboardIndex() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Pas connecté -> redirection vers login
      navigate("/login", { replace: true });
      return;
    }

    switch (user.role) {
      case "student":
      case "etudiant":
        navigate("/dashboard/student", { replace: true });
        break;
      case "teacher":
      case "formateur":
        navigate("/dashboard/teacher", { replace: true });
        break;
      case "admin":
      case "administrateur":
      case "secretaire":
        navigate("/admin", { replace: true });
        break;
      case "superadmin":
        navigate("/superadmin", { replace: true });
        break;
      default:
        // rôle inconnu -> login
        navigate("/login", { replace: true });
        break;
    }
  }, [user, navigate]);

  // On peut afficher un loader pendant la redirection
  return <div>Redirection en cours...</div>;
}
