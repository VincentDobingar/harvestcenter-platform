// 📁 src/components/HomePartners.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import Section from "@/components/ui/Section";
import { Link } from "react-router-dom";
import { ArrowUpRight, Handshake, ShieldCheck } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const partners = [
  { key: "msf", name: "MSF Hollande", src: "/images/partners/msf.png", href: "#" },
  { key: "adac", name: "ADAC", src: "/images/partners/adac.jpg", href: "#" },
  { key: "pam", name: "PAM (WFP)", src: "/images/partners/pam.png", href: "#" },
  { key: "bodel", name: "BODEL CONSULTING", src: "/images/partners/bodel.jpg", href: "#" },
  { key: "expertiseFrance", name: "Expertise France", src: "/images/partners/Expertise_France.png", href: "#" },
  { key: "cdo", name: "Cabinet CDO", src: "/images/partners/cdo.png", href: "https://cdotchad.com" },
  { key: "carter", name: "Centre CARTER", src: "/images/partners/centreCarter.jpg", href: "#" },
  { key: "reussirBeGou", name: "Reussir Bé Gou", src: "/images/partners/reussir.jpg", href: "/opportunites" },
  { key: "jobBooster", name: "Job Booster", src: "/images/partners/job_booster.png", href: "#" },
  { key: "ligue", name: "Ligue", src: "/images/partners/ligue.jpg", href: "https://cdotchad.com" },
  { key: "donaCorp", name: "Dona Corp", src: "/images/partners/dc.png", href: "#" },
];

function Logo({ src, alt }) {
  const fallback = "/images/partners/default-logo.png";

  const onError = (e) => {
    if (!e.currentTarget.src.endsWith("default-logo.png")) {
      e.currentTarget.src = fallback;
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      onError={onError}
      className="max-h-14 w-auto object-contain transition duration-300 group-hover:scale-105"
      loading="lazy"
    />
  );
}

function PartnerCard({ partner, t, isEnglish }) {
  const ctaText = partner.href?.startsWith("/")
    ? isEnglish
      ? "Discover"
      : "Découvrir"
    : isEnglish
    ? "Visit"
    : "Visiter";

  const content = (
    <div className="group h-full rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      <div className="flex h-20 items-center justify-center rounded-2xl bg-slate-50">
        <Logo
          src={partner.src}
          alt={t("home.partners.logoAlt", { name: partner.name, defaultValue: partner.name })}
        />
      </div>

      <div className="mt-5">
        <h3 className="text-base font-bold text-slate-900">{partner.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 min-h-[72px]">
          {t(`home.partners.items.${partner.key}`, {
            defaultValue: partner.name,
          })}
        </p>
      </div>

      {partner.href && partner.href !== "#" ? (
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          {ctaText}
          <ArrowUpRight className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );

  if (!partner.href || partner.href === "#") return content;

  if (partner.href.startsWith("/")) {
    return <Link to={partner.href} className="block h-full">{content}</Link>;
  }

  return (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      {content}
    </a>
  );
}

export default function HomePartners() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.resolvedLanguage?.startsWith("en");

  return (
    <Section
      id="partners"
      title={t("home.partners.title", { defaultValue: "Our partners" })}
      subtitle={t("home.partners.subtitle", {
        defaultValue: isEnglish
          ? "They trust us for language training."
          : "Ils nous font confiance pour la formation en langues.",
      })}
      centered
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] items-stretch">
        <div className="h-full rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
            <Handshake className="h-4 w-4" />
            Harvest Center
          </span>

          <h3 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight text-white">
            {t("home.partners.title", { defaultValue: "Our partners" })}
          </h3>

          <p className="mt-4 text-white/80 leading-8">
            {t("home.partners.subtitle", {
              defaultValue: isEnglish
                ? "They trust us for language training."
                : "Ils nous font confiance pour la formation en langues.",
            })}
          </p>

          <div className="mt-8">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-sky-300" />
              <p className="text-sm leading-7 text-white/80">
                {isEnglish
                  ? "We build meaningful collaborations with institutions, NGOs, companies, and organizations committed to education, language learning, and impact."
                  : "Nous développons des collaborations solides avec des institutions, ONG, entreprises et organisations engagées dans l’éducation, les langues et l’impact."}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
          <Swiper
            modules={[Autoplay, Navigation]}
            observer
            observeParents
            watchOverflow
            autoplay={{ delay: 2600, disableOnInteraction: false }}
            loop={partners.length > 3}
            navigation
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 18 },
              1280: { slidesPerView: 3, spaceBetween: 20 },
            }}
            className="w-full [&_.swiper-button-next]:text-blue-700 [&_.swiper-button-prev]:text-blue-700 [&_.swiper-button-next]:scale-75 [&_.swiper-button-prev]:scale-75"
          >
            {partners.map((partner) => (
              <SwiperSlide key={partner.key} className="!h-auto">
                <PartnerCard partner={partner} t={t} isEnglish={isEnglish} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </Section>
  );
}