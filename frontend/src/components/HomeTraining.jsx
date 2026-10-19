// src/components/HomeTraining.jsx
// Les langues enseignées, chacune avec sa graphie en signature.
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/site/SectionHeading";

const tracks = [
  { key: "english", to: "/courses#english", glyph: "En", fallback: { title: "English", desc: "General / Business / TOEFL-IELTS Prep" } },
  { key: "chinese", to: "/courses#chinese", glyph: "中文", fallback: { title: "Chinese (Mandarin)", desc: "Basics, conversation, professional use" } },
  { key: "spanish", to: "/courses#spanish", glyph: "Es", fallback: { title: "Spanish", desc: "Beginner to advanced" } },
  { key: "french", to: "/courses#french", glyph: "Fr", fallback: { title: "French", desc: "Refresher courses, FLE" } },
  { key: "german", to: "/courses#german", glyph: "De", fallback: { title: "German", desc: "Structured and practical German courses." } },
];

export default function HomeTraining() {
  const { t, i18n } = useTranslation();
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");

  return (
    <section id="formations" className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <SectionHeading
          eyebrow={en ? "Courses" : "Formations"}
          title={t("home.training.title", { defaultValue: "Our courses" })}
          intro={t("home.training.subtitle", { defaultValue: "Progressive learning paths tailored to your pace." })}
          action={
            <Link to="/courses" className="group inline-flex items-center gap-2 font-semibold text-ink hover:text-brand focus-ring rounded">
              {t("home.homeCta.viewCourses", { defaultValue: "View courses" })}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tracks.map((track) => (
            <Link
              key={track.key}
              to={track.to}
              className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-[22px] border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[0_24px_48px_-24px_rgba(14,42,71,0.45)] focus-ring"
            >
              <span aria-hidden="true" className="font-display text-[3.2rem] font-semibold leading-none text-ink/[0.09] transition duration-300 group-hover:text-millet">
                {track.glyph}
              </span>
              <h3 className="mt-8 font-display text-[1.3rem] font-semibold !text-ink">
                {t(`home.training.items.${track.key}.title`, { defaultValue: track.fallback.title })}
              </h3>
              <p className="mt-2 flex-1 text-[14.5px] leading-6 text-mist">
                {t(`home.training.items.${track.key}.desc`, { defaultValue: track.fallback.desc })}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                {en ? "Programme" : "Le programme"}
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[28px] bg-ink px-6 py-10 text-white md:px-12 md:py-12">
          <div aria-hidden="true" className="woven absolute inset-y-0 right-0 w-2.5" />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h3 className="font-display text-[1.7rem] font-semibold leading-tight !text-white md:text-[2.1rem]">
                {t("formationsPage.finalCtaTitle", { defaultValue: "Choose a training path that truly prepares your future" })}
              </h3>
              <p className="mt-3 leading-7 text-white/75">
                {t("formationsPage.finalCtaText", {
                  defaultValue: "Harvest Center supports you with high-quality programs focused on impact, progress, and international openness.",
                })}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link to="/inscription" className="inline-flex items-center gap-2 rounded-full bg-millet px-6 py-3 font-semibold text-ink transition hover:bg-[#f0b743] focus-ring">
                {t("home.homeCta.apply", { defaultValue: "Apply" })}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/courses" className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10 focus-ring">
                {t("home.homeCta.viewCourses", { defaultValue: "View courses" })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
