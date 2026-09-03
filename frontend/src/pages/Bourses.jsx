// 📁 src/pages/Bourses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

const NEWS_WINDOW_DAYS = 21;

const FALLBACK_BOURSES = [
  {
    id: "be-gou",
    title: "Bourse Réussir Bé Gou",
    sponsor: "Mr Edgar DJERASSEM",
    cover_image: "/images/bourses/be-gou.jpg",
    description:
      "Programme de soutien aux talents tchadiens pour l'accès à une formation linguistique de qualité et l'employabilité.",
    amount: 100,
    amount_label: "Prise en charge jusqu'à 50% des frais de scolarité",
    country: "Tchad",
    city: "N'Djamena",
    deadline: "2025-09-30",
    status: "open",
    published_at: "2025-08-15",
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

function isOpen(bourse) {
  const today = new Date();
  const end = new Date(bourse.deadline);
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (bourse.status || "open") === "open" && end >= todayOnly;
}

function isNew(bourse) {
  const d = bourse.published_at || bourse.created_at;
  if (!d) return false;
  const ms = Date.now() - new Date(d).getTime();
  return ms <= NEWS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function BourseCard({ bourse, onOpen, t, locale }) {
  const open = isOpen(bourse);

  const formatDate = (d) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="relative h-40 w-full bg-gray-100">
        <img
          src={bourse.cover_image || "/images/bourses/default.jpg"}
          alt={bourse.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith("default.jpg")) {
              e.currentTarget.src = "/images/bourses/default.jpg";
            }
          }}
        />

        <span
          className={`absolute top-2 left-2 text-xs font-semibold rounded-full px-2 py-1 ${
            open ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
          }`}
        >
          {open ? t("scholarshipsPage.open") : t("scholarshipsPage.closed")}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-base font-semibold text-brand">{bourse.title}</h3>

        <p className="text-xs text-gray-500">
          {t("scholarshipsPage.by")}{" "}
          <span className="font-medium">{bourse.sponsor}</span>
        </p>

        {bourse.amount_label && (
          <p className="text-sm text-gray-700">{bourse.amount_label}</p>
        )}

        <div className="mt-auto flex items-center justify-between text-sm text-gray-600 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {t("scholarshipsPage.deadlineLabel")} {formatDate(bourse.deadline)}
            </span>
          </div>

          <button
            onClick={() => onOpen(bourse)}
            className="inline-flex items-center gap-1 text-[#1F75BB] font-semibold hover:underline"
          >
            {t("scholarshipsPage.details")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Bourses() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-GB" : "fr-FR";

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get("/bourses");
        if (!mounted) return;

        if (Array.isArray(data) && data.length) {
          setItems(data);
        } else {
          setItems(FALLBACK_BOURSES);
        }
      } catch {
        setItems(FALLBACK_BOURSES);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = (items || []).filter((bourse) => {
      if (onlyOpen && !isOpen(bourse)) return false;
      if (!q) return true;

      const blob = `${bourse.title} ${bourse.sponsor} ${bourse.description} ${bourse.amount_label} ${bourse.city} ${bourse.country}`.toLowerCase();
      return blob.includes(q);
    });

    return list.sort((a, b) => {
      const da = new Date(a.deadline || "9999-12-31").getTime();
      const db = new Date(b.deadline || "9999-12-31").getTime();
      return da - db;
    });
  }, [items, query, onlyOpen]);

  const formatDate = (d) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  return (
    <main className="space-y-10 pt-10">
      <Section
        id="bourses"
        title={t("scholarshipsPage.title")}
        subtitle={t("scholarshipsPage.subtitle")}
        centered
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder={t("scholarshipsPage.searchPlaceholder")}
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
            {t("scholarshipsPage.onlyOpen")}
          </label>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="max-w-5xl mx-auto mt-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              {t("scholarshipsPage.newsTitle")}
            </h3>

            <ul className="divide-y rounded-2xl border bg-white">
              {filtered.slice(0, 6).map((bourse) => (
                <li
                  key={`news-${bourse.id || bourse.title}`}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-gray-900">
                        {bourse.title}
                      </span>

                      {isNew(bourse) && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                          <Sparkles className="w-3 h-3" />
                          {t("scholarshipsPage.new")}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 truncate">
                      {t("scholarshipsPage.by")} {bourse.sponsor} —{" "}
                      {t("scholarshipsPage.deadlineShort")}{" "}
                      {formatDate(bourse.deadline)}
                    </p>
                  </div>

                  <button
                    onClick={() => setActive(bourse)}
                    className="shrink-0 inline-flex items-center gap-1 text-[#1F75BB] font-semibold hover:underline"
                  >
                    {t("scholarshipsPage.view")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-60 bg-gray-100 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filtered.map((bourse) => (
              <BourseCard
                key={bourse.id || bourse.title}
                bourse={bourse}
                onOpen={setActive}
                t={t}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-8">
            {t("scholarshipsPage.noResults")}
          </p>
        )}
      </Section>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title}
        maxWidth="max-w-4xl"
      >
        {active && (
          <div className="space-y-6">
            <div className="h-40 w-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={active.cover_image || "/images/bourses/default.jpg"}
                alt={active.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith("default.jpg")) {
                    e.currentTarget.src = "/images/bourses/default.jpg";
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-gray-500">
                    {t("scholarshipsPage.modal.sponsor")}
                  </div>
                  <div className="font-medium">{active.sponsor}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-gray-500">
                    {t("scholarshipsPage.modal.benefit")}
                  </div>
                  <div className="font-medium">
                    {active.amount_label || t("scholarshipsPage.modal.seeDetails")}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-gray-500">
                    {t("scholarshipsPage.modal.deadline")}
                  </div>
                  <div className="font-medium">{formatDate(active.deadline)}</div>
                </div>
              </div>
            </div>

            {active.description && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  {t("scholarshipsPage.modal.presentation")}
                </h4>
                <p className="text-gray-700">{active.description}</p>
              </section>
            )}

            {Array.isArray(active.eligibility) && active.eligibility.length > 0 && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  {t("scholarshipsPage.modal.eligibility")}
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {active.eligibility.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            )}

            {Array.isArray(active.documents) && active.documents.length > 0 && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  {t("scholarshipsPage.modal.documents")}
                </h4>
                <ul className="space-y-2">
                  {active.documents.map((x, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <FileText className="w-4 h-4 mt-0.5 text-blue-700" />
                      {x}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {Array.isArray(active.selection) && active.selection.length > 0 && (
              <section>
                <h4 className="text-base font-semibold text-blue-800 mb-2">
                  {t("scholarshipsPage.modal.selection")}
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                  {active.selection.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </section>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
              <a
                href={active.apply_url || "/inscription"}
                target={active.apply_url ? "_blank" : undefined}
                rel={active.apply_url ? "noopener noreferrer" : undefined}
                className="btn-brand px-5 py-2 rounded-xl inline-flex items-center gap-2"
              >
                {t("scholarshipsPage.apply")}
                {active.apply_url && <ExternalLink className="w-4 h-4" />}
              </a>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}