// src/components/HomeWhyUs.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Lightbulb, Users, BadgeCheck, Clock3, GraduationCap, HeartHandshake } from "lucide-react";
import SectionHeading from "@/components/site/SectionHeading";

const points = [
  { icon: Lightbulb, key: "activeMethod" },
  { icon: Users, key: "smallGroups" },
  { icon: BadgeCheck, key: "certifications" },
  { icon: Clock3, key: "flexibleHours" },
  { icon: GraduationCap, key: "proTrainers" },
  { icon: HeartHandshake, key: "support" },
];

export default function HomeWhyUs() {
  const { t, i18n } = useTranslation();
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");

  return (
    <section id="why-us" className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand/25 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
        <SectionHeading light eyebrow={en ? "Why Harvest" : "Pourquoi Harvest"} title={t("home.why.title")} intro={t("home.why.subtitle")} />

        <div className="mt-14 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {points.map(({ icon: Icon, key }, i) => (
            <article key={key} className="group bg-ink p-7 transition hover:bg-ink-2 md:p-8">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-millet/15 text-millet">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-display text-sm font-semibold tabular-nums text-white/30">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-6 font-display text-[1.25rem] font-semibold !text-white">{t(`home.why.items.${key}.title`)}</h3>
              <p className="mt-2 leading-7 text-white/70">{t(`home.why.items.${key}.desc`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
