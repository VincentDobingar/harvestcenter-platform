// src/components/HomeContact.jsx
import Section from "@/components/ui/Section";
import { Phone, MapPin, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InfoCard({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-millet-soft flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-ink" />
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
          <div className="relative overflow-hidden bg-ink rounded-[28px] p-8 md:p-10 text-white">
            <div aria-hidden="true" className="woven absolute inset-y-0 right-0 w-2.5" />
            <h3 className="font-display text-[2rem] md:text-[2.4rem] font-semibold leading-tight !text-white">
              {t("home.contact.bannerTitle", {
                defaultValue: "Prêt à rejoindre Harvest Center ?",
              })}
            </h3>

            <p className="mt-4 text-white/75 leading-8 text-base md:text-[17px]">
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
                className="inline-flex items-center gap-2 rounded-full bg-millet text-ink px-6 py-3 font-semibold hover:bg-[#f0b743] transition"
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