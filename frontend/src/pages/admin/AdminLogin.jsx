// 📁 /pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Email et mot de passe requis.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.post("/admin/login", {
        email: form.email,
        motdepasse: form.password,
      });

      // data: { token, role, ... }
      const storage = form.remember ? localStorage : sessionStorage;
      storage.setItem("adminToken", data?.token);
      if (data?.role) storage.setItem("adminRole", data.role);

      toast.success("Connexion réussie !");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Échec de connexion.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow space-y-4"
      >
        <div className="text-center">
          <img src="/images/logo-harvest.jpg" alt="Harvest Center" className="h-12 mx-auto mb-2" />
          <h1 className="text-xl font-semibold text-[#1F75BB]">Espace Admin</h1>
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
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
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
          <Link to="/admin/forgot" className="text-sm text-[#1F75BB] hover:underline">
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
