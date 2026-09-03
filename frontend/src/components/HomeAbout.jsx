import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import Section from "@/components/ui/Section";

export default function HomeAbout() {
  const { t } = useTranslation();

  const features = [
    "home.about.features.0",
    "home.about.features.1",
    "home.about.features.2",
    "home.about.features.3",
  ];

  return (
    <Section id="about">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100 to-sky-50 blur-2xl opacity-70" />
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200 bg-white">
            <img
              src="/images/harvest-class.jpg"
              alt={t("home.about.imageAlt")}
              className="w-full h-80 md:h-[430px] object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 border border-blue-100">
              Harvest Center
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {t("home.about.title")}
            </h2>

            <p className="mt-3 text-lg text-slate-600 leading-8">
              {t("home.about.intro")}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <p className="text-slate-700 leading-8">
              {t("home.about.description")}
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-sm px-4 py-4"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700 font-medium">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}