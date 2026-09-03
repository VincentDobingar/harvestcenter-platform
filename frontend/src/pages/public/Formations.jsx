// 📁 src/pages/public/Formations.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Briefcase,
  Users,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Clock3,
  BadgeCheck,
  MonitorSmartphone,
  Target,
  Building2,
  Languages,
} from "lucide-react";
import { Link } from "react-router-dom";

const programIcons = {
  languages: Globe,
  capacity: Briefcase,
  coaching: Users,
  education: BookOpen,
  culture: MessageSquare,
  certification: BadgeCheck,
};

const strengthIcons = {
  international: Languages,
  results: Target,
  learner: Users,
};

const deliveryIcons = {
  onsite: GraduationCap,
  hybrid: MonitorSmartphone,
  flexible: Clock3,
  institutions: Building2,
};

const programKeys = [
  "languages",
  "capacity",
  "coaching",
  "education",
  "culture",
  "certification",
];

const strengthKeys = ["international", "results", "learner"];
const deliveryKeys = ["onsite", "hybrid", "flexible", "institutions"];
const commonBulletKeys = ["1", "2", "3"];

export default function Formations() {
  const { t } = useTranslation();

  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold">
              {t("formationsPage.badge")}
            </span>

            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
            >
              {t("formationsPage.title")}
            </motion.h1>

            <p className="mt-5 text-white/80 text-lg leading-8 max-w-3xl">
              {t("formationsPage.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-6 py-3 font-semibold shadow hover:bg-slate-100 transition"
              >
                {t("formationsPage.ctaApply")}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center rounded-2xl border border-white/25 text-white px-6 py-3 font-semibold hover:bg-white/10 transition"
              >
                {t("formationsPage.ctaContactHero")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 md:py-14">
        <div className="grid md:grid-cols-3 gap-6">
          {strengthKeys.map((key, idx) => {
            const Icon = strengthIcons[key];

            return (
              <motion.article
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t(`formationsPage.strengths.${key}.title`)}
                </h2>
                <p className="text-slate-600 mt-3 leading-7">
                  {t(`formationsPage.strengths.${key}.text`)}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="max-w-3xl mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            {t("formationsPage.programsTitle")}
          </h2>
          <p className="mt-4 text-slate-600 leading-8">
            {t("formationsPage.programsSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {programKeys.map((key, idx) => {
            const Icon = programIcons[key];

            return (
              <motion.article
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-blue-700" aria-hidden="true" />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {t(`formationsPage.programs.${key}.title`)}
                </h3>

                <p className="text-slate-600 mt-3 leading-7">
                  {t(`formationsPage.programs.${key}.description`)}
                </p>

                <div className="mt-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900 mb-2">
                    {t("formationsPage.labels.audiences")}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {commonBulletKeys.map((n) => (
                      <li key={n} className="flex items-start gap-2">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        <span>{t(`formationsPage.programs.${key}.audiences.${n}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900 mb-2">
                    {t("formationsPage.labels.highlights")}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {commonBulletKeys.map((n) => (
                      <li key={n} className="flex items-start gap-2">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        <span>{t(`formationsPage.programs.${key}.highlights.${n}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900 mb-2">
                    {t("formationsPage.labels.outcomes")}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {commonBulletKeys.map((n) => (
                      <li key={n} className="flex items-start gap-2">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>{t(`formationsPage.programs.${key}.outcomes.${n}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3">
                  <Link
                    to="/inscription"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-5 py-3 font-semibold hover:bg-blue-700 transition"
                  >
                    {t("formationsPage.ctaApply")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/contact"
                    className="inline-flex items-center rounded-2xl border border-blue-200 bg-white text-blue-700 px-5 py-3 font-semibold hover:bg-blue-50 transition"
                  >
                    {t("formationsPage.ctaContact")}
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14 md:py-16">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {t("formationsPage.deliveryTitle")}
            </h2>
            <p className="mt-4 text-slate-600 leading-8">
              {t("formationsPage.deliverySubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
            {deliveryKeys.map((key) => {
              const Icon = deliveryIcons[key];

              return (
                <div
                  key={key}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t(`formationsPage.delivery.${key}.title`)}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-7">
                    {t(`formationsPage.delivery.${key}.text`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl min-h-[420px] md:min-h-[460px]">
          {/* Image de fond */}
          <img
            src="/images/hero/students2.jpg"
            alt={t("formationsPage.finalCtaImageAlt", {
              defaultValue: "Harvest Center training banner",
            })}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/70 to-sky-900/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_28%)]" />

          {/* Contenu */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-3xl px-8 md:px-12 py-12 md:py-16">
              <span className="inline-flex rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                {t("formationsPage.finalCtaBadge", {
                  defaultValue: "Harvest Center International Training",
                })}
              </span>

              <h2 className="mt-5 text-3xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
                {t("formationsPage.finalCtaTitle")}
              </h2>

              <p className="mt-5 text-white/95 text-base md:text-lg leading-8 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.22)]">
                {t("formationsPage.finalCtaText")}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/inscription"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 px-6 py-3 font-semibold hover:bg-slate-100 transition shadow-lg"
                >
                  {t("formationsPage.ctaApply")}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-2xl border border-white/30 bg-white/5 backdrop-blur-sm text-white px-6 py-3 font-semibold hover:bg-white/10 transition"
                >
                  {t("formationsPage.ctaContactHero")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}