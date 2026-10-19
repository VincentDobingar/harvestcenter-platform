// src/components/HomeHero.jsx
// Accueil : photo du centre en fond, promesse, deux actions, dernière
// actualité en direct et chiffres clés.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import api from "@/utils/api";
import { localizeNews, newsDate, newsHref, newsImage } from "@/components/site/news";

const HERO_SLIDES = [
  "/images/hero/harvest-center.jpg",
  "/images/hero/students.jpg",
  "/images/hero/harvest-centerA.jpg",
  "/images/hero/students2.jpg",
  "/images/hero/harvest-centerB.jpg",
  "/images/hero/students3.jpg",
  "/images/hero/students1.jpg",
];

function LatestNews({ lang }) {
  const en = String(lang).startsWith("en");
  const [item, setItem] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get("/news", { params: { limit: 1, lang } })
      .then((res) => {
        const row = res.data?.rows?.[0];
        if (alive && row) setItem(localizeNews(row, lang));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [lang]);

  if (!item) return null;

  return (
    <Link
      to={newsHref(item)}
      className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-3 pr-5 backdrop-blur-md transition hover:bg-white/[0.14] focus-ring"
    >
      <img src={newsImage(item.image_url)} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" />
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-millet">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-millet opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-millet" />
          </span>
          {en ? "Latest news" : "Dernière actualité"} · {newsDate(item.created_at, lang, { day: "numeric", month: "short" })}
        </span>
        <span className="mt-1 block font-semibold leading-snug text-white line-clamp-2">{item.title}</span>
      </span>
      <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-white/60 transition group-hover:text-white" />
    </Link>
  );
}

export default function HomeHero() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "fr";

  const bullets = [0, 1, 2].map((i) => t(`home.hero.bullets.${i}`));
  const stats = [
    {
      value: t("home.hero.floating.value").replace(/\s*(apprenants|learners)\s*$/i, ""),
      label: lang.startsWith("en") ? "Learners since 2018" : "Apprenants depuis 2018",
    },
    { value: t("home.hero.stats.certifications.value"), label: t("home.hero.stats.certifications.label") },
    { value: t("home.hero.stats.learners.value"), label: t("home.hero.stats.learners.label") },
    { value: t("home.hero.stats.partners.value"), label: t("home.hero.stats.partners.label") },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Swiper
          modules={[Autoplay, EffectFade]}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          loop
          effect="fade"
          speed={1600}
          allowTouchMove={false}
          className="h-full w-full"
        >
          {HERO_SLIDES.map((src, i) => (
            <SwiperSlide key={src}>
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-transparent to-transparent" />
      <div aria-hidden="true" className="woven absolute inset-y-0 left-0 w-2.5 md:w-3" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 md:pb-14 md:pt-28 lg:pt-32">
        <div className="max-w-3xl">
          <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-millet">
            <span aria-hidden="true" className="h-px w-10 bg-millet" />
            {t("home.hero.badge")}
          </p>

          <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.02] !text-white sm:text-[3.6rem] lg:text-[4.6rem]">
            {t("home.hero.title")}
          </h1>

          <p className="mt-6 max-w-2xl text-[17px] leading-8 text-white/80 md:text-[19px]">{t("home.hero.subtitle")}</p>

          <ul className="mt-7 flex flex-col gap-2.5 text-[15px] text-white/85 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-millet/20 text-millet">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/inscription"
              className="group inline-flex items-center gap-2 rounded-full bg-millet px-7 py-3.5 text-[15px] font-semibold text-ink shadow-[0_10px_30px_-10px_rgba(227,167,47,0.7)] transition hover:bg-[#f0b743] focus-ring"
            >
              {t("home.hero.ctaApply")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:border-white/60 hover:bg-white/10 focus-ring"
            >
              {t("home.hero.ctaCourses")}
            </Link>
          </div>
        </div>

        <div className="mt-14 grid items-end gap-6 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_400px]">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink/70 px-5 py-5 backdrop-blur-sm">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-[1.7rem] font-semibold leading-none text-white md:text-[2rem]">{s.value}</span>
                  <span className="mt-2 block text-[13px] leading-5 text-white/65">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <LatestNews lang={lang} />
        </div>
      </div>
    </section>
  );
}
