// src/components/Footer.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Facebook,
  Linkedin,
  Instagram,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: "https://www.facebook.com/harvestcentertd",
      label: t("footer.social.facebook", { defaultValue: "Facebook" }),
      icon: Facebook,
    },
    {
      href: "https://www.linkedin.com/company/harvestcentertd",
      label: t("footer.social.linkedin", { defaultValue: "LinkedIn" }),
      icon: Linkedin,
    },
    {
      href: "https://www.instagram.com/harvestcentertd",
      label: t("footer.social.instagram", { defaultValue: "Instagram" }),
      icon: Instagram,
    },
    {
      href: "https://wa.me/23566680200",
      label: t("footer.social.whatsapp", { defaultValue: "WhatsApp" }),
      icon: MessageCircle,
    },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14">
        <div className="grid items-start gap-10 text-center md:grid-cols-4 md:text-left">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/images/logo-harvest1.jpg"
                alt={t("footer.logoAlt", { defaultValue: "Harvest Center" })}
                className="mx-auto h-16 w-auto object-contain md:mx-0 md:h-20"
              />
            </Link>

            <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/75 md:mx-0">
              {t("footer.tagline", {
                defaultValue:
                  "Harvest Center, votre partenaire de confiance pour la formation et les langues.",
              })}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
              {t("footer.navigationTitle", { defaultValue: "Navigation" })}
            </h3>
            <ul className="space-y-3 text-sm text-white/75">
              <li>
                <Link to="/about" className="transition hover:text-white">
                  {t("footer.links.about", { defaultValue: "À propos" })}
                </Link>
              </li>
              <li>
                <Link to="/courses" className="transition hover:text-white">
                  {t("footer.links.courses", { defaultValue: "Formations" })}
                </Link>
              </li>
              <li>
                <a href="/#why-us" className="transition hover:text-white">
                  {t("footer.links.why", { defaultValue: "Pourquoi nous" })}
                </a>
              </li>
              <li>
                <Link to="/opportunites" className="transition hover:text-white">
                  {t("footer.links.scholarships", {
                    defaultValue: "Opportunités",
                  })}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-white">
                  {t("footer.links.contact", { defaultValue: "Contact" })}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90 mb-4">
              {t("footer.contactTitle", { defaultValue: "Contact" })}
            </h3>

            <div className="space-y-3 text-sm text-white/75 leading-7">
              <p>{t("footer.headOffice")}</p>
              <p>{t("footer.representation")}</p>
              <p>
                {t("footer.emailLabel")} {t("site.email")}
              </p>
              <p>
                {t("footer.phoneLabel")} {t("site.phone")}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
              {t("footer.socialTitle", { defaultValue: "Réseaux sociaux" })}
            </h3>

            <div className="flex justify-center gap-3 md:justify-start">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition hover:bg-white hover:text-slate-900"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <p className="mt-5 text-sm leading-7 text-white/65">
              {t("footer.socialText", {
                defaultValue:
                  "Suivez Harvest Center pour découvrir les nouvelles formations, opportunités et actualités.",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-sm text-white/70 md:flex-row md:text-left">
            <span>
              © {currentYear}{" "}
              {t("footer.brandName", { defaultValue: "Harvest Center" })}.{" "}
              {t("footer.rights", {
                defaultValue: "Tous droits réservés.",
              })}
            </span>

            <a
              href="https://votre-site.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium text-white transition hover:text-sky-300"
            >
              {t("footer.credit", {
                defaultValue: "Créé par Dobingar Guiryambaye Vincent",
              })}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}