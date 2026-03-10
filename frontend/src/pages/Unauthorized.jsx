// 📁 src/pages/Unauthorized.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-3">Accès refusé 🚫</h1>
        <p className="text-gray-700 mb-6">
          {user?.role
            ? `Votre rôle actuel (« ${user.role} ») ne vous permet pas d’accéder à cette page.`
            : "Vous n’avez pas la permission d’accéder à cette page."}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Retour à l’accueil
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
            >
              Déconnexion
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-block text-blue-600 hover:underline text-sm"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
