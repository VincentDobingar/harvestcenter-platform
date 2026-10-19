// src/components/HomeNews.jsx
// Accueil : la dernière actualité en grand et les trois précédentes.
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "@/utils/api";
import SectionHeading from "@/components/site/SectionHeading";
import { NewsFeature, NewsRow, NewsCardSkeleton } from "@/components/site/NewsCard";
import { localizeNews } from "@/components/site/news";

export default function HomeNews() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "fr";
  const en = lang.startsWith("en");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/news", { params: { limit: 5, lang } });
        if (alive) setItems((Array.isArray(res.data?.rows) ? res.data.rows : []).map((r) => localizeNews(r, lang)));
      } catch (e) {
        console.error("fetch home news error:", e);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang]);

  if (!loading && items.length === 0) return null;
  const [first, ...rest] = items;

  return (
    <section id="news" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <SectionHeading
          eyebrow={en ? "News" : "Actualités"}
          title={t("home.news.title")}
          intro={t("home.news.subtitle")}
          action={
            <Link to="/actualites" className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition hover:bg-ink-2 focus-ring">
              {t("home.news.viewAll")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="mt-12">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              {first && <NewsFeature item={first} lang={lang} className="lg:min-h-[500px]" />}
              <div className="divide-y divide-line border-y border-line lg:self-start">
                {rest.slice(0, 4).map((item) => (
                  <NewsRow key={item.id} item={item} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
