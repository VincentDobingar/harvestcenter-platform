// src/pages/auth/Account.jsx
// Page de connexion unique pour tous les rôles (étudiant, formateur,
// admin, superadmin). Après connexion, chacun est envoyé vers son espace.
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Mail, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/layouts/AuthLayout";
import PageLoader from "@/components/ui/PageLoader";

const EMPTY_FORM = { email: "", password: "", first_name: "", last_name: "" };

function Field({ id, label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-mist">{hint}</p>}
    </div>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const { user, booting, login, register, gotoByRole } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isRegisterPath = location.pathname === "/register";
  const [isLogin, setIsLogin] = useState(
    !isRegisterPath && searchParams.get("tab") !== "register"
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLogin(!isRegisterPath && searchParams.get("tab") !== "register");
  }, [searchParams, isRegisterPath]);

  // Déjà connecté : on renvoie directement vers son espace.
  useEffect(() => {
    if (!booting && user) {
      const from = location.state?.from?.pathname;
      if (from && !["/account", "/login", "/register"].includes(from)) nav(from, { replace: true });
      else gotoByRole(user, nav);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to session changes
  }, [booting, user]);

  function switchTab(loginMode) {
    setError("");
    setShowHelp(false);
    setIsLogin(loginMode);
    setSearchParams(loginMode ? { tab: "login" } : { tab: "register" });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const email = form.email.trim();
    if (!email || !form.password.trim() || (!isLogin && (!form.first_name.trim() || !form.last_name.trim()))) {
      setError(t("accountPage.errors.required", { defaultValue: "Remplissez tous les champs." }));
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const loggedUser = await login(email.toLowerCase(), form.password);
        toast.success(t("accountPage.success.login", { defaultValue: "Connexion réussie" }));

        const next = location.state?.next || location.state?.from?.pathname;
        if (next && next !== "/account" && next !== "/login") {
          nav(next, { replace: true });
        } else {
          gotoByRole(loggedUser, nav);
        }
      } else {
        await register({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email,
          password: form.password,
          role: "student",
        });
        toast.success(
          t("accountPage.success.registered", {
            defaultValue: "Compte créé. Vous pouvez maintenant vous connecter.",
          })
        );
        setForm((prev) => ({ ...EMPTY_FORM, email: prev.email }));
        switchTab(true);
      }
    } catch (err) {
      const status = err?.response?.status;
      let message = err?.response?.data?.message;

      if (!message && err?.code === "ERR_NETWORK") {
        message = t("accountPage.errors.networkNew", {
          defaultValue: "Le serveur ne répond pas. Vérifiez votre connexion et réessayez.",
        });
      }
      if (status === 401 && isLogin) {
        message = t("accountPage.errors.invalid", {
          defaultValue: "Email ou mot de passe incorrect.",
        });
      }
      if (status === 409) {
        message = t("accountPage.errors.emailTaken", {
          defaultValue: "Un compte existe déjà avec cet email. Connectez-vous.",
        });
      }

      setError(message || err?.message || t("accountPage.errors.failed", { defaultValue: "La connexion a échoué." }));
    } finally {
      setLoading(false);
    }
  }

  if (booting) return <PageLoader />;

  return (
    <AuthLayout>
      <div>
        <h2 className="font-display text-[1.9rem] font-semibold leading-tight text-ink">
          {isLogin
            ? t("accountPage.heading.login", { defaultValue: "Connexion" })
            : t("accountPage.heading.register", { defaultValue: "Créer un compte étudiant" })}
        </h2>
        <p className="mt-2 text-[15px] text-mist">
          {isLogin
            ? t("accountPage.sub.login", { defaultValue: "Entrez l’email et le mot de passe de votre compte Harvest Center." })
            : t("accountPage.sub.register", {
                defaultValue: "Les comptes formateurs et administratifs sont créés par l’administration.",
              })}
        </p>
      </div>

      <div
        role="tablist"
        aria-label={t("accountPage.tabs.label", { defaultValue: "Choisir une action" })}
        className="mt-7 grid grid-cols-2 rounded-xl bg-white p-1 ring-1 ring-line"
      >
        {[
          { mode: true, label: t("accountPage.tabs.login", { defaultValue: "Se connecter" }) },
          { mode: false, label: t("accountPage.tabs.register", { defaultValue: "Créer un compte" }) },
        ].map((tab) => (
          <button
            key={String(tab.mode)}
            type="button"
            role="tab"
            aria-selected={isLogin === tab.mode}
            onClick={() => switchTab(tab.mode)}
            className={`focus-ring rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isLogin === tab.mode ? "bg-ink text-white" : "text-mist hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {!isLogin && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="first_name" label={t("accountPage.fields.firstName", { defaultValue: "Prénom" })}>
              <input id="first_name" name="first_name" autoComplete="given-name" value={form.first_name} onChange={handleChange} className="field" />
            </Field>
            <Field id="last_name" label={t("accountPage.fields.lastName", { defaultValue: "Nom" })}>
              <input id="last_name" name="last_name" autoComplete="family-name" value={form.last_name} onChange={handleChange} className="field" />
            </Field>
          </div>
        )}

        <Field id="email" label={t("accountPage.fields.email", { defaultValue: "Email" })}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={handleChange}
            className="field"
            placeholder="nom@exemple.com"
          />
        </Field>

        <Field
          id="password"
          label={t("accountPage.fields.password", { defaultValue: "Mot de passe" })}
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={form.password}
              onChange={handleChange}
              className="field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={
                showPwd
                  ? t("accountPage.fields.hidePassword", { defaultValue: "Masquer le mot de passe" })
                  : t("accountPage.fields.showPassword", { defaultValue: "Afficher le mot de passe" })
              }
              className="focus-ring absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-mist hover:text-ink"
            >
              {showPwd ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </Field>

        {error && (
          <p role="alert" className="rounded-xl border border-bad/25 bg-bad/5 px-4 py-3 text-sm text-bad">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary focus-ring w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? isLogin
              ? t("accountPage.actions.loggingIn", { defaultValue: "Connexion…" })
              : t("accountPage.actions.creatingAccount", { defaultValue: "Création du compte…" })
            : isLogin
            ? t("accountPage.actions.login", { defaultValue: "Se connecter" })
            : t("accountPage.actions.createAccount", { defaultValue: "Créer mon compte" })}
        </button>
      </form>

      {isLogin && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowHelp((s) => !s)}
            aria-expanded={showHelp}
            className="focus-ring rounded text-sm font-medium text-brand hover:text-brand-800"
          >
            {t("accountPage.forgot.toggle", { defaultValue: "Mot de passe oublié ?" })}
          </button>

          {showHelp && (
            <div className="mt-3 rounded-xl border border-millet/40 bg-millet-soft px-4 py-3 text-sm text-ink">
              <p>
                {t("accountPage.forgot.body", {
                  defaultValue: "L’administration réinitialise votre mot de passe. Écrivez-nous avec l’email de votre compte :",
                })}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                <a className="inline-flex items-center gap-1.5 font-medium underline-offset-2 hover:underline" href="mailto:contact@harvestcentertd.org">
                  <Mail className="h-4 w-4" /> contact@harvestcentertd.org
                </a>
                <a
                  className="inline-flex items-center gap-1.5 font-medium underline-offset-2 hover:underline"
                  href="https://wa.me/23566680200"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
