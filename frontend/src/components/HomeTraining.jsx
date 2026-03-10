// 📁 src/components/HomeTraining.jsx

import React from "react";
import Section from "@/components/ui/Section";
import { Link } from "react-router-dom";

const tracks = [
  { title: "Anglais", desc: "Général / Business / Prépa TOEFL/IELTS", to: "/courses#english" },
  { title: "Chinois (Mandarin)", desc: "Bases, conversation, pro", to: "/courses#chinese" },
  { title: "Espagnol", desc: "Débutant à avancé", to: "/courses#spanish" },
  { title: "Français", desc: "Remise à niveau, FLE", to: "/courses#french" },
];

export default function HomeTraining() {
  return (
    <Section
      id="formations"
      title="Nos formations"
      subtitle="Des parcours progressifs, adaptés à votre rythme : intensif, soir ou week-end."
      centered
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tracks.map((t) => (
          <article
            key={t.title}
            className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 border border-transparent hover:border-brand/30"
          >
            <h3 className="text-lg font-semibold text-brand">{t.title}</h3>
            <p className="text-gray-600 mt-2">{t.desc}</p>
            <Link to={t.to} className="mt-4 inline-block link-brand">
              Voir le programme →
            </Link>
          </article>
        ))}
      </div>
    </Section>
  );
}
