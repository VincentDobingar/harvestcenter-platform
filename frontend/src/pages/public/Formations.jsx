// 📁 src/pages/public/Formations.jsx
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Briefcase, MessageSquare, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const formations = [
  {
    categorie: "Formations en langues",
    description: "Anglais, Chinois, Français, Espagnol, Arabe littéraire",
    sous: ["Adultes", "Enfants", "Professionnels", "Autres catégories"],
    Icon: Globe,
  },
  {
    categorie: "Renforcement des capacités",
    description: "Formations pour le développement professionnel.",
    sous: ["Gestion de projet", "Communication", "Compétences techniques"],
    Icon: Briefcase,
  },
  {
    categorie: "Coaching & Team Building",
    description: "Accompagnement personnel et professionnel.",
    sous: ["Coaching individuel", "Team Building", "Link Building"],
    Icon: Users,
  },
  {
    categorie: "Activités éducatives",
    description: "Activités culturelles et citoyennes pour tous.",
    sous: ["Club", "Café", "Conférence", "Débat", "Leadership", "Engagement civique", "Citoyenneté"],
    Icon: BookOpen,
  },
  {
    categorie: "Manifestations culturelles",
    description: "Événements culturels pour valoriser la diversité.",
    sous: ["Spectacles", "Expositions", "Rencontres"],
    Icon: MessageSquare,
  },
];

export default function Formations() {
  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center text-[#1F75BB] mb-12"
      >
        Nos Offres d’Expertise
      </motion.h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formations.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <item.Icon className="w-6 h-6 text-[#1F75BB]" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-[#1F75BB]">{item.categorie}</h2>
            </div>
            <p className="text-gray-700 mb-2 italic line-clamp-2">{item.description}</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {item.sous.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-center gap-3">
        <Link
          to="/inscription"
          className="inline-block bg-[#1F75BB] text-white px-6 py-3 rounded-lg shadow hover:bg-[#155e9d] transition"
        >
          S’inscrire
        </Link>
        <Link
          to="/contact"
          className="inline-block bg-white border border-[#1F75BB] text-[#1F75BB] px-6 py-3 rounded-lg shadow hover:bg-[#eff6fc] transition"
        >
          Nous contacter
        </Link>
      </div>
    </section>
  );
}
