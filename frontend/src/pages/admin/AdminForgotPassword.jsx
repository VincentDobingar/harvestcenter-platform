// 📁 /pages/admin/AdminForgotPassword.jsx
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const RECAPTCHA_SRC = "https://www.google.com/recaptcha/api.js?render=";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      console.warn("VITE_RECAPTCHA_SITE_KEY manquant.");
      return;
    }
    if (window.grecaptcha) return;
    const s = document.createElement("script");
    s.src = `${RECAPTCHA_SRC}${siteKey}`;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  }, [siteKey]);

  const getToken = () =>
    new Promise((resolve) => {
      if (!siteKey || !window.grecaptcha) return resolve(null);
      window.grecaptcha.ready(async () => {
        try {
          const t = await window.grecaptcha.execute(siteKey, { action: "admin_forgot" });
          resolve(t);
        } catch {
          resolve(null);
        }
      });
    });

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Entrez votre email.");
    try {
      setSending(true);
      const token = await getToken();
      await api.post("/admin/forgot-password", { email, token });
      setSent(true);
      toast.success("Si le compte existe, un lien a été envoyé.");
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Impossible d’envoyer la demande.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded-2xl shadow space-y-4">
        <h1 className="text-xl font-semibold text-[#1F75BB] text-center">Mot de passe oublié</h1>
        {sent && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded">
            Si le compte existe, un email a été envoyé.
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1F75BB]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@harvestcenter.td"
            required
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-[#1F75BB] text-white py-2 rounded hover:bg-[#155b94] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {sending && <Loader2 className="w-4 h-4 animate-spin" />}
          Envoyer le lien
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
