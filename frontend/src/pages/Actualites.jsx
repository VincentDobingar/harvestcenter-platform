// src/pages/Actualites.jsx
// Toutes les actualités du centre, de la plus récente à la plus ancienne.
// Les opportunités (bourses, stages…) ont leur propre page : /opportunites.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ArrowRight, Loader2, X, Newspaper } from "lucide-react";
import api from "@/utils/api";
import { NewsFeature, NewsCard, NewsRow, NewsCardSkeleton } from "@/components/site/NewsCard";
import { localizeNews, isScholarshipNews } from "@/components/site/news";

const PAGE_SIZE = 12;

export default function Actualites() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "fr";
  const en = lang.startsWith("en");
  const [params, setParams] = useSearchParams();

  const theme = params.get("theme") === "bourses" ? "bourses" : "all";
  const [query, setQuery] = useState(params.get("q") || "");
  const [search, setSearch] = useState(params.get("q") || "");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const reqId = useRef(0);
  const rowsRef = useRef([]);

  // Recherche envoyée 350 ms après la dernière frappe.
  useEffect(() => {
    const id = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (search) next.set("q", search);
    else next.delete("q");
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only mirror the search term into the URL
  }, [search]);

  const load = useCallback(
    async (pageToLoad) => {
      const id = ++reqId.current;
      pageToLoad === 1 ? setLoading(true) : setLoadingMore(true);
      setError(false);
      try {
        const res = await api.get("/news", {
          params: {
            limit: PAGE_SIZE,
            page: pageToLoad,
            lang,
            ...(theme === "bourses" ? { topic: "bourses" } : {}),
            ...(search ? { q: search } : {}),
          },
        });
        if (id !== reqId.current) return;
        let incoming = (Array.isArray(res.data?.rows) ? res.data.rows : []).map((r) => localizeNews(r, lang));
        // Filet de sécurité tant que l'API en ligne ne gère pas encore ces filtres.
        if (theme === "bourses") incoming = incoming.filter(isScholarshipNews);
        if (search) {
          const s = search.toLowerCase();
          incoming = incoming.filter((r) => `${r.title} ${r.content || ""}`.toLowerCase().includes(s));
        }

        const base = pageToLoad === 1 ? [] : rowsRef.current;
        const seen = new Set(base.map((r) => r.id));
        const merged = [...base, ...incoming.filter((r) => !seen.has(r.id))];
        const apiTotal = res.data?.total == null ? NaN : Number(res.data.total);
        const added = merged.length - base.length;
        rowsRef.current = merged;
        setRows(merged);
        setTotal(Number.isFinite(apiTotal) ? apiTotal : null);
        setHasMore(Number.isFinite(apiTotal) ? merged.length < apiTotal : added > 0 && (res.data?.rows || []).length >= PAGE_SIZE);
        setPage(pageToLoad);
      } catch (e) {
        console.error("fetch news error:", e);
        if (id === reqId.current) setError(true);
      } finally {
        if (id === reqId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [lang, theme, search]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  function setTheme(next) {
    const p = new URLSearchParams(params);
    if (next === "bourses") p.set("theme", "bourses");
    else p.delete("theme");
    setParams(p, { replace: true });
  }

  const showFeature = !search && rows.length >= 4;
  const feature = showFeature ? rows[0] : null;
  const side = showFeature ? rows.slice(1, 4) : [];
  const grid = showFeature ? rows.slice(4) : rows;

  const countLabel = useMemo(() => {
    const n = total ?? rows.length;
    if (en) return `${n} article${n > 1 ? "s" : ""}`;
    return `${n} actualité${n > 1 ? "s" : ""}`;
  }, [total, rows.length, en]);

  return (
    <main className="bg-white">
      {/* En-tête */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden="true" className="woven absolute inset-y-0 right-0 hidden w-3 opacity-90 md:block" />
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 md:pb-20 md:pt-24">
          <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-millet">
            <span aria-hidden="true" className="h-px w-8 bg-millet" />
            Harvest Center
          </p>
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.05] !text-white md:text-[4rem]">
            {t("newsPage.title", { defaultValue: en ? "News" : "Actualités" })}
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-8 text-white/75">
            {t("newsPage.subtitle", {
              defaultValue: en
                ? "Sessions, scholarships, events and life at the centre in N’Djamena and Sarh."
                : "Rentrées, bourses, événements et vie du centre, à N’Djamena et à Sarh.",
            })}
          </p>
        </div>
      </section>

      {/* Filtres */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label={en ? "Filter news" : "Filtrer les actualités"} className="flex gap-2">
            {[
              { v: "all", label: en ? "All news" : "Toutes" },
              { v: "bourses", label: en ? "Scholarships" : "Bourses" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                role="tab"
                aria-selected={theme === o.v}
                onClick={() => setTheme(o.v)}
                className={`focus-ring rounded-full px-4 py-2 text-sm font-semibold transition ${
                  theme === o.v ? "bg-ink text-white" : "bg-paper text-ink hover:bg-line"
                }`}
              >
                {o.label}
              </button>
            ))}
            <span className="hidden items-center pl-2 text-sm text-mist sm:flex" aria-live="polite">
              {!loading && countLabel}
            </span>
          </div>
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={en ? "Search the news" : "Rechercher une actualité"}
              aria-label={en ? "Search the news" : "Rechercher une actualité"}
              className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-10 text-[15px] text-ink placeholder:text-mist/80 focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={en ? "Clear the search" : "Effacer la recherche"}
                className="focus-ring absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mist hover:bg-paper"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {loading ? (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-line bg-paper px-6 py-12 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              {en ? "The news could not be loaded." : "Les actualités n’ont pas pu être chargées."}
            </p>
            <button type="button" onClick={() => load(1)} className="mt-5 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-2">
              {en ? "Try again" : "Réessayer"}
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-paper px-6 py-14 text-center">
            <Newspaper className="mx-auto h-8 w-8 text-mist" />
            <p className="mt-4 font-display text-xl font-semibold text-ink">{en ? "No news found" : "Aucune actualité trouvée"}</p>
            <p className="mt-2 text-mist">{en ? "Try another word or show all news." : "Essayez un autre mot ou affichez toutes les actualités."}</p>
          </div>
        ) : (
          <>
            {feature && (
              <div className="mb-14 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <NewsFeature item={feature} lang={lang} className="lg:min-h-[520px]" />
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-mist">{en ? "Also recent" : "À lire aussi"}</p>
                  <div className="mt-2 divide-y divide-line">
                    {side.map((item) => (
                      <NewsRow key={item.id} item={item} lang={lang} />
                    ))}
                  </div>
                  {theme === "all" && (
                    <button
                      type="button"
                      onClick={() => setTheme("bourses")}
                      className="focus-ring mt-6 flex w-full items-center justify-between rounded-2xl bg-millet-soft px-5 py-4 text-left transition hover:bg-millet/25"
                    >
                      <span>
                        <span className="block font-semibold text-ink">{en ? "Scholarship news" : "Les actualités des bourses"}</span>
                        <span className="block text-sm text-mist">{en ? "EDGARD, Chevening and more" : "Bourse EDGARD, Chevening et autres"}</span>
                      </span>
                      <ArrowRight className="h-5 w-5 text-ink" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {grid.length > 0 && (
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((item) => (
                  <NewsCard key={item.id} item={item} lang={lang} />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-14 flex justify-center">
                <button
                  type="button"
                  onClick={() => load(page + 1)}
                  disabled={loadingMore}
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-7 py-3 font-semibold text-ink transition hover:border-ink/40 hover:bg-paper disabled:opacity-60"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loadingMore ? (en ? "Loading…" : "Chargement…") : en ? "Show more news" : "Voir plus d’actualités"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{en ? "Looking for a scholarship or an internship?" : "Vous cherchez une bourse ou un stage ?"}</p>
            <p className="mt-1 text-mist">{en ? "Open calls are listed on the Opportunities page." : "Les appels en cours sont sur la page Opportunités."}</p>
          </div>
          <Link to="/opportunites" className="focus-ring inline-flex items-center gap-2 self-start rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-ink-2 md:self-auto">
            {en ? "See opportunities" : "Voir les opportunités"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
