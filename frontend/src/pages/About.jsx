// src/pages/About.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Section from "@/components/ui/Section";
import {
  Award,
  BookOpen,
  Clock,
  Globe,
  GraduationCap,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  Eye,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: GraduationCap,
    key: "languages",
    bullets: ["bullet1", "bullet2", "bullet3"],
  },
  {
    icon: Clock,
    key: "schedule",
    bullets: ["bullet1", "bullet2", "bullet3"],
  },
  {
    icon: BookOpen,
    key: "exams",
    bullets: ["bullet1", "bullet2", "bullet3"],
  },
  {
    icon: Users,
    key: "smallGroups",
    bullets: ["bullet1", "bullet2", "bullet3"],
  },
  {
    icon: Globe,
    key: "immersion",
    bullets: ["bullet1", "bullet2", "bullet3"],
  },
  {
    icon: Award,
    key: "certificates",
    bullets: ["bullet1", "bullet2", "bullet3"],
  },
];

const visionPoints = [
  { icon: Target, key: "excellence" },
  { icon: Lightbulb, key: "activePedagogy" },
  { icon: TrendingUp, key: "progress" },
  { icon: Eye, key: "impact" },
];

function PremiumCard({ icon: Icon, title, desc }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100">
        <Icon className="h-6 w-6 text-blue-700" />
      </div>

      <h4 className="text-lg font-bold text-slate-900">{title}</h4>
      <p className="mt-3 leading-7 text-slate-600">{desc}</p>
    </article>
  );
}

export default function About() {
  const { t } = useTranslation();

  const tt = (key, defaultValue) => t(key, { defaultValue });

  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold">
              Harvest Center
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
              {tt("aboutPage.presentation.title", "Présentation de Harvest Center")}
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/80">
              {tt(
                "aboutPage.presentation.subtitle",
                "Un centre de référence pour l’apprentissage des langues, la formation et l’ouverture internationale."
              )}
            </p>
          </div>
        </div>
      </section>

      <Section id="presentation" title="" subtitle="" centered>
        <div className="mx-auto max-w-3xl space-y-5 leading-8 text-slate-700">
          <p>
            {tt(
              "aboutPage.presentation.p1",
              "Harvest Center accompagne les apprenants avec une approche moderne, pratique et accessible."
            )}
          </p>
          <p>
            {tt(
              "aboutPage.presentation.p2",
              "Notre ambition est de former des profils compétents, confiants et capables d’évoluer à l’international."
            )}
          </p>
        </div>

        <div className="mt-10">
          <figure className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <img
              src="/images/teams/teams.jpg"
              alt={tt("aboutPage.presentation.imageAlt", "Équipe Harvest Center")}
              className="h-72 w-full object-cover sm:h-96 md:h-[460px]"
              loading="lazy"
            />
          </figure>
        </div>
      </Section>

      <Section id="mot-dg" title="" centered={false}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 md:grid-cols-[280px_1fr]">
          <div className="flex justify-center md:justify-start">
            <div className="w-[240px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl md:w-[280px]">
              <img
                src="/images/teams/dg.png"
                alt={tt("aboutPage.coordinator.imageAlt", "Coordonnateur général")}
                className="h-[380px] w-full object-cover object-top md:h-[430px]"
              />
            </div>
          </div>

          <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Direction générale
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
              {tt("aboutPage.coordinator.title", "Mot du coordonnateur")}
            </h2>

            <div>
              <h3 className="text-lg font-bold text-blue-700">
                ALLADOUM OUSSOUMRINGAR
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {tt("aboutPage.coordinator.role", "Coordonnateur général")}
              </p>
            </div>

            <p className="leading-8 text-slate-700">
              {tt(
                "aboutPage.coordinator.message",
                "Nous croyons en une éducation linguistique de qualité, accessible et tournée vers l’excellence."
              )}
            </p>

            <div className="pt-2">
              <Link
                to="/equipe"
                className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800"
              >
                {tt("aboutPage.coordinator.cta", "Découvrir l’équipe")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="vision"
        title={tt("aboutPage.vision.title", "Notre vision")}
        subtitle={tt(
          "aboutPage.vision.subtitle",
          "Former, inspirer et ouvrir de nouvelles perspectives."
        )}
        centered
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visionPoints.map((v) => (
            <PremiumCard
              key={v.key}
              icon={v.icon}
              title={tt(
                `aboutPage.vision.items.${v.key}.title`,
                v.key === "excellence"
                  ? "Excellence"
                  : v.key === "activePedagogy"
                  ? "Pédagogie active"
                  : v.key === "progress"
                  ? "Progression"
                  : "Impact"
              )}
              desc={tt(
                `aboutPage.vision.items.${v.key}.desc`,
                "Un engagement fort pour la qualité, la progression et l’impact des apprenants."
              )}
            />
          ))}
        </div>
      </Section>

      <Section
        id="services"
        title={tt("aboutPage.services.title", "Nos services")}
        subtitle={tt(
          "aboutPage.services.subtitle",
          "Des formations adaptées aux besoins académiques et professionnels."
        )}
        centered
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;

            return (
              <article
                key={s.key}
                className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100">
                  <Icon className="h-6 w-6 text-blue-700" />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {tt(
                    `aboutPage.services.items.${s.key}.title`,
                    "Programme de formation"
                  )}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {tt(
                    `aboutPage.services.items.${s.key}.desc`,
                    "Un accompagnement de qualité pour apprendre efficacement."
                  )}
                </p>

                <ul className="mt-5 space-y-2 text-sm text-slate-600">
                  {s.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      <span>
                        {tt(
                          `aboutPage.services.items.${s.key}.${bullet}`,
                          "Contenu pédagogique de qualité"
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <Link
                    to="/inscription"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    {tt(
                      "aboutPage.services.ctaApply",
                      "Faire une demande d’inscription"
                    )}
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/courses"
                    className="inline-flex items-center rounded-2xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    {tt("aboutPage.services.ctaLearnMore", "Voir les formations")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </main>
  );
}