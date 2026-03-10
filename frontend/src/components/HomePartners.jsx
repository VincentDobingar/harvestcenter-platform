// 📁 src/components/HomePartners.jsx
import Section from "@/components/ui/Section";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// ⚠️ Place ces fichiers dans /public/images/partners/
const partners = [
  {
    name: "MSF Hollande",
    desc: "ONG médicale humanitaire présente sur le terrain.",
    src: "/images/partners/msf.png", // <- corrigé (msf.png)
    href: "#",
  },
  {
    name: "ADAC",
    desc: "Association de développement et d’action communautaire.",
    src: "/images/partners/adac.jpg",
    href: "#",
  },
  {
    name: "PAM (WFP)",
    desc: "Programme Alimentaire Mondial — sécurité alimentaire.",
    src: "/images/partners/pam.png",
    href: "#",
  },
  {
    name: "BODEL CONSULTING",
    desc: "Conseil, formation et études pour les organisations.",
    src: "/images/partners/bodel.jpg",
    href: "#",
  },
  {
    name: "Expertise France",
    desc: "Coopération technique internationale et développement.",
    src: "/images/partners/Expertise_France.png",
    href: "#",
  },
  {
    name: "Cabinet CDO",
    desc: "Conseil, digitalisation et appui aux organisations.",
    src: "/images/partners/cdo.png",
    href: "cdotchad.com",
  },
  {
    name: "Centre CARTER",
    desc: "The Carter Center — santé publique & gouvernance.",
    src: "/images/partners/centreCarter.jpg",
    href: "#",
  },
    {
    name: "Reussir Bé Gou",
    desc: "Conseil, Orientation et offre de bourse et opportunité d'emploi.",
    src: "/images/partners/reussir.jpg",
    href: "/bourses",
  },
  {
    name: "Job Booster",
    desc: "Conseil, Formation, Entrepreunariat et placement.",
    src: "/images/partners/job_booster.png",
    href: "#",
  },
    {
    name: "Ligue",
    desc: "Conseil, digitalisation et appui aux organisations.",
    src: "/images/partners/ligue.jpg",
    href: "cdotchad.com",
  },
  {
    name: "Dona Corp",
    desc: "Gestion, placement et création d'opportunité d'affaire.",
    src: "/images/partners/dc.png",
    href: "#",
  },
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
      className="max-h-12 w-auto object-contain opacity-90 hover:opacity-100 transition"
      loading="lazy"
    />
  );
}

function PartnerCard({ p }) {
  const Card = (
    <div className="bg-white/90 border border-brand/20 hover:border-brand/40 rounded-2xl h-32 sm:h-36 w-full flex flex-col items-center justify-center text-center px-4 shadow-sm hover:shadow-md transition">
      <Logo src={p.src} alt={p.name} />
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-brand">{p.name}</h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{p.desc}</p>
      </div>
    </div>
  );
  return p.href ? (
    <a href={p.href} aria-label={p.name}>{Card}</a>
  ) : (
    Card
  );
}

export default function HomePartners() {
  return (
    <Section
      id="partners"
      title="Nos partenaires"
      subtitle="Ils nous font confiance pour la formation en langues."
      centered
    >
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 2200, disableOnInteraction: false }}
        loop
        navigation
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 14 },
          640: { slidesPerView: 3, spaceBetween: 18 },
          1024: { slidesPerView: 5, spaceBetween: 22 },
        }}
        className="!py-2"
      >
        {partners.map((p) => (
          <SwiperSlide key={p.name}>
            <PartnerCard p={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}
