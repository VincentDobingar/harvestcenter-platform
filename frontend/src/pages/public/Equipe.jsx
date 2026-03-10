// 📁 src/pages/public/Equipe.jsx
import React from "react";
import { motion } from "framer-motion";

const membres = [
  { nom: "Dr. Nadine Yara", role: "Fondatrice & Directrice", photo: "/images/team1.jpg" },
  { nom: "John Doe", role: "Formateur Anglais", photo: "/images/team2.jpg" },
  { nom: "Jane Doe", role: "Responsable pédagogique", photo: "/images/team3.jpg" },
];

export default function Equipe() {
  return (
    <section className="min-h-screen py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl font-bold text-[#1F75BB] mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Notre Équipe
        </motion.h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {membres.map((membre, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition"
            >
              <img
                src={membre.photo}
                alt={`Photo de ${membre.nom}`}
                className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border"
                onError={(e) => { e.currentTarget.src = "/images/default-profile.jpg"; }}
                loading="lazy"
              />
              <h3 className="text-lg font-semibold text-gray-900">{membre.nom}</h3>
              <p className="text-sm text-gray-600 mt-1">{membre.role}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
