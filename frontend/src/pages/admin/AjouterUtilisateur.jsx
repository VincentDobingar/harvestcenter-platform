// 📁 src/pages/admin/AjouterUtilisateur.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/utils/api";

export default function AjouterUtilisateur() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    role: "user",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!form.full_name.trim()) return setErr("Le nom complet est requis.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErr("Email invalide.");
    if (form.password.length < 8) return setErr("Mot de passe: 8 caractères minimum.");

    try {
      setLoading(true);
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };
      if (form.username.trim()) payload.username = form.username.trim().toLowerCase();

      await api.post("/users", payload); // POST /api/users (token admin requis)
      nav("/admin?created=1"); // ✅ redirige vers une page existante
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Échec de la création.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Ajouter un utilisateur</h1>
        <Link to="/admin" className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50">
          ← Retour
        </Link>
      </div>

      {err && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom complet</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={onChange}
            className="mt-1 w-full border rounded-lg p-2"
            placeholder="Jane Doe"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="mt-1 w-full border rounded-lg p-2"
              placeholder="jane@exemple.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Identifiant (username)</label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              className="mt-1 w-full border rounded-lg p-2"
              placeholder="(laisser vide pour auto)"
            />
            <p className="text-xs text-gray-500 mt-1">
              3–20 caractères a–z, 0–9, point, tiret, underscore.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Rôle</label>
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="mt-1 w-full border rounded-lg p-2"
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
            <option value="superadmin">Super Administrateur</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Mot de passe</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={onChange}
              className="mt-1 w-full border rounded-lg p-2 pr-24"
              placeholder="Min. 8 caractères"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 border rounded"
            >
              {showPwd ? "Masquer" : "Afficher"}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer l’utilisateur"}
          </button>
        </div>
      </form>
    </div>
  );
}
