// src/components/HomeTestimonial.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Quote, Star, MessageSquareQuote } from "lucide-react";

const testimonials = [
  {
    name: "Amina Idriss",
    key: "amina",
    photo: "/images/testimonials/amina.png",
    rating: 5,
  },
  {
    name: "Mahamat Saleh",
    key: "mahamat",
    photo: "/images/testimonials/mahamat.jpg",
    rating: 5,
  },
  {
    name: "Sonia Nd.",
    key: "sonia",
    photo: "/images/testimonials/sonia.png",
    rating: 4,
  },
  {
    name: "Ousmane T.",
    key: "ousmane",
    photo: "/images/testimonials/yacinth.png",
    rating: 4,
  },
];

function Stars({ n = 5, label }) {
  return (
    <div className="flex gap-1" aria-label={label}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < n ? "text-yellow-400 fill-yellow-400" : "text-white/20"
          }`}
        />
      ))}
    </div>
  );
}

function Avatar({ src, alt }) {
  const fallback = "/images/testimonials/default-avatar.jpg";

  const onError = (e) => {
    if (e.currentTarget.src.endsWith("default-avatar.jpg")) return;
    e.currentTarget.src = fallback;
  };

  return (
    <img
      src={src}
      alt={alt}
      onError={onError}
      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-white/20 shadow-lg"
      loading="lazy"
    />
  );
}

function TestimonialCard({ item, t }) {
  return (
    <article className="h-full rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.14] overflow-hidden">
      <div className="p-6 md:p-7 h-full flex flex-col">
        <div className="flex items-start gap-4">
          <Avatar
            src={item.photo}
            alt={t("home.testimonials.photoAlt", {
              name: item.name,
              defaultValue: item.name,
            })}
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white">{item.name}</h3>

            <p className="text-sm text-white/65">
              {t(`home.testimonials.items.${item.key}.role`, {
                defaultValue: "",
              })}
            </p>

            <div className="mt-2">
              <Stars
                n={item.rating}
                label={t("home.testimonials.ratingAria", {
                  n: item.rating,
                  defaultValue: `${item.rating}/5`,
                })}
              />
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <Quote className="w-5 h-5 text-sky-300" />
          </div>
        </div>

        <p className="mt-6 text-white/85 leading-8 italic flex-1">
          “
          {t(`home.testimonials.items.${item.key}.text`, {
            defaultValue: "",
          })}
          ”
        </p>
      </div>
    </article>
  );
}

export default function HomeTestimonial() {
  const { t } = useTranslation();

  return (
    <section
      id="temoignages"
      className="relative overflow-hidden bg-slate-950 px-4 py-16 md:py-20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_28%)]" />

      <div
        aria-hidden
        className="absolute -top-16 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-16 left-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-white/90">
            <MessageSquareQuote className="w-4 h-4" />
            {t("home.testimonials.badge", {
              defaultValue: "Learner testimonials",
            })}
          </span>

          <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-white">
            {t("home.testimonials.title")}
          </h2>

          <p className="mt-4 text-white/75 text-base md:text-lg leading-8">
            {t("home.testimonials.subtitle")}
          </p>
        </header>

        <div className="min-w-0">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={testimonials.length > 3}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="!pb-12 [&_.swiper-pagination-bullet]:bg-white/40 [&_.swiper-pagination-bullet-active]:!bg-white"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.key} className="!h-auto">
                <TestimonialCard item={item} t={t} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}