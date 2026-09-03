// 📁 src/pages/public/Equipe.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function Equipe() {
  const { t } = useTranslation();

  const membres = [
    {
      nom: "Dr. Nadine Yara",
      roleKey: "teamPage.members.founder",
      photo: "/images/team1.jpg",
    },
    {
      nom: "John Doe",
      roleKey: "teamPage.members.englishTrainer",
      photo: "/images/team2.jpg",
    },
    {
      nom: "Jane Doe",
      roleKey: "teamPage.members.academicLead",
      photo: "/images/team3.jpg",
    },
  ];

  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold">
              Harvest Center
            </span>
            <motion.h1
              className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t("teamPage.title")}
            </motion.h1>
            <p className="mt-5 text-white/80 text-lg leading-8">
              {t("teamPage.subtitle", {
                defaultValue:
                  "Découvrez les femmes et les hommes qui portent la vision, la pédagogie et l’excellence de Harvest Center.",
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {membres.map((membre, index) => (
            <motion.article
              key={membre.nom}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 text-center"
            >
              <div className="relative inline-block">
                <img
                  src={membre.photo}
                  alt={t("teamPage.photoAlt", { name: membre.nom })}
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/images/default-profile.jpg";
                  }}
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-full ring-8 ring-blue-50 -z-10" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">{membre.nom}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-6">
                {t(membre.roleKey)}
              </p>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}