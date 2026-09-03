// src/components/HomeTraining.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import Section from "@/components/ui/Section";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Globe2, Languages, Sparkles } from "lucide-react";

const tracks = [
  { key: "english", to: "/courses#english", icon: Globe2 },
  { key: "chinese", to: "/courses#chinese", icon: Languages },
  { key: "spanish", to: "/courses#spanish", icon: Sparkles },
  { key: "french", to: "/courses#french", icon: BookOpen },
  { key: "german", to: "/courses#german", icon: Languages },
];

const fallbackTexts = {
  english: {
    title: "English",
    desc: "General / Business / TOEFL-IELTS Prep",
  },
  chinese: {
    title: "Chinese (Mandarin)",
    desc: "Basics, conversation, professional use",
  },
  spanish: {
    title: "Spanish",
    desc: "Beginner to advanced",
  },
  french: {
    title: "French",
    desc: "Refresher courses, FLE",
  },
  german: {
    title: "German",
    desc: "Discover or improve your German with a structured, practical, and accessible training program.",
  },
};

export default function HomeTraining() {
  const { t } = useTranslation();

  return (
    <Section
      id="formations"
      title={t("home.training.title", { defaultValue: "Our courses" })}
      subtitle={t("home.training.subtitle", {
        defaultValue:
          "Progressive learning paths tailored to your pace: intensive, evening or weekend.",
      })}
      centered
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {tracks.map((track, index) => {
            const Icon = track.icon;
            const fallback = fallbackTexts[track.key];

            return (
              <article
                key={track.key}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-sky-50/0 to-blue-50/0 transition group-hover:from-blue-50 group-hover:via-sky-50/60 group-hover:to-white" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100">
                      <Icon className="h-6 w-6 text-blue-700" />
                    </div>

                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {t(`home.training.items.${track.key}.title`, {
                      defaultValue: fallback.title,
                    })}
                  </h3>

                  <p className="mt-3 min-h-[72px] text-slate-600 leading-7">
                    {t(`home.training.items.${track.key}.desc`, {
                      defaultValue: fallback.desc,
                    })}
                  </p>

                  <div className="mt-6">
                    <Link
                      to={track.to}
                      className="inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      {t("home.training.viewProgram", {
                        defaultValue: "View program →",
                      })}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-6 py-8 text-white shadow-xl md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                Harvest Center
              </span>

              <h3 className="mt-4 text-2xl md:text-3xl font-extrabold leading-tight text-white">
                {t("formationsPage.finalCtaTitle", {
                  defaultValue: "Choose a training path that truly prepares your future",
                })}
              </h3>

              <p className="mt-3 text-white/80 leading-8">
                {t("formationsPage.finalCtaText", {
                  defaultValue:
                    "Whether you are a student, a professional, an institution, or a partner, Harvest Center supports you with high-quality programs focused on impact, progress, and international openness.",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-slate-100"
              >
                {t("home.homeCta.viewCourses", {
                  defaultValue: "View courses",
                })}
              </Link>

              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                {t("home.homeCta.apply", {
                  defaultValue: "Apply",
                })}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}