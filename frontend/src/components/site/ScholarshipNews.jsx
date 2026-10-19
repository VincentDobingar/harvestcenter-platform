// src/components/site/ScholarshipNews.jsx
// Les dernières actualités sur les bourses (EDGARD, Chevening…), affichées
// sur la page Opportunités.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "@/utils/api";
import SectionHeading from "./SectionHeading";
import { NewsFeature, NewsCard, NewsCardSkeleton } from "./NewsCard";
import { isScholarshipNews, localizeNews } from "./news";

export default function ScholarshipNews({ lang = "fr", limit = 5 }) {
  const en = String(lang).startsWith("en");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/news", { params: { topic: "bourses", limit: 20, lang } });
        const rows = (Array.isArray(res.data?.rows) ? res.data.rows : []).map((r) => localizeNews(r, lang)).filter(isScholarshipNews);
        if (alive) setItems(rows.slice(0, limit));
      } catch (e) {
        console.error("scholarship news error:", e);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang, limit]);

  if (!loading && items.length === 0) return null;

  const [first, ...rest] = items;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <SectionHeading
        eyebrow={en ? "Scholarships" : "Bourses"}
        title={en ? "Latest scholarship news" : "Les dernières nouvelles des bourses"}
        intro={
          en
            ? "EDGARD Fellowship sessions, Chevening guidance and the scholarships we support, as announced by the centre."
            : "Sessions de la Bourse EDGARD, accompagnement Chevening et bourses soutenues par le centre, telles qu’annoncées par Harvest Center."
        }
        action={
          <Link
            to="/actualites?theme=bourses"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 font-semibold text-ink transition hover:border-ink/40 hover:bg-paper"
          >
            {en ? "All scholarship news" : "Toutes les actualités des bourses"} <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            {first && <NewsFeature item={first} lang={lang} className="lg:min-h-full" />}
            {rest.length > 0 && (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                {rest.slice(0, 4).map((item) => (
                  <NewsCard key={item.id} item={item} lang={lang} compact />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
