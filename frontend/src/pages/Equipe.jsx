// 📁 src/pages/Equipe.jsx
import Section from "@/components/ui/Section";
import { Check, Languages } from "lucide-react";

// Palette (logo & accent)
const BRAND_BLUE = "#1F75BB";
const BRAND_BLUE_SOFT = "#E9F4FB"; // bleu très clair pour les badges/fonds
const ACCENT_RED = "#D32F2F";      // rouge titre

const team = [
  {
    name: "ALLADOUM OUSSOUMRINGAR",
    role: "COORDINATOR - FOUNDER",
    photo: "/images/teams/dg.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "BEE MARTHE",
    role: "Administrative Assistant",
    photo: "/images/teams/marthe.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },

  {
    name: "Nenodjilembaye Delvie",
    role: "Responsible Marketing et Communication",
    photo: "/images/teams/delvies.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "Madjilem ADIDJA",
    role: "Representative  Officer - Sarh",
    photo: "/images/teams/adidja.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "DJENAISSEM Cyriaque",
    role: "Training & Administrative Officer",
    photo: "/images/teams/cyr.png",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "DJENOM Patricia",
    role: "English Teacher",
    photo: "/images/teams/patricia.png",
    bio: "",
    languages: ["Anglais"], // sera découpé proprement
    certs: [],
  },
  {
    name: "Destin TITIBEYE ODJIMSENGAR",
    role: "English Teacher",
    photo: "/images/teams/destin.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "SINDEUH Odette Tchouving",
    role: "English Teacher",
    photo: "/images/teams/odette.png",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "DJEKADOM Honoré",
    role: "English Teacher",
    photo: "/images/teams/honore.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "DJIMARABEYE Yannick",
    role: "English Teacher",
    photo: "/images/teams/yannick.png",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "MBAIASRA Deurle Tombor",
    role: "English Teacher",
    photo: "/images/teams/tombor.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "BIANPAMBE chancelier",
    role: "English Teacher",
    photo: "/images/teams/chancelier.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "Oumar ABDELKERIM IDRISS",
    role: "English Teacher",
    photo: "/images/teams/oumar.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "Dieudonné MADJINGUE",
    role: "Chinese Teacher",
    photo: "/images/teams/dieudonne.jpg",
    bio: "",
    languages: ["Français", "Chinois"],
    certs: [],
  },
  {
    name: "Mahamat FADALA",
    role: "Spanish Teacher",
    photo: "/images/teams/fadala.jpg",
    bio: "",
    languages: ["Français", "Espagnol"],
    certs: [],
  },
  {
    name: "Teking Halime OUMAR",
    role: "Spanish Teacher",
    photo: "/images/teams/teking.jpg",
    bio: "",
    languages: ["Français", "Espagnol"],
    certs: [],
  },
  {
    name: "ASSINGA AKOULINGA AKOULINGA",
    role: "German Teacher",
    photo: "/images/teams/assinga.jpg",
    bio: "",
    languages: ["Anglais", "Allemand"],
    certs: [],
  },
  {
    name: "DOUMMADA Naingar",
    role: "Online English Teacher",
    photo: "/images/teams/naingar.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
  {
    name: "MBAITABE Edwige",
    role: "Online English Teacher",
    photo: "/images/teams/edwige.jpg",
    bio: "",
    languages: ["Français", "Anglais"],
    certs: [],
  },
];

function Avatar({ src, alt }) {
  const fallback = "/images/teams/default-avatar.jpg";
  const onError = (e) => {
    if (!e.currentTarget.src.endsWith("default-avatar.jpg")) {
      e.currentTarget.src = fallback;
    }
  };
  return (
    <img
      src={src}
      alt={alt}
      onError={onError}
      className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-md transition"
      style={{ boxShadow: "0 8px 20px rgba(0,0,0,.06)" }}
      loading="lazy"
    />
  );
}

function Card({ m }) {
  // normalise "Anglais, Français" -> ["Anglais","Français"]
  const langs =
    Array.isArray(m.languages)
      ? m.languages.flatMap((l) => l.split(",").map((s) => s.trim())).filter(Boolean)
      : [];

  return (
    <article
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col items-center text-center"
      style={{ boxShadow: "0 6px 18px rgba(0,0,0,.05)" }}
    >
      <div
        className="w-28 h-28 -mt-2 mb-3 flex items-center justify-center rounded-full"
        style={{ transition: "ring-color .2s" }}
      >
        <div className="rounded-full ring-0 hover:ring-4" style={{ boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
          <Avatar src={m.photo} alt={m.name} />
        </div>
      </div>

      <h3 className="text-[15px] font-extrabold tracking-wide uppercase text-gray-900">
        {m.name}
      </h3>

      <p className="mt-1 text-[13px]" style={{ color: BRAND_BLUE }}>
        {m.role}
      </p>

      {m.bio ? <p className="mt-3 text-sm text-gray-700">{m.bio}</p> : null}

      {langs.length ? (
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600 mb-2">
            <Languages className="w-4 h-4" /> Langues
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {langs.map((l) => (
              <span
                key={l}
                className="inline-flex items-center text-xs rounded-full px-2 py-1"
                style={{ backgroundColor: BRAND_BLUE_SOFT, color: BRAND_BLUE }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {m.certs?.length ? (
        <ul className="mt-3 space-y-1 text-sm text-gray-700 text-left">
          {m.certs.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <Check className="w-4 h-4" style={{ color: "#16a34a" }} /> {c}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function Equipe() {
  return (
    <main className="pt-6">
      {/* En-tête */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F75BB]">
          Notre équipe
        </h1>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          Une équipe passionnée et engagée, composée de professionnels aux parcours variés, unis par la même vision.
        </p>
      </div>

      {/* Grille */}
      <Section id="equipe" centered>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
          {team.map((m) => (
            <Card key={m.name} m={m} />
          ))}
        </div>
      </Section>
    </main>
  );
}
