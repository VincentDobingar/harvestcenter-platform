// src/components/AuthModal.jsx

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ open, onClose, initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab); // "login" | "register"
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (open) { setErr(""); setLoading(false); setTab(initialTab); }
  }, [open, initialTab]);

  if (!open) return null;

  async function submitLogin(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await login(fd.get("identifier"), fd.get("password"));
      onClose?.();
      nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Impossible de se connecter");
    } finally { setLoading(false); }
  }

  async function submitRegister(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await register({
        full_name: String(fd.get("full_name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        username: String(fd.get("username") || "").trim().toLowerCase(),
        password: fd.get("password"),
      });
      onClose?.();
      nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Inscription impossible");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* dialog */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
            <div className="flex gap-1">
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${tab==='login' ? 'btn-brand' : 'text-brand'}`}
                onClick={()=>setTab("login")}
              >
                Connexion
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${tab==='register' ? 'btn-brand' : 'text-brand'}`}
                onClick={()=>setTab("register")}
              >
                Créer un compte
              </button>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fermer">
              <X />
            </button>
          </div>

          {/* body */}
          <div className="p-5">
            {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}

            {tab === "login" ? (
              <form onSubmit={submitLogin} className="space-y-3">
                <input name="identifier" className="w-full border rounded-xl p-3" placeholder="Email ou identifiant" required />
                <input name="password" type="password" className="w-full border rounded-xl p-3" placeholder="Mot de passe" required />
                <button disabled={loading} className="w-full btn-brand">
                  {loading ? "Connexion…" : "Se connecter"}
                </button>
                <p className="text-sm text-center">
                  Nouveau ?{" "}
                  <button type="button" className="text-brand underline" onClick={()=>setTab("register")}>
                    Créer un compte
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={submitRegister} className="space-y-3">
                <input name="full_name" className="w-full border rounded-xl p-3" placeholder="Nom complet" required />
                <input name="email" type="email" className="w-full border rounded-xl p-3" placeholder="Email" required />
                <input name="username" className="w-full border rounded-xl p-3" placeholder="Identifiant (prenom12)"
                       pattern="^[a-z0-9._-]{3,20}$" title="3-20 caractères: lettres/chiffres, . _ -" required />
                <input name="password" type="password" className="w-full border rounded-xl p-3" placeholder="Mot de passe" required />
                <button disabled={loading} className="w-full btn-brand">
                  {loading ? "Création…" : "Créer mon compte"}
                </button>
                <p className="text-sm text-center">
                  Déjà inscrit ?{" "}
                  <button type="button" className="text-brand underline" onClick={()=>setTab("login")}>
                    Se connecter
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
