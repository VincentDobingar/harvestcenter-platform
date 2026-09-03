// src/components/HomeHero.jsx 
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Play, ArrowRight, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const HERO_BACKGROUND_SLIDES = [
  "/images/hero/harvest-center.jpg",
  "/images/hero/harvest-centerA.jpg",
  "/images/hero/harvest-centerB.jpg",
  "/images/hero/students.jpg",
  "/images/hero/students2.jpg",
  "/images/hero/students3.jpg",
  "/images/hero/students1.jpg",
].filter(Boolean);

const HERO_CARD_SLIDES = [
  "/images/hero/harvest-center.jpg",
  "/images/hero/harvest-centerA.jpg",
  "/images/hero/harvest-centerB.jpg",
  "/images/hero/students.jpg",
  "/images/hero/students2.jpg",
  "/images/hero/students3.jpg",
  "/images/hero/students1.jpg",
].filter(Boolean);

export default function HomeHero() {
  const { t } = useTranslation();

  const bullets = [
    "home.hero.bullets.0",
    "home.hero.bullets.1",
    "home.hero.bullets.2",
  ];

  const stats = [
    {
      valueKey: "home.hero.stats.learners.value",
      labelKey: "home.hero.stats.learners.label",
    },
    {
      valueKey: "home.hero.stats.certifications.value",
      labelKey: "home.hero.stats.certifications.label",
    },
    {
      valueKey: "home.hero.stats.partners.value",
      labelKey: "home.hero.stats.partners.label",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Background slider fullscreen */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade]}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          loop
          effect="fade"
          speed={1400}
          allowTouchMove={false}
          className="h-full w-full"
        >
          {HERO_BACKGROUND_SLIDES.map((src, i) => (
            <SwiperSlide key={`bg-${i}`}>
              <img
                src={src}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover scale-105"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Overlays sombres */}
      <div className="absolute inset-0 z-10 bg-slate-950/70" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/78 to-slate-900/72" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_30%)]" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_30%)]" />

      <div
        aria-hidden
        className="absolute z-10 -top-20 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute z-10 -bottom-20 left-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
      />

      <div className="relative z-20 max-w-7xl mx-auto px-4 pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-center">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold bg-white/10 border border-white/15 rounded-full px-4 py-2 backdrop-blur-sm shadow-lg">
              <Sparkles className="w-4 h-4" />
              {t("home.hero.badge")}
            </span>

            <h1 className="mt-5 text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
              {t("home.hero.title")}
            </h1>

            <p className="mt-5 text-white/80 md:text-lg leading-8 max-w-2xl">
              {t("home.hero.subtitle")}
            </p>

            <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {bullets.map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-sky-300 shrink-0" />
                  <span className="text-white/90">{t(key)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/inscription"
                className="inline-flex items-center justify-center rounded-2xl bg-white text-slate-900 font-semibold px-6 py-3 shadow-xl hover:bg-slate-100 transition"
              >
                {t("home.hero.ctaApply")}
              </Link>

              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 text-white px-6 py-3 font-semibold hover:bg-white/10 transition"
              >
                {t("home.hero.ctaCourses")}
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center gap-3 text-white/90 hover:text-white transition"
              >
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm">
                  <Play className="w-4 h-4 fill-current" />
                </span>
                {t("home.hero.ctaDiscover")}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem] aspect-[5/4] bg-slate-200">
                <Swiper
                  modules={[Autoplay, Pagination, EffectFade]}
                  autoplay={{ delay: 3200, disableOnInteraction: false }}
                  loop
                  effect="fade"
                  speed={900}
                  pagination={{ clickable: true }}
                  className="h-full"
                >
                  {HERO_CARD_SLIDES.map((src, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={src}
                        alt={t("home.hero.slideAlt", { index: i + 1 })}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="p-4">
                <p className="text-sm text-white/85 leading-6">
                  {t("home.hero.cardText")}
                </p>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 bg-white text-slate-900 rounded-2xl px-4 py-3 shadow-xl border border-slate-200">
              <p className="text-sm font-bold text-blue-700">
                {t("home.hero.floating.value")}
              </p>
              <p className="text-xs text-slate-500">
                {t("home.hero.floating.label")}
              </p>
            </div>

            <div className="absolute -bottom-5 -right-3 hidden md:flex items-center gap-2 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-xl border border-white/10">
              <span className="inline-flex w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center">
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </span>
              <span className="text-sm font-medium">
                {t("home.hero.ctaCourses")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.labelKey}
              className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 text-center shadow-lg"
            >
              <div className="text-3xl font-extrabold text-white">
                {t(s.valueKey)}
              </div>
              <div className="text-sm text-white/75 mt-1">
                {t(s.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}