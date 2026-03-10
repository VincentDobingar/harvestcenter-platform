// 📁 src/components/HomeHero.jsx
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Play } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

/**
 * Hero avec diaporama (style cdotchad)
 * - Colonne gauche : message + puces + CTAs
 * - Colonne droite : carte avec slideshow (3–4 images)
 *
 * ➜ Place tes images dans /public/images/hero/{1.jpg,2.jpg,3.jpg,4.jpg}
 */
const HERO_SLIDES = [
  "/images/hero/students.jpg",
  "/images/hero/students2.jpg",
  "/images/hero/students3.jpg",
  "/images/hero/students1.jpg", // optionnel : retire si tu n'en veux que 3
].filter(Boolean);

const bullets = [
  "Groupes réduits & suivi personnalisé",
  "Horaires flexibles (intensif, soir, week-end)",
  "Préparation TOEFL / IELTS / HSK / TCF",
];

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fond : dégradé brand + halos doux */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-700" />
      <div aria-hidden className="absolute -top-24 -right-24 w-[36rem] h-[36rem] rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />

      {/* Contenu */}
      <div className="relative max-w-7xl mx-auto px-4 pt-16 md:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Colonne gauche */}
          <div className="text-white">
            <span className="inline-flex items-center gap-2 text-xs font-semibold bg-white/10 border border-white/15 rounded-full px-3 py-1 backdrop-blur-sm">
              Language • Culture • Education
            </span>

            <h1
                className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight
                          !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
              >
              Maîtrisez les langues qui ouvrent des portes
            </h1>

            <p className="mt-4 text-white/90 md:text-lg max-w-2xl">
              Anglais, Chinois, Espagnol, Français — des programmes progressifs,
              certifiants et adaptés à votre rythme, animés par des formateurs expérimentés.
            </p>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-white" />
                  <span className="text-white/90">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/inscription"
                className="inline-flex items-center justify-center rounded-xl bg-white text-brand font-semibold px-5 py-2.5 hover:bg-white/90 transition"
              >
                S’inscrire maintenant
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-xl border border-white/80 text-white px-5 py-2.5 font-semibold hover:bg-white/10 transition"
              >
                Voir les formations
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 text-white/90 hover:text-white">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/70">
                  <Play className="w-4 h-4" />
                </span>
                Découvrir le centre
              </Link>
            </div>
          </div>

          {/* Colonne droite : carte avec diaporama */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-3 md:p-4 border border-brand/20">
              <div className="overflow-hidden rounded-2xl aspect-[5/4] bg-gray-100">
                <Swiper
                  modules={[Autoplay, Pagination, EffectFade]}
                  autoplay={{ delay: 3200, disableOnInteraction: false }}
                  loop
                  effect="fade"
                  speed={900}
                  pagination={{ clickable: true }}
                  className="h-full"
                >
                  {HERO_SLIDES.map((src, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={src}
                        alt={`Visuel Hero ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="px-3 md:px-4 py-3">
                <p className="text-sm text-gray-600">
                  Des cohortes régulières, des ateliers ciblés et un accompagnement jusqu’à la certification.
                </p>
              </div>
            </div>

            {/* Badge flottant */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl px-3 py-2 shadow border border-brand/20">
              <p className="text-xs font-semibold text-brand">+1 500 apprenants</p>
              <p className="text-[11px] text-gray-500 -mt-0.5">depuis 2018</p>
            </div>
          </div>
        </div>

        {/* Ruban de stats */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { k: "Taux de satisfaction", v: "98%" },
            { k: "Certifications obtenues", v: "850+" },
            { k: "Partenaires & ONG", v: "15+" },
          ].map((s) => (
            <div key={s.k} className="bg-white rounded-2xl shadow p-4 text-center border border-brand/20">
              <div className="text-2xl font-extrabold text-brand">{s.v}</div>
              <div className="text-xs text-gray-600 mt-1">{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
