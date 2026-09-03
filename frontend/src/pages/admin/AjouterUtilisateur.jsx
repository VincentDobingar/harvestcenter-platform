// src/pages/admin/AjouterUtilisateur.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  const map = {
    student: "student",
    etudiant: "student",
    "étudiant": "student",

    teacher: "teacher",
    enseignant: "teacher",
    formateur: "teacher",

    admin: "admin",
    administrateur: "admin",

    superadmin: "superadmin",
    super_admin: "superadmin",
  };

  return map[value] || null;
};

export default function AjouterUtilisateur() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentRole = normalizeRole(user?.role);

  const allowedRoles = useMemo(() => {
    if (currentRole === "superadmin") {
      return [
        { value: "student", label: "Étudiant" },
        { value: "teacher", label: "Formateur" },
        { value: "admin", label: "Administrateur" },
      ];
    }

    if (currentRole === "admin") {
      return [
        { value: "student", label: "Étudiant" },
        { value: "teacher", label: "Formateur" },
      ];
    }

    return [];
  }, [currentRole]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (allowedRoles.length > 0) {
      setForm((prev) => {
        const currentStillAllowed = allowedRoles.some((r) => r.value === prev.role);
        if (currentStillAllowed) return prev;
        return { ...prev, role: allowedRoles[0].value };
      });
    }
  }, [allowedRoles]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!["admin", "superadmin"].includes(currentRole)) {
      setErrorMsg("Accès refusé.");
      return false;
    }

    if (!form.full_name.trim()) {
      setErrorMsg("Le nom complet est requis.");
      return false;
    }

    if (!form.email.trim()) {
      setErrorMsg("L'email est requis.");
      return false;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) {
      setErrorMsg("Adresse email invalide.");
      return false;
    }

    if (form.username.trim()) {
      const usernameOk = /^[a-zA-Z0-9._-]{3,20}$/.test(form.username.trim());
      if (!usernameOk) {
        setErrorMsg(
          "Le username doit contenir 3 à 20 caractères : lettres, chiffres, point, tiret ou underscore."
        );
        return false;
      }
    }

    if (!form.password || form.password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }

    const selectedAllowed = allowedRoles.some((r) => r.value === form.role);
    if (!selectedAllowed) {
      setErrorMsg("Vous n'êtes pas autorisé à créer ce type d'utilisateur.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      username: "",
      password: "",
      role: allowedRoles[0]?.value || "student",
    });
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };

      if (form.username.trim()) {
        payload.username = form.username.trim().toLowerCase();
      }

      await api.post("/admin/users", payload);

      setSuccessMsg("Utilisateur créé avec succès.");
      resetForm();
    } catch (error) {
      console.error("Erreur création utilisateur:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Échec de la création de l'utilisateur.";

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  if (!["admin", "superadmin"].includes(currentRole)) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-3">Accès refusé</h1>
          <p className="text-gray-600 mb-5">
            Vous n’avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div className="flex gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Retour à l’accueil
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ajouter un utilisateur
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentRole === "superadmin"
                  ? "Le super administrateur peut créer des étudiants, des formateurs et des administrateurs."
                  : "L’administrateur peut créer uniquement des étudiants et des formateurs."}
              </p>
            </div>

            <Link
              to="/admin"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom complet
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Ex. Jean Claude Ndayizeye"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Le backend découpera automatiquement le nom complet en prénom et nom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="exemple@harvestcentertd.org"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Optionnel"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optionnel. 3 à 20 caractères autorisés.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                {allowedRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caractères"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-28 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Création en cours..." : "Créer l’utilisateur"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}