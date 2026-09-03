// src/components/HomeCTA.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, MessageCircleMore } from "lucide-react";

export default function HomeCTA() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-sky-700 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.22),transparent_30%)]" />

          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 px-6 py-10 md:px-10 md:py-12 items-center">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/95">
                {t("formationsPage.finalCtaBadge", {
                  defaultValue: "Harvest Center International Training",
                })}
              </span>

              <h2 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight text-white">
                {t("home.homeCta.title")}
              </h2>

              <p className="mt-4 max-w-2xl text-white/85 text-base md:text-lg leading-8">
                {t("home.homeCta.subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/inscription"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-slate-100"
                >
                  {t("home.homeCta.apply")}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  {t("home.homeCta.viewCourses")}
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-300/30 bg-sky-400/10 px-6 py-3 font-semibold text-white transition hover:bg-sky-400/20"
                >
                  <MessageCircleMore className="w-4 h-4" />
                  {t("formationsPage.ctaContact", {
                    defaultValue: "Nous contacter",
                  })}
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-sm p-5">
                <div className="text-3xl font-extrabold text-white">4+</div>
                <div className="mt-2 text-white/75 leading-6">
                  {t("home.training.items.english.title")},{" "}
                  {t("home.training.items.chinese.title")},{" "}
                  {t("home.training.items.spanish.title")},{" "}
                  {t("home.training.items.french.title")}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-sm p-5">
                <div className="text-3xl font-extrabold text-white">
                  {t("home.hero.stats.learners.value")}
                </div>
                <div className="mt-2 text-white/75 leading-6">
                  {t("home.hero.stats.learners.label")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}