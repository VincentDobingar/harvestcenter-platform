// 📁 src/components/HomeWhyUs.jsx
import React from "react";
import Section from "@/components/ui/Section";
import { Lightbulb, Users, BadgeCheck, Clock, GraduationCap, HeartHandshake } from "lucide-react";

const points = [
  { icon: Lightbulb, title: "Méthode active", desc: "Oral, mises en situation, jeux de rôle." },
  { icon: Users, title: "Petits groupes", desc: "Apprentissage rapide, suivi de qualité." },
  { icon: BadgeCheck, title: "Certifications", desc: "Préparation TOEFL/IELTS/HSK/DELE/TCF." },
  { icon: Clock, title: "Horaires flexibles", desc: "Cours intensifs, soir ou week-end." },
  { icon: GraduationCap, title: "Formateurs pros", desc: "Expérience pédagogique et secteur." },
  { icon: HeartHandshake, title: "Accompagnement", desc: "Conseils, ressources et suivi individuel." },
];

export default function HomeWhyUs() {
  return (
    <Section
      id="why-us"
      title="Pourquoi nous choisir ?"
      subtitle="Une pédagogie pragmatique, des groupes réduits et un accompagnement réel jusqu’à la réussite."
      centered
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {points.map((p) => {
          const Icon = p.icon;
          return (
            <article key={p.title} className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 border border-transparent hover:border-brand/30">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-brand-700" />
                <h4 className="text-base font-semibold text-brand">{p.title}</h4>
              </div>
              <p className="text-gray-600 mt-2">{p.desc}</p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
