// src/pages/auth/Account.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function Account() {
  const { login, register, gotoByRole } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student",
  });

  const [showPwd, setShowPwd] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (isLogin) {
        if (!form.email.trim() || !form.password.trim()) {
          toast.error("Veuillez remplir tous les champs.");
          return;
        }

        setLoading(true);

        const user = await login(form.email.trim(), form.password);

        if (user?.role) {
          toast.success("Connexion réussie !");

          const next = location.state?.next;

          if (next) {
            nav(next, { replace: true });
          } else {
            gotoByRole(user, nav);
          }
        } else {
          toast.error("Session invalide.");
        }
      } else {
        if (
          !form.email.trim() ||
          !form.password.trim() ||
          !form.first_name.trim() ||
          !form.last_name.trim()
        ) {
          toast.error("Veuillez remplir tous les champs.");
          return;
        }

        setLoading(true);

        const payload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role || "student",
        };

        await register(payload);

        toast.success("Inscription réussie. En attente de validation.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Account auth error:", err);

      const message =
        err?.response?.data?.message ||
        (err?.code === "ERR_NETWORK"
          ? "Problème réseau ou extension navigateur."
          : err?.message) ||
        "Erreur d'authentification";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          {isLogin ? "Connexion" : "Créer un compte"}
        </h1>

        {!isLogin && (
          <>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              placeholder="Prénom"
              required
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              placeholder="Nom"
              required
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Enseignant</option>
              <option value="admin">Administrateur</option>
            </select>
          </>
        )}

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          placeholder="Email"
          required
        />

        <div className="relative">
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 pr-12"
            placeholder="Mot de passe"
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
          >
            {showPwd ? "Masquer" : "Voir"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-brand"
        >
          {loading
            ? isLogin
              ? "Connexion…"
              : "Création…"
            : isLogin
              ? "Se connecter"
              : "Créer mon compte"}
        </button>

        <p className="text-center text-sm">
          {isLogin ? (
            <>
              Pas de compte ?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-600 underline"
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-600 underline"
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}