// 📁 src/components/HomeContact.jsx
import Section from "@/components/ui/Section";
import { Phone, MapPin, Mail } from "lucide-react";

export default function HomeContact({ showForm = true }) {
  return (
    <Section
      id="contact"
      title="Contact & Inscriptions"
      subtitle="Besoin d’une formation adaptée (intensif, soir, week-end) ? Écrivez-nous."
    >
      <div className={showForm ? "grid grid-cols-1 lg:grid-cols-2 gap-10 items-start" : ""}>
        {/* Infos */}
        <div className={showForm ? "space-y-6" : "space-y-6 max-w-3xl"}>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1 text-brand-700" /> Quartier Abena, N'Djamena, Tchad
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-1 text-brand-700" /> +235 66 68 02 00 / 99 40&nbsp;20&nbsp;89
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-1 text-brand-700" /> contact@harvestcentertd.org
            </li>
          </ul>

          <div className="rounded-xl overflow-hidden shadow">
            <iframe
              title="Localisation"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62813.926434637826!2d15.0000!3d12.1000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA2JzAwLjAiTiAxNcKwMDAnMDAuMCJF!5e0!3m2!1sfr!2std!4v1234567890"
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>

        {/* Image cliquable au lieu du formulaire */}
        {showForm && (
          <div className="flex justify-center">
            <a
              href="/inscription" // 🔗 mets ici la vraie page d'inscription
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/inscription-banner.png" // 📌 copie ton image générée dans /public/images/
                alt="Inscrivez-vous aux formations Harvest Center"
                className="rounded-xl shadow-lg hover:opacity-90 transition"
              />
            </a>
          </div>
        )}
      </div>
    </Section>
  );
}
