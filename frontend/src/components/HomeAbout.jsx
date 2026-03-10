// 📁 src/components/HomeAbout.jsx
import Section from "@/components/ui/Section";

export default function HomeAbout() {
  return (
    <Section id="about">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Image à gauche */}
        <img
          src="/images/harvest-class.jpg"
          alt="Classe Harvest Center"
          className="w-full h-72 md:h-[360px] object-cover rounded-2xl shadow"
        />

        {/* Texte + entêtes à droite */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-brand mb-2">
              À propos du Harvest Center
            </h2>
            <p className="text-lg text-gray-600">
              Centre de formation en langues : <strong>Anglais</strong>, <strong>Chinois</strong>, <strong>Espagnol</strong>, <strong>Français</strong>…
            </p>
          </div>

          <p className="text-gray-700">
            Nous proposons des parcours adaptés (intensif, soir, week-end), axés sur la
            pratique et la certification.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <li className="bg-white rounded-xl shadow px-4 py-3 font-medium">Formateurs expérimentés</li>
            <li className="bg-white rounded-xl shadow px-4 py-3 font-medium">Programmes flexibles</li>
            <li className="bg-white rounded-xl shadow px-4 py-3 font-medium">Préparation aux tests</li>
            <li className="bg-white rounded-xl shadow px-4 py-3 font-medium">Suivi personnalisé</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
