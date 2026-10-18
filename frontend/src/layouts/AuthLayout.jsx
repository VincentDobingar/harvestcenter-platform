// src/layouts/AuthLayout.jsx
// Cadre commun de la page de connexion : photo du centre à gauche,
// formulaire à droite. Utilisé pour tous les rôles.
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }) {
  const { t } = useTranslation();

  return (
    <div className="app-ui min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Panneau visuel */}
      <aside className="relative isolate overflow-hidden bg-ink text-white">
        <img
          src="/images/hero/students2.jpg"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
        <div className="woven absolute inset-y-0 right-0 hidden w-1.5 lg:block" aria-hidden="true" />
        <div className="woven-x absolute inset-x-0 bottom-0 h-1.5 lg:hidden" aria-hidden="true" />

        <div className="flex h-full flex-col px-6 py-6 sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
          <div className="flex items-center justify-between">
            <Link to="/" className="focus-ring flex items-center gap-3 rounded-lg">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white">
                <img src="/images/logo-harvest.jpg" alt="" className="h-full w-full object-contain" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-lg font-semibold">Harvest Center</span>
                <span className="block text-xs text-white/70">
                  {t("authLayout.tagline", { defaultValue: "Langues · Culture · Éducation" })}
                </span>
              </span>
            </Link>

            <Link
              to="/"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-white/80 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("authLayout.backToSite", { defaultValue: "Retour au site" })}
              </span>
            </Link>
          </div>

          <div className="mt-10 max-w-md pb-8 lg:mt-auto lg:pb-0">
            <h1 className="font-display text-3xl font-semibold leading-[1.1] text-white sm:text-4xl lg:text-[2.9rem]">
              {t("authLayout.headline", { defaultValue: "Un seul accès pour toute l’école." })}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              {t("authLayout.lead", {
                defaultValue:
                  "Étudiants, formateurs et équipe administrative se connectent ici. Votre espace s’ouvre selon votre rôle.",
              })}
            </p>

            <dl className="mt-8 hidden gap-x-8 gap-y-3 text-sm text-white/75 sm:grid sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-millet">{t("authLayout.roles.student", { defaultValue: "Étudiants" })}</dt>
                <dd>{t("authLayout.roles.studentDesc", { defaultValue: "Cours, devoirs, notes" })}</dd>
              </div>
              <div>
                <dt className="font-semibold text-millet">{t("authLayout.roles.teacher", { defaultValue: "Formateurs" })}</dt>
                <dd>{t("authLayout.roles.teacherDesc", { defaultValue: "Classes, leçons, suivi" })}</dd>
              </div>
              <div>
                <dt className="font-semibold text-millet">{t("authLayout.roles.admin", { defaultValue: "Administration" })}</dt>
                <dd>{t("authLayout.roles.adminDesc", { defaultValue: "Inscriptions, paiements" })}</dd>
              </div>
            </dl>
          </div>
        </div>
      </aside>

      {/* Formulaire */}
      <main className="flex items-start justify-center px-5 py-10 sm:px-8 lg:items-center lg:py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
