// src/components/Footer.jsx
// Pied de page du site public : appel à l'action, plan du site,
// coordonnées cliquables, réseaux sociaux et crédit.
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Facebook, Linkedin, Instagram, MessageCircle, ArrowUpRight, ArrowRight, ArrowUp, MapPin, Phone, Mail } from "lucide-react";

const PHONES = [
  { label: "+235 66 68 02 00", href: "tel:+23566680200" },
  { label: "+235 99 40 20 89", href: "tel:+23599402089" },
];

function FooterLink({ to, href, children }) {
  const cls = "inline-flex text-[15px] text-white/70 transition hover:translate-x-0.5 hover:text-white focus-ring rounded";
  return (
    <li>
      {to ? (
        <Link to={to} className={cls}>
          {children}
        </Link>
      ) : (
        <a href={href} className={cls}>
          {children}
        </a>
      )}
    </li>
  );
}

function ColumnTitle({ children }) {
  return <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.2em] !text-millet">{children}</h3>;
}

export default function Footer() {
  const { t, i18n } = useTranslation();
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");
  const year = new Date().getFullYear();

  const social = [
    { href: "https://www.facebook.com/harvestcentertd", label: t("footer.social.facebook", { defaultValue: "Facebook" }), icon: Facebook },
    { href: "https://www.linkedin.com/company/harvestcentertd", label: t("footer.social.linkedin", { defaultValue: "LinkedIn" }), icon: Linkedin },
    { href: "https://www.instagram.com/harvestcentertd", label: t("footer.social.instagram", { defaultValue: "Instagram" }), icon: Instagram },
    { href: "https://wa.me/23566680200", label: t("footer.social.whatsapp", { defaultValue: "WhatsApp" }), icon: MessageCircle },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="woven-x absolute inset-x-0 top-0 h-1.5" />
      <div aria-hidden="true" className="absolute -right-40 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-48 -left-40 -z-10 h-[26rem] w-[26rem] rounded-full bg-millet/10 blur-3xl" />

      {/* Appel à l'action */}
      <div className="mx-auto max-w-7xl px-4 pt-16 md:pt-20">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-millet">
              <span aria-hidden="true" className="h-px w-8 bg-millet" />
              {en ? "Next session" : "Prochaine session"}
            </p>
            <h2 className="mt-4 font-display text-[2.1rem] font-semibold leading-[1.08] !text-white md:text-[2.9rem]">
              {en ? "Ready to speak a new language?" : "Prêt à parler une nouvelle langue ?"}
            </h2>
            <p className="mt-4 text-[17px] leading-8 text-white/70">
              {en
                ? "Send your registration request in a few minutes, or talk to our team about the right course for you."
                : "Envoyez votre demande d’inscription en quelques minutes, ou parlez à notre équipe de la formation qui vous convient."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/inscription"
              className="group inline-flex items-center gap-2 rounded-full bg-millet px-7 py-3.5 font-semibold text-ink transition hover:bg-[#f0b743] focus-ring"
            >
              {en ? "Register" : "S’inscrire"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-semibold text-white transition hover:border-white/60 hover:bg-white/10 focus-ring"
            >
              {en ? "Contact us" : "Nous contacter"}
            </Link>
          </div>
        </div>
      </div>

      {/* Colonnes */}
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 focus-ring rounded-xl">
            <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white p-1">
              <img src="/images/logo-harvest.jpg" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-xl font-semibold">{t("footer.brandName", { defaultValue: "Harvest Center" })}</span>
              <span className="block text-[13px] text-white/60">{en ? "Language · Culture · Education" : "Langues · Culture · Éducation"}</span>
            </span>
          </Link>
          <p className="mt-6 max-w-xs text-[15px] leading-7 text-white/70">
            {t("footer.tagline", { defaultValue: "Former et accompagner les talents grâce aux langues et à la communication." })}
          </p>
          <ul className="mt-7 flex gap-2.5" aria-label={t("footer.socialTitle", { defaultValue: "Réseaux sociaux" })}>
            {social.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-millet hover:bg-millet hover:text-ink focus-ring"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={t("footer.navigationTitle", { defaultValue: "Navigation" })}>
          <ColumnTitle>{en ? "The centre" : "Le centre"}</ColumnTitle>
          <ul className="space-y-3">
            <FooterLink to="/about">{t("footer.links.about", { defaultValue: "Présentation" })}</FooterLink>
            <FooterLink to="/equipe">{en ? "Our team" : "Notre équipe"}</FooterLink>
            <FooterLink href="/#why-us">{t("footer.links.why", { defaultValue: "Pourquoi nous choisir ?" })}</FooterLink>
            <FooterLink to="/galerie">{en ? "Gallery" : "Galerie"}</FooterLink>
            <FooterLink to="/contact">{t("footer.links.contact", { defaultValue: "Contact" })}</FooterLink>
          </ul>
        </nav>

        <nav aria-label={en ? "Courses and news" : "Formations et actualités"}>
          <ColumnTitle>{en ? "Learn" : "Apprendre"}</ColumnTitle>
          <ul className="space-y-3">
            <FooterLink to="/courses">{t("footer.links.courses", { defaultValue: "Formations" })}</FooterLink>
            <FooterLink to="/actualites">{en ? "News" : "Actualités"}</FooterLink>
            <FooterLink to="/opportunites">{t("footer.links.scholarships", { defaultValue: "Opportunités" })}</FooterLink>
            <FooterLink to="/inscription">{en ? "Registration" : "Inscription"}</FooterLink>
            <FooterLink to="/account?tab=login">{en ? "Student & staff sign-in" : "Espace étudiants et équipe"}</FooterLink>
          </ul>
        </nav>

        <div>
          <ColumnTitle>{t("footer.contactTitle", { defaultValue: "Contact" })}</ColumnTitle>
          <ul className="space-y-4 text-[15px] text-white/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-millet" />
              <span>
                <span className="block text-white">{en ? "Head office, N’Djamena" : "Siège, N’Djamena"}</span>
                <span className="block text-white/60">{en ? "Chagoua, near Taradona market" : "Chagoua, non loin du marché Taradona"}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-millet" />
              <span>
                <span className="block text-white">{en ? "Office, Sarh" : "Représentation, Sarh"}</span>
                <span className="block text-white/60">{en ? "Avenue Kaskanaye, opposite Radio Sarh" : "Avenue Kaskanaye, en face de Radio Sarh"}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-millet" />
              <span className="flex flex-col">
                {PHONES.map((p) => (
                  <a key={p.href} href={p.href} className="tabular-nums transition hover:text-white focus-ring rounded">
                    {p.label}
                  </a>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-millet" />
              <a href={`mailto:${t("site.email", { defaultValue: "contact@harvestcentertd.org" })}`} className="break-all transition hover:text-white focus-ring rounded">
                {t("site.email", { defaultValue: "contact@harvestcentertd.org" })}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas de page */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {t("footer.brandName", { defaultValue: "Harvest Center" })}. {t("footer.rights", { defaultValue: "Tous droits réservés." })}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="https://dbs-africa.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 font-medium text-white/85 transition hover:text-millet focus-ring rounded"
            >
              {t("footer.credit", { defaultValue: "Entièrement créé par Digital Business Services Africa" })}
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-white/75 transition hover:border-white/40 hover:text-white focus-ring"
            >
              <ArrowUp className="h-4 w-4" />
              {en ? "Back to top" : "Haut de page"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
