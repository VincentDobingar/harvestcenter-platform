// 📁 src/components/HomeTestimonial.jsx
import Section from "@/components/ui/Section";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Quote, Star } from "lucide-react";

// ➜ Remplace les chemins par tes vraies images dans /public/images/testimonials/
const testimonials = [
  {
    name: "Amina Idriss",
    role: "IELTS 7.0",
    photo: "/images/testimonials/amina.png",
    text:
      "J’ai obtenu mon IELTS 7.0 grâce aux cours du soir. La méthode est très pratique et centrée sur l’oral.",
    rating: 5,
  },
  {
    name: "Mahamat Saleh",
    role: "Business English",
    photo: "/images/testimonials/mahamat.jpg",
    text:
      "Cours orientés métier, ça m’a aidé au travail dès la 1ère semaine. Groupes réduits = progression rapide.",
    rating: 5,
  },
  {
    name: "Sonia Nd.",
    role: "HSK (Mandarin)",
    photo: "/images/testimonials/sonia.png",
    text:
      "Très bon accompagnement pour HSK. Les formateurs sont disponibles, on pratique vraiment la langue.",
    rating: 4,
  },
  {
    name: "Ousmane T.",
    role: "Espagnol A2→B1",
    photo: "/images/testimonials/yacinth.png",
    text:
      "Horaires flexibles (week-end), parfait pour moi. Les supports sont clairs et variés.",
    rating: 4,
  },
];

function Stars({ n = 5 }) {
  return (
    <div className="flex gap-1" aria-label={`Note ${n} sur 5`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < n ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function Avatar({ src, alt }) {
  const fallback = "/images/testimonials/default-avatar.jpg"; // ➜ ajoute ce fichier dans public
  const onError = (e) => {
    if (e.currentTarget.src.endsWith("default-avatar.jpg")) return;
    e.currentTarget.src = fallback;
  };
  return (
    <img
      src={src}
      alt={alt}
      onError={onError}
      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-white shadow"
      loading="lazy"
    />
  );
}

function TestimonialCard({ t }) {
  return (
    <article className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden border border-transparent hover:border-brand/30">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar src={t.photo} alt={t.name} />
          <div>
            {/* titre harmonisé : bleu du logo */}
            <h3 className="text-base md:text-lg font-semibold text-brand">
              {t.name}
            </h3>
            <p className="text-sm text-gray-500">{t.role}</p>
            <Stars n={t.rating} />
          </div>
          {/* icône citation teinte brand douce */}
          <Quote className="ml-auto w-6 h-6 text-brand/20" />
        </div>
        <p className="mt-4 text-gray-700 leading-relaxed">“{t.text}”</p>
      </div>
    </article>
  );
}

export default function HomeTestimonial() {
  return (
    <Section
      id="temoignages"
      title="Ils nous recommandent"
      subtitle="La meilleure preuve de la qualité, ce sont les résultats de nos apprenants."
      centered
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
        className="!pb-8"
      >
        {testimonials.map((t, i) => (
          <SwiperSlide key={i}>
            <TestimonialCard t={t} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}
