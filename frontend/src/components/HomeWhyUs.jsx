// src/components/HomeWhyUs.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import Section from "@/components/ui/Section";
import {
  Lightbulb,
  Users,
  BadgeCheck,
  Clock3,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const points = [
  { icon: Lightbulb, key: "activeMethod" },
  { icon: Users, key: "smallGroups" },
  { icon: BadgeCheck, key: "certifications" },
  { icon: Clock3, key: "flexibleHours" },
  { icon: GraduationCap, key: "proTrainers" },
  { icon: HeartHandshake, key: "support" },
];

export default function HomeWhyUs() {
  const { t } = useTranslation();

  return (
    <Section
      id="why-us"
      title={t("home.why.title")}
      subtitle={t("home.why.subtitle")}
      centered
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
              Harvest Center
            </span>

            <h3 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight text-white">
              {t("home.why.title")}
            </h3>

            <p className="mt-4 text-white/80 leading-8">
              {t("home.why.subtitle")}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-2xl font-extrabold text-white">98%</div>
                <div className="mt-1 text-sm text-white/70">
                  {t("home.hero.stats.learners.label")}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-2xl font-extrabold text-white">15+</div>
                <div className="mt-1 text-sm text-white/70">
                  {t("home.hero.stats.partners.label")}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-slate-100"
              >
                {t("nav.about")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {points.map((p) => {
              const Icon = p.icon;

              return (
                <article
                  key={p.key}
                  className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100">
                    <Icon className="h-6 w-6 text-blue-700" />
                  </div>

                  <h4 className="mt-5 text-lg font-bold text-slate-900">
                    {t(`home.why.items.${p.key}.title`)}
                  </h4>

                  <p className="mt-3 text-slate-600 leading-7">
                    {t(`home.why.items.${p.key}.desc`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}