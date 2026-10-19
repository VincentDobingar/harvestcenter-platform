// src/components/HomeAbout.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";
import SectionHeading from "@/components/site/SectionHeading";

export default function HomeAbout() {
  const { t, i18n } = useTranslation();
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");
  const features = [0, 1, 2, 3].map((i) => t(`home.about.features.${i}`));

  return (
    <section id="about" className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <div className="overflow-hidden rounded-[28px] bg-paper">
            <img
              src="/images/harvest-class.jpg"
              alt={t("home.about.imageAlt")}
              className="h-[340px] w-full object-cover md:h-[500px]"
              loading="lazy"
            />
          </div>
          <div aria-hidden="true" className="woven-x absolute -bottom-3 left-8 right-8 h-1.5 rounded-full" />
          <div className="absolute -bottom-8 right-6 rounded-2xl bg-ink px-6 py-5 text-white shadow-[0_24px_48px_-20px_rgba(14,42,71,0.6)] md:right-[-28px]">
            <p className="font-display text-[2rem] font-semibold leading-none text-millet">2018</p>
            <p className="mt-1.5 text-sm text-white/75">{en ? "Training in N’Djamena since" : "Former à N’Djamena depuis"}</p>
          </div>
        </div>

        <div>
          <SectionHeading eyebrow={en ? "The centre" : "Le centre"} title={t("home.about.title")} intro={t("home.about.intro")} />
          <p className="mt-5 text-[16px] leading-8 text-ink/80">{t("home.about.description")}</p>

          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 border-t border-line pt-4 text-[15px] font-medium text-ink">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-millet" strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/about" className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition hover:bg-ink-2 focus-ring">
              {t("home.hero.ctaDiscover")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/equipe" className="font-semibold text-ink underline decoration-millet decoration-2 underline-offset-[6px] hover:text-brand focus-ring rounded">
              {en ? "Meet the team" : "Rencontrer l’équipe"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
