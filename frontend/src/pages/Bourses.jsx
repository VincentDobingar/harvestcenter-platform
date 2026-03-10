// 📁 src/pages/Bourses.jsx
import React, { useEffect, useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import api from "@/utils/api";
import Modal from "@/components/ui/Modal";
import {
  Calendar,
  ExternalLink,
  School,
  Award,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react";

/**
 * Page Offres de bourses
 * - Charge dynamiquement GET /bourses (sinon fallback local)
 * - Filtre (recherche + statut Ouverte)
 * - Flux d’actualité (ordre par deadline + badge “Nouveauté”)
 * - Grille de cartes + Modal de détails
 * - CTA Postuler (lien externe si apply_url sinon /inscription)
 */

const NEWS_WINDOW_DAYS = 21; // “Nouveauté” si publié < 21 jours

const FALLBACK_BOURSES = [
  {
    id: "be-gou",
    title: "Bourse Réussir Bé Gou",
    sponsor: "Mr Edgar DJERASSEM",
    cover_image: "/images/bourses/be-gou.jpg", // ➜ place ton image ici (optionnel)
    description:
      "Programme de soutien aux talents tchadiens pour l'accès à une formation linguistique de qualité et l'employabilité.",
    amount: 100,
    amount_label: "Prise en charge jusqu'à 50% des frais de scolarité",
    country: "Tchad",
    city: "N'Djamena",
    deadline: "2025-09-30",
    status: "open",
    published_at: "2025-08-15", // ➜ pour déclencher le badge Nouveauté
    apply_url: "",
    eligibility: [
      "Être résident au Tchad ou avoir un accés en ligne",
      "Avoir un projet académique ou professionnel clair",
      "Motivation démontrée et assiduité",
    ],
    documents: [
      "Pièce d'identité (CNI ou passeport)",
      "Lettre de motivation (1 page): Optionnel",
      "Dernier diplôme ou certificat: Optionnel",
    ],
    selection: [
      "Dépôt du dossier en ligne avec paiement des 50% des frais de scolarité",
      "Pré-sélection sur dossier",
      "Entretien de motivation",
      "Publication des résultats",
    ],
    contact_email: "bourses@harvestcentertd.org",
  },
];

function formatDate(d) {
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(dt);
  } catch {
    return d;
  }
}

function isOpen(b) {
  const today = new Date();
  const end = new Date(b.deadline);
  // compare aux dates sans l'heure
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return (b.status || "open") === "open" && end >= todayOnly;
}

function isNew(b) {
  const d = b.published_at || b.created_at;
  if (!d) return false;
  const ms = Date.now() - new Date(d).getTime();
  return ms <= NEWS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function BourseCard({ b, onOpen }) {
  const open = isOpen(b);
  return (
    <article className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="relative h-40 w-full bg-gray-100">
        <img
          src={b.cover_image || "/images/bourses/default.jpg"}
          alt={b.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith("default.jpg"))
              e.currentTarget.src = "/images/bourses/default.jpg";
          }}
        />
        <span
          className={`absolute top-2 left-2 text-xs font-semibold rounded-full px-2 py-1 ${
            open ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
          }`}
        >
          {open ? "Ouverte" : "Fermée"}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-base font-semibold text-brand">{b.title}</h3>
        <p className="text-xs text-gray-500">
          Par <span className="font-medium">{b.sponsor}</span>
        </p>
        {b.amount_label && (
          <p className="text-sm text-gray-700">{b.amount_label}</p>
        )}
        <div className="mt-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Clôture : {formatDate(b.deadline)}</span>
          </div>
          <button
            onClick={() => onOpen(b)}
            className="inline-flex items-center gap-1 text-[#1F75BB] font-semibold hover:underline"
          >
            Détails <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Bourses() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement API (fallback si indisponible)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/bourses"); // ➜ adapte l'URL (ex: "/api/bourses")
        if (!mounted) return;
        if (Array.isArray(data) && data.length) setItems(data);
        else setItems(FALLBACK_BOURSES);
      } catch (e) {
        setItems(FALLBACK_BOURSES);
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Filtrer + Trier (deadline la plus proche d'abord)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (items || []).filter((b) => {
      if (onlyOpen && !isOpen(b)) return false;
      if (!q) return true;
      const blob = `${b.title} ${b.sponsor} ${b.description} ${b.amount_label} ${b.city} ${b.country}`.toLowerCase();
      return blob.includes(q);
    });
    return list.sort((a, b) => {
      const da = new Date(a.deadline || "9999-12-31").getTime();
      const db = new Date(b.deadline || "9999-12-31").getTime();
      return da - db;
    });
  }, [items, query, onlyOpen]);

  return (
    <main className="space-y-10 pt-10">
      <Section
        id="bourses"
        title="Offres de bourses"
        subtitle="Découvrez les opportunités de financement disponibles via nos partenaires et mécènes."
        centered
      >
        {/* Filtres */}
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Rechercher une bourse (titre, sponsor, pays)"
            className="w-full sm:w-auto flex-1 border rounded-xl px-4 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
            />
            Afficher uniquement les bourses ouvertes
          </label>
        </div>

        {/* Flux d’actualité : classé par date limite, badge Nouveauté */}
        {!loading && filtered.length > 0 && (
          <div className="max-w-5xl mx-auto mt-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Actualités des bourses
            </h3>
            <ul className="divide-y rounded-2xl border bg-white">
              {filtered.slice(0, 6).map((b) => (
                <li
                  key={`news-${b.id || b.title}`}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-gray-900">
                        {b.title}
                      </span>
                      {isNew(b) && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                          <Sparkles className="w-3 h-3" /> Nouveauté
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      Par {b.sponsor} — Clôture : {formatDate(b.deadline)}
                    </p>
                  </div>
                  <button
                    onClick={() => setActive(b)}
                    className="shrink-0 inline-flex items-center gap-1 text-[#1F75BB] font-semibold hover:underline"
                  >
                    Voir <ChevronRight className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grille */}
        {loading ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-60 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filtered.map((b) => (
              <BourseCard key={b.id || b.title} b={b} onOpen={setActive} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-8">
            Aucune bourse ne correspond à votre recherche.
          </p>
        )}
      </Section>

      {/* Modal détails */}
      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title}
        maxWidth="max-w-4xl"
      >
        {active && (
          <div className="space-y-6">
            {/* Bandeau */}
            <div className="h-40 w-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={active.cover_image || "/images/bourses/default.jpg"}
                alt={active.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith("default.jpg"))
                    e.currentTarget.src = "/images/bourses/default.jpg";
                }}
              />
            </div>

            {/* Infos principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-gray-500">Sponsor</div>
                  <div className="font-medium">{active.sponsor}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-gray-500">Avantage</div>
                  <div className="font-medium">
                    {active.amount_label || "Voir détails"}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-gray-500">Clôture</div>
                  <div className="font-medium">{formatDate(active.deadline)}</div>
                </div>
              </div>
            </div>

            {/* Présentation */}
            {active.description && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  Présentation
                </h4>
                <p className="text-gray-700">{active.description}</p>
              </section>
            )}

            {/* Éligibilité */}
            {Array.isArray(active.eligibility) && active.eligibility.length > 0 && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  Conditions d'éligibilité
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {active.eligibility.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Documents */}
            {Array.isArray(active.documents) && active.documents.length > 0 && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  Pièces à fournir
                </h4>
                <ul className="space-y-2">
                  {active.documents.map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <FileText className="w-4 h-4 mt-0.5 text-blue-700" /> {x}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Processus */}
            {Array.isArray(active.selection) && active.selection.length > 0 && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  Processus de sélection
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                  {active.selection.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* CTA */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <a
                href={active.apply_url || "/inscription"}
                target={active.apply_url ? "_blank" : undefined}
                rel={active.apply_url ? "noopener noreferrer" : undefined}
                className="btn-brand px-5 py-2 rounded-xl"
              >
                Postuler {active.apply_url && <ExternalLink className="w-4 h-4" />}
              </a>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
