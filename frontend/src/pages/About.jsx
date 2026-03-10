import { useState } from "react";
import { Link } from "react-router-dom";
import Section from "@/components/ui/Section";
import Modal from "@/components/ui/Modal";
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
          Eye 
        }
from "lucide-react";

const DG = {
  name: "Nom du DG",
  role: "Directeur Général",
  photo: "/images/teams/dg.jpg",                 // image rectangulaire (paysage conseillé, ex: 1200x675)
  banner: "/images/teams/dg.jpg",         // optionnel: grande image pour le modal; sinon 'photo' sera utilisée
  message:
    "Bienvenue au Harvest Center. Notre mission est d’accompagner chaque apprenant vers l’excellence linguistique, grâce à des parcours flexibles, des méthodes actives et des résultats concrets.",
};

const services = [
  { icon: GraduationCap, title: "Formations en langues", desc: "Anglais, Mandarin, Espagnol, Français (FLE), A1→C1/C2." },
  { icon: Clock,           title: "Horaires flexibles",   desc: "Matin, après-midi, soir et week-end." },
  { icon: BookOpen,        title: "Préparation examens",  desc: "IELTS/TOEFL, HSK : ateliers, simulations, coaching." },
  { icon: Users,           title: "Petits groupes",       desc: "Pédagogie active, progression rapide." },
  { icon: Globe,           title: "Immersion & club",     desc: "Clubs de conversation, mises en situation." },
  { icon: Award,           title: "Attestations",         desc: "Préparation aux certifications reconnues." },
];

const visionPoints = [
  {
    icon: Target,
    title: "Excellence mesurable",
    desc: "Des objectifs clairs, des évaluations régulières et des résultats vérifiables.",
  },
  {
    icon: Lightbulb,
    title: "Pédagogie active",
    desc: "Ateliers, mises en situation et projets pour ancrer les acquis par la pratique.",
  },
  {
    icon: TrendingUp,
    title: "Progression durable",
    desc: "Parcours modulaires et flexibles pour des acquis solides et utilisables.",
  },
  {
    icon: Eye,
    title: "Ouverture & impact",
    desc: "Des langues pour s’ouvrir au monde, évoluer pro et servir sa communauté.",
  },
];

function Avatar({ src, alt }) {
  const fallback = "/images/team/default-avatar.jpg";
  const onError = (e) => {
    if (!e.currentTarget.src.endsWith("default-avatar.jpg")) e.currentTarget.src = fallback;
  };
  return <img src={src} alt={alt} onError={onError} className="w-24 h-24 rounded-full object-cover ring-2 ring-white shadow" loading="lazy" />;
}

export default function About() {
  const [openDG, setOpenDG] = useState(false);
  const Banner = DG.banner || DG.photo;

  return (
    <main className="space-y-16 pt-10">
      <Section id="presentation" title="Présentation du Harvest Center" subtitle="Parcours adaptés et résultats mesurables." centered>
        <div className="max-w-3xl mx-auto text-gray-700 leading-relaxed space-y-4">
          <p>Basé à N’Djamena, le Harvest Center forme aux langues pour étudiants, professionnels et organisations. Approche orientée compétences.</p>
          <p>Petits groupes, créneaux flexibles et ateliers ciblés pour concilier progression rapide et qualité d’accompagnement.</p>
        </div>
        {/* Image sous le texte, toujours dans la même Section */}
        <div className="mt-8">
          <figure className="max-w-5xl mx-auto">
            <img
              src="/images/teams/teams.jpg"    // 👉 place ce fichier dans public/images/about/
              alt="Locaux et apprenants du Harvest Center à N’Djamena"
              className="w-full h-64 sm:h-80 md:h-[420px] object-cover rounded-xl shadow"
              loading="lazy"
            />
            {/* (facultatif) légende */}
            {/* <figcaption className="mt-2 text-center text-xs text-gray-500">Nos locaux à N’Djamena</figcaption> */}
          </figure>
        </div>
      </Section>
      {/* Mot du DG — image + texte */}
      <Section id="mot-dg" title="" centered={false}>
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8 items-start">
          {/* Cadre image : plus HAUT, moins LARGe */}
          <div className="col-span-12 md:col-span-3 flex md:justify-start">
            <div className="w-[220px] md:w-[260px] h-[360px] md:h-[420px] rounded-md shadow overflow-hidden">
              <img
                src="/images/teams/dg.png"
                alt="Directeur Général"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
          {/* Titre + nom + rôle + message */}
          <div className="col-span-12 md:col-span-9 space-y-3 mt-4 md:mt-8 lg:mt-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand">
              Le mot du Coordinateur 
            </h2>

            <div>
              <h3 className="text-lg font-semibold text-brand">ALLADOUM OUSSOUMRINGAR</h3>
              <p className="text-sm text-gray-500 -mt-0.5">COORDINATOR - FOUNDER</p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Bienvenue à Harvest Center. Notre mission est d’accompagner chaque apprenant
              vers l’excellence linguistique, grâce à des parcours flexibles, des méthodes
              actives et des résultats concrets.
            </p>

            {/* Lien vers l’équipe, lui aussi un peu plus bas */}
            <div className="pt-2 md:pt-4 lg:pt-6">
              <Link to="/equipe" className="inline-flex items-center text-[#1F75BB] font-semibold hover:underline">
                Découvrir l’équipe →
              </Link>
            </div>
          </div>
        </div>
      </Section>
      {/* —— Notre vision —— */}
      <Section
        id="vision"
        title="Notre vision"
        subtitle="Former des communicants autonomes, capables d’évoluer dans des contextes académiques et professionnels exigeants."
        centered
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visionPoints.map((v) => {
            const Icon = v.icon;
            return (
              <article key={v.title} className="bg-white rounded-2xl shadow hover:shadow-md transition p-5">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-brand-700" />
                  <h4 className="text-base font-semibold text-brand">{v.title}</h4>
                </div>
                <p className="text-gray-600 mt-2">{v.desc}</p>
              </article>
            );
          })}
        </div>
      </Section>
      {/* —— Nos services —— */}
      <Section id="services" title="Nos services" subtitle="Des dispositifs pensés pour votre réussite." centered>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <article key={s.title} className="bg-white rounded-2xl shadow hover:shadow-md transition p-5">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-brand-700" />
                  <h4 className="text-base font-semibold text-brand">{s.title}</h4>
                </div>
                <p className="text-gray-600 mt-2">{s.desc}</p>
              </article>
            );
          })}
        </div>
      </Section>
    </main>
  );
}
