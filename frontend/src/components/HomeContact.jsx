// src/components/HomeContact.jsx
import Section from "@/components/ui/Section";
import { Phone, MapPin, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InfoCard({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-blue-700" />
      </div>
      <div className="text-slate-700 leading-7">{children}</div>
    </li>
  );
}

export default function HomeContact({ showForm = true }) {
  const { t } = useTranslation();

  return (
    <Section
      id="contact"
      title={t("home.contact.title", { defaultValue: "Contactez-nous" })}
      subtitle={t("home.contact.subtitle", {
        defaultValue:
          "Nous sommes à votre écoute pour toute question sur nos formations, inscriptions et partenariats.",
      })}
    >
      <div
        className={
          showForm
            ? "grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
            : "max-w-3xl"
        }
      >
        <div className="space-y-6">
          <ul className="space-y-4">
            <InfoCard icon={MapPin}>{t("site.address")}</InfoCard>
            <InfoCard icon={Phone}>{t("site.phone")}</InfoCard>
            <InfoCard icon={Mail}>{t("site.email")}</InfoCard>
          </ul>

          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
            <iframe
              title={t("home.contact.mapTitle", {
                defaultValue: "Localisation de Harvest Center",
              })}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62813.926434637826!2d15.0000!3d12.1000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA2JzAwLjAiTiAxNcKwMDAnMDAuMCJF!5e0!3m2!1sfr!2std!4v1234567890"
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>

        {showForm && (
          <div className="bg-gradient-to-br from-blue-700 to-sky-600 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.35)]">
              {t("home.contact.bannerTitle", {
                defaultValue: "Prêt à rejoindre Harvest Center ?",
              })}
            </h3>

            <p className="mt-4 text-white/95 leading-8 text-base md:text-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
              {t("home.contact.bannerText", {
                defaultValue:
                  "Déposez votre demande d’inscription et découvrez nos formations linguistiques adaptées à votre projet.",
              })}
            </p>

            <div className="mt-6 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/images/inscription-banner.png"
                alt={t("home.contact.bannerAlt", {
                  defaultValue: "Bannière d’inscription Harvest Center",
                })}
                className="w-full h-56 object-cover"
              />
            </div>

            <div className="mt-6">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 px-6 py-3 font-semibold hover:bg-slate-100 transition"
              >
                {t("home.contact.cta", {
                  defaultValue: "Faire une demande d’inscription",
                })}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}