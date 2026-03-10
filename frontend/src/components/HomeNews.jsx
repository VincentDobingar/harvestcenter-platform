// 📁 src/components/HomeNews.jsx

import React from "react";
import Section from "@/components/ui/Section";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const news = [
  {
    id: 1,
    title: "Ouverture des sessions intensives d’anglais",
    excerpt:
      "De nouvelles cohortes démarrent en octobre. Horaires flexibles : matin, soir et week-end.",
    image: "/images/news/harvest-class.jpg",
    date: "2025-09-01",
  },
  {
    id: 2,
    title: "Atelier HSK – préparation mandarin",
    excerpt:
      "Un atelier dédié aux techniques d’examen HSK niveau 1–3, animé par nos formateurs.",
    image: "/images/news/mandarin.jpg",
    date: "2025-08-22",
  },
  {
    id: 3,
    title: "Bourses internes Harvest Center",
    excerpt:
      "Un programme de bourses partielles pour apprenants motivés. Candidatures ouvertes.",
    image: "/images/news/bourse.jpg",
    date: "2025-08-10",
  },
  {
    id: 4,
    title: "Cours de conversation – club du samedi",
    excerpt:
      "Rejoignez le club de conversation pour pratiquer en conditions réelles.",
    image: "/images/news/club.jpg",
    date: "2025-07-29",
  },
  {
    id: 5,
    title: "Signature d'accord de partenariat",
    excerpt:
      "Nous, nous rejouissons de l'accord de partenariat signé entre Harvest Center et Job Booster Tchad.",
    image: "/images/news/harvest-center5.jpg",
    date: "2025-07-29",
  },
];

export default function HomeNews() {
  return (
    <Section
      id="news"
      title="Actualités récentes"
      subtitle="Les annonces, ateliers et informations du Harvest Center."
      centered
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 2 } }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        className="max-w-6xl"
      >
        {news.map((n) => (
          <SwiperSlide key={n.id}>
            <article className="bg-white rounded-2xl shadow p-4 md:p-6 h-full flex gap-5 border border-transparent hover:border-brand/30">
              <div className="w-40 h-28 md:w-60 md:h-40 rounded-xl overflow-hidden shrink-0">
                <img
                  src={n.image}
                  alt={n.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">{n.date}</div>
                <h3 className="mt-1 text-lg font-semibold text-brand">
                  {n.title}
                </h3>
                <p className="text-gray-600 mt-1 line-clamp-3">{n.excerpt}</p>
                <Link to={n.to} className="mt-2 inline-block link-brand">
                  Lire la suite →
                </Link>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="text-center mt-6">
        <Link to="/actualites" className="btn-brand">
          Voir toutes les actualités
        </Link>
      </div>
    </Section>
  );
}