// src/components/BoursePromotion.jsx

import React, { useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import { CalendarDays, MapPin, Users, ExternalLink, ChevronDown } from "lucide-react";

/**
 * Section promotion / appel à candidatures
 * - style bandeau brand “cdotchad-like”
 * - bouton “Candidater” (nouvel onglet)
 * - option “Remplir ici” qui affiche le Google Form en <iframe>
 *
 * Images à prévoir (ou change le chemin) :
 *   /public/images/bourses/promo.jpg
 */
export default function BoursePromotion({
  title = "Bourse Réussir Bé Gou",
  sponsor = "Harvest Center",
  description = "Appel à candidatures pour une bourse de formation en langues. Cursus flexibles, mentorat et suivi.",
  location = "N’Djamena",
  quota = "Places limitées",
  deadline = "2025-10-15", // YYYY-MM-DD
  formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfnI4Z45j_mQko2i1njdWv9B12OL0ea_KWbxQ3-LvpoX1LVEQ/viewform?pli=1",
  cover = "/images/bourses/promo.jpg",
}) {
  // “embed=true” pour un rendu intégré
  const embedUrl = useMemo(() => {
    if (!formUrl) return null;
    // insère embedded=true même si une query existe déjà
    if (formUrl.includes("/viewform") && !formUrl.includes("embedded=true")) {
      const [base, q = ""] = formUrl.split("?");
      const hasQuery = q.length > 0;
      return `${base}?embedded=true${hasQuery ? "&" + q : ""}`;
    }
    return formUrl;
  }, [formUrl]);

  const [showEmbed, setShowEmbed] = useState(false);

  const d = useMemo(() => new Date(deadline), [deadline]);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((d - now) / (1000 * 60 * 60 * 24)));
  const deadlineLabel = d.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Section
      id="promotion"
      title="Promotion"
      subtitle="Appels à candidatures & bourses en cours."
      centered
    >
      {/* Bandeau */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-700">
        {/* halos */}
        <div aria-hidden className="absolute -top-20 -right-24 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -left-24 w-[24rem] h-[24rem] rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch p-6 md:p-10">
          {/* Colonne gauche */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-white/10 border border-white/15 rounded-full px-3 py-1 backdrop-blur-sm">
              {sponsor}
            </div>

            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold leading-tight !text-white">
              {title}
            </h2>

            <p className="mt-3 text-white/90">{description}</p>

            {/* Infos clés */}
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <li className="flex items-center gap-2 text-white/95">
                <CalendarDays className="w-5 h-5" />
                <span>
                  <span className="font-semibold">Date limite :</span> {deadlineLabel}
                </span>
              </li>
              <li className="flex items-center gap-2 text-white/95">
                <MapPin className="w-5 h-5" />
                <span>{location}</span>
              </li>
              <li className="flex items-center gap-2 text-white/95">
                <Users className="w-5 h-5" />
                <span>{quota}</span>
              </li>
            </ul>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={formUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-brand font-semibold px-5 py-2.5 hover:bg-white/90 transition"
              >
                Candidater maintenant <ExternalLink className="w-4 h-4" />
              </a>
              {embedUrl && (
                <button
                  type="button"
                  onClick={() => setShowEmbed((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/80 text-white px-5 py-2.5 font-semibold hover:bg-white/10 transition"
                >
                  Remplir ici
                  <ChevronDown className={`w-4 h-4 transition ${showEmbed ? "rotate-180" : ""}`} />
                </button>
              )}
              {daysLeft <= 10 && (
                <span className="badge-brand bg-white/15 text-white border border-white/30">
                  {daysLeft === 0 ? "Dernier jour" : `Plus que ${daysLeft} jour(s)`}
                </span>
              )}
            </div>
          </div>

          {/* Colonne droite : visuel */}
          <div className="bg-white rounded-2xl shadow-2xl border border-brand/20 p-3 md:p-4">
            <div className="overflow-hidden rounded-xl aspect-[5/4] bg-gray-100">
              <img
                src={cover}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="px-2 md:px-1 py-3 text-sm text-gray-600">
              Candidatures en ligne. Sélection sur dossier & motivation.
            </p>
          </div>
        </div>

        {/* Iframe Google Form (optionnel) */}
        {showEmbed && embedUrl && (
          <div className="relative border-t border-white/15">
            <iframe
              title="Formulaire de candidature"
              src={embedUrl}
              className="w-full h-[1200px] md:h-[1100px] lg:h-[1000px] border-0"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
