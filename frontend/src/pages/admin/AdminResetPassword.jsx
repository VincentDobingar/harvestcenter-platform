// 📁 /pages/admin/AdminResetPassword.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ p1: "", p2: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.p1 || form.p1.length < 8) return toast.error("Mot de passe trop court (min. 8).");
    if (form.p1 !== form.p2) return toast.error("Les mots de passe ne correspondent pas.");
    try {
      setLoading(true);
      await api.post(`/admin/reset-password/${encodeURIComponent(token)}`, { motdepasse: form.p1 });
      toast.success("Mot de passe réinitialisé. Connectez-vous.");
      navigate("/admin/login", { replace: true });
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Lien invalide ou expiré.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded-2xl shadow space-y-4">
        <h1 className="text-xl font-semibold text-[#1F75BB] text-center">Réinitialiser le mot de passe</h1>
        <div>
          <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1F75BB]"
            value={form.p1}
            onChange={(e) => setForm((f) => ({ ...f, p1: e.target.value }))}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1F75BB]"
            value={form.p2}
            onChange={(e) => setForm((f) => ({ ...f, p2: e.target.value }))}
            required
            minLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1F75BB] text-white py-2 rounded hover:bg-[#155b94] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Réinitialiser
        </button>
        <div className="text-center">
          <Link to="/admin/login" className="text-sm text-[#1F75BB] hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </form>
    </div>
  );
}
