// 📁 /pages/admin/AdminLogin.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const { login, gotoByRole } = useAuth();

  const from = location.state?.from?.pathname;

  function onChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Email et mot de passe requis.");
      return;
    }

    try {
      setLoading(true);

      const loggedUser = await login(
        form.email.trim().toLowerCase(),
        form.password
      );

      toast.success("Connexion réussie !");

      if (from) {
        window.location.href = from;
        return;
      }

      gotoByRole(loggedUser);
    } catch (err) {
      console.error("Admin login error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Échec de connexion.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow space-y-4"
      >
        <div className="text-center">
          <img
            src="/images/logo-harvest.jpg"
            alt="Harvest Center"
            className="h-12 mx-auto mb-2"
          />
          <h1 className="text-xl font-semibold text-[#1F75BB]">
            Espace Admin
          </h1>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1F75BB]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1F75BB]"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={onChange}
            />
            Se souvenir de moi
          </label>

          <Link
            to="/admin/forgot"
            className="text-sm text-[#1F75BB] hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1F75BB] text-white py-2 rounded hover:bg-[#155b94] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Connexion
        </button>
      </form>
    </div>
  );
}