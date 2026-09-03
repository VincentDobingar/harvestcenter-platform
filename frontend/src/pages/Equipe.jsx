// 📁 src/pages/Equipe.jsx
import Section from "@/components/ui/Section";
import { useTranslation } from "react-i18next";
import { Check, Languages } from "lucide-react";

const BRAND_BLUE = "#1F75BB";
const BRAND_BLUE_SOFT = "#E9F4FB";

const team = [
  {
    name: "ALLADOUM OUSSOUMRINGAR",
    roleKey: "coordinatorFounder",
    photo: "/images/teams/dg.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "BEE MARTHE",
    roleKey: "administrativeAssistant",
    photo: "/images/teams/marthe.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "Nenodjilembaye Delvie",
    roleKey: "marketingCommunication",
    photo: "/images/teams/delvies.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "Madjilem ADIDJA",
    roleKey: "representativeSarh",
    photo: "/images/teams/adidja.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "DJENAISSEM Cyriaque",
    roleKey: "trainingAdministrativeOfficer",
    photo: "/images/teams/cyr.png",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "DJENOM Patricia",
    roleKey: "englishTeacher",
    photo: "/images/teams/patricia.png",
    bioKey: "",
    languages: ["english"],
    certs: [],
  },
  {
    name: "Destin TITIBEYE ODJIMSENGAR",
    roleKey: "englishTeacher",
    photo: "/images/teams/destin.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "SINDEUH Odette Tchouving",
    roleKey: "englishTeacher",
    photo: "/images/teams/odette.png",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "DJEKADOM Honoré",
    roleKey: "englishTeacher",
    photo: "/images/teams/honore.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "DJIMARABEYE Yannick",
    roleKey: "englishTeacher",
    photo: "/images/teams/yannick.png",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "MBAIASRA Deurle Tombor",
    roleKey: "englishTeacher",
    photo: "/images/teams/tombor.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "BIANPAMBE chancelier",
    roleKey: "englishTeacher",
    photo: "/images/teams/chancelier.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "Oumar ABDELKERIM IDRISS",
    roleKey: "englishTeacher",
    photo: "/images/teams/oumar.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "Dieudonné MADJINGUE",
    roleKey: "chineseTeacher",
    photo: "/images/teams/dieudonne.jpg",
    bioKey: "",
    languages: ["french", "chinese"],
    certs: [],
  },
  {
    name: "Mahamat FADALA",
    roleKey: "spanishTeacher",
    photo: "/images/teams/fadala.jpg",
    bioKey: "",
    languages: ["french", "spanish"],
    certs: [],
  },
  {
    name: "Teking Halime OUMAR",
    roleKey: "spanishTeacher",
    photo: "/images/teams/teking.jpg",
    bioKey: "",
    languages: ["french", "spanish"],
    certs: [],
  },
  {
    name: "ASSINGA AKOULINGA AKOULINGA",
    roleKey: "germanTeacher",
    photo: "/images/teams/assinga.jpg",
    bioKey: "",
    languages: ["english", "german"],
    certs: [],
  },
  {
    name: "DOUMMADA Naingar",
    roleKey: "onlineEnglishTeacher",
    photo: "/images/teams/naingar.jpg",
    bioKey: "",
    languages: ["french", "english"],
    certs: [],
  },
  {
    name: "MBAITABE Edwige",
    roleKey: "onlineEnglishTeacher",
    photo: "/images/teams/edwige.jpg",
    bioKey: "",
    languages: ["french", "english"],
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

function Card({ member, t }) {
  const langs = Array.isArray(member.languages) ? member.languages : [];

  return (
    <article
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col items-center text-center"
      style={{ boxShadow: "0 6px 18px rgba(0,0,0,.05)" }}
    >
      <div className="w-28 h-28 -mt-2 mb-3 flex items-center justify-center rounded-full">
        <div
          className="rounded-full ring-0 hover:ring-4"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}
        >
          <Avatar
            src={member.photo}
            alt={t("teamDirectoryPage.photoAlt", { name: member.name })}
          />
        </div>
      </div>

      <h3 className="text-[15px] font-extrabold tracking-wide uppercase text-gray-900">
        {member.name}
      </h3>

      <p className="mt-1 text-[13px]" style={{ color: BRAND_BLUE }}>
        {t(`teamDirectoryPage.roles.${member.roleKey}`)}
      </p>

      {member.bioKey ? (
        <p className="mt-3 text-sm text-gray-700">
          {t(`teamDirectoryPage.bio.${member.bioKey}`)}
        </p>
      ) : null}

      {langs.length ? (
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600 mb-2">
            <Languages className="w-4 h-4" />
            {t("teamDirectoryPage.languagesLabel")}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {langs.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center text-xs rounded-full px-2 py-1"
                style={{ backgroundColor: BRAND_BLUE_SOFT, color: BRAND_BLUE }}
              >
                {t(`languages.${lang}`)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {member.certs?.length ? (
        <ul className="mt-3 space-y-1 text-sm text-gray-700 text-left">
          {member.certs.map((cert) => (
            <li key={cert} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600" />
              {cert}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function Equipe() {
  const { t } = useTranslation();

  return (
    <main className="pt-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F75BB]">
          {t("teamDirectoryPage.title")}
        </h1>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          {t("teamDirectoryPage.subtitle")}
        </p>
      </div>

      <Section id="equipe" centered>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
          {team.map((member) => (
            <Card key={member.name} member={member} t={t} />
          ))}
        </div>
      </Section>
    </main>
  );
}