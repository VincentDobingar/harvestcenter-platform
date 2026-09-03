// src/pages/Actualites.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { BASE_URL } from "@/utils/api";
import { useTranslation } from "react-i18next";
import { getLocalizedValue } from "@/utils/localizeContent";
import {
  Search,
  CalendarDays,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ...

export default function Actualites() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "fr";
  const locale = lang.startsWith("en") ? "en-GB" : "fr-FR";

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetchContent(lang);
  }, [lang]);

  async function fetchContent(currentLang) {
    try {
      setLoading(true);

      const [newsRes, oppRes] = await Promise.all([
        api.get("/news", { params: { limit: 20, lang: currentLang } }),
        api.get("/opportunities", { params: { limit: 20, lang: currentLang } }),
      ]);

      setNews(Array.isArray(newsRes.data?.rows) ? newsRes.data.rows : []);
      setOpportunities(Array.isArray(oppRes.data?.rows) ? oppRes.data.rows : []);
    } catch (error) {
      console.error("fetch actualites error:", error);
      setNews([]);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }

  const items = useMemo(() => {
    const normalizedNews = news.map((item) => {
      const title = getLocalizedValue(item, "title", lang);
      const excerpt =
        getLocalizedValue(item, "excerpt", lang) ||
        buildExcerpt(getLocalizedValue(item, "content", lang));

      const content = getLocalizedValue(item, "content", lang);

      return {
        id: `news-${item.id}`,
        kind: "news",
        title,
        slug: item.slug,
        image_url: item.image_url,
        excerpt,
        content,
        date: item.created_at,
        badge: t("actualitesPage.badges.news", { defaultValue: "Actualité" }),
        href: `/actualites/news/${item.slug}`,
      };
    });

    const normalizedOpps = opportunities.map((item) => {
      const title = getLocalizedValue(item, "title", lang);
      const content = getLocalizedValue(item, "content", lang);
      const excerpt =
        getLocalizedValue(item, "summary", lang) ||
        getLocalizedValue(item, "excerpt", lang) ||
        buildExcerpt(content);

      return {
        id: `opp-${item.id}`,
        kind: "opportunity",
        title,
        slug: item.slug,
        image_url: item.image_url,
        excerpt,
        content,
        date: item.created_at,
        badge: t("actualitesPage.badges.opportunity", {
          defaultValue: "Opportunité",
        }),
        sponsor: getLocalizedValue(item, "sponsor", lang) || item.sponsor,
        country: getLocalizedValue(item, "country", lang) || item.country,
        deadline: item.deadline,
        href: `/actualites/opportunites/${item.slug}`,
      };
    });

    const merged = [...normalizedNews, ...normalizedOpps].sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });

    const search = query.trim().toLowerCase();

    return merged.filter((item) => {
      const matchTab =
        tab === "all" ||
        (tab === "news" && item.kind === "news") ||
        (tab === "opportunities" && item.kind === "opportunity");

      const matchSearch =
        !search ||
        item.title?.toLowerCase().includes(search) ||
        item.excerpt?.toLowerCase().includes(search) ||
        item.content?.toLowerCase().includes(search) ||
        item.sponsor?.toLowerCase().includes(search) ||
        item.country?.toLowerCase().includes(search);

      return matchTab && matchSearch;
    });
  }, [news, opportunities, query, tab, lang, t]);

  const featured = items[0] || null;
  const spotlight = featured ? items.slice(1, 5) : [];
  const gridItems = featured ? items.slice(1) : items;

  const stats = useMemo(() => {
    const total = items.length;
    const newsCount = items.filter((item) => item.kind === "news").length;
    const oppCount = items.filter((item) => item.kind === "opportunity").length;
    return { total, newsCount, oppCount };
  }, [items]);

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold">
              {t("actualitesPage.badge", {
                defaultValue: "Harvest Center News & Opportunities",
              })}
            </span>

            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              {t("actualitesPage.title", {
                defaultValue: "Actualités & Opportunités",
              })}
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-8 max-w-3xl">
              {t("actualitesPage.subtitle", {
                defaultValue:
                  "Retrouvez les dernières actualités du centre, les annonces importantes et les opportunités académiques et professionnelles à ne pas manquer.",
              })}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-slate-100 transition"
              >
                {t("actualitesPage.ctaRegister", {
                  defaultValue: "Faire une demande d’inscription",
                })}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center rounded-2xl border border-white/25 text-white px-6 py-3 font-semibold hover:bg-white/10 transition"
              >
                {t("actualitesPage.ctaContact", {
                  defaultValue: "Nous contacter",
                })}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="text-sm text-slate-500">
              {t("actualitesPage.stats.total", {
                defaultValue: "Contenus visibles",
              })}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.total}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="text-sm text-slate-500">
              {t("actualitesPage.stats.news", {
                defaultValue: "Actualités",
              })}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.newsCount}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="text-sm text-slate-500">
              {t("actualitesPage.stats.opportunities", {
                defaultValue: "Opportunités",
              })}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.oppCount}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("actualitesPage.search", {
                  defaultValue: "Rechercher une actualité ou une opportunité...",
                })}
                className="w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`px-4 py-2.5 rounded-2xl font-medium transition ${
                  tab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t("actualitesPage.filters.all", { defaultValue: "Tout" })}
              </button>

              <button
                type="button"
                onClick={() => setTab("news")}
                className={`px-4 py-2.5 rounded-2xl font-medium transition ${
                  tab === "news"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t("actualitesPage.filters.news", { defaultValue: "Actualités" })}
              </button>

              <button
                type="button"
                onClick={() => setTab("opportunities")}
                className={`px-4 py-2.5 rounded-2xl font-medium transition ${
                  tab === "opportunities"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t("actualitesPage.filters.opportunities", {
                  defaultValue: "Opportunités",
                })}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        {loading ? (
          <div className="text-slate-500">
            {t("common.loading", { defaultValue: "Chargement..." })}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-500">
            {t("actualitesPage.empty", {
              defaultValue: "Aucun contenu disponible pour le moment.",
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {featured && (
              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
                <article className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="h-[280px] md:h-[380px] overflow-hidden">
                    <img
                      src={getImageUrl(featured.image_url)}
                      alt={featured.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 md:p-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-medium ${
                          featured.kind === "news"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {featured.badge}
                      </span>

                      <span className="inline-flex items-center gap-2 text-slate-500">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(featured.date, locale)}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {featured.title}
                    </h2>

                    {featured.kind === "opportunity" &&
                    (featured.sponsor || featured.country || featured.deadline) ? (
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {featured.sponsor ? <span>{featured.sponsor}</span> : null}
                        {featured.country ? <span>{featured.country}</span> : null}
                        {featured.deadline ? (
                          <span>
                            {t("actualitesPage.deadline", {
                              defaultValue: "Date limite",
                            })}{" "}
                            : {formatDate(featured.deadline, locale)}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <p className="text-slate-600 leading-8">
                      {featured.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Link
                        to={featured.href}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-5 py-3 font-semibold hover:bg-blue-700 transition"
                      >
                        {t("actualitesPage.readMore", {
                          defaultValue: "Lire les détails",
                        })}
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to="/inscription"
                        className="inline-flex items-center rounded-2xl border border-blue-200 bg-white text-blue-700 px-5 py-3 font-semibold hover:bg-blue-50 transition"
                      >
                        {t("actualitesPage.ctaRegister", {
                          defaultValue: "Faire une demande d’inscription",
                        })}
                      </Link>
                    </div>
                  </div>
                </article>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-7">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {t("actualitesPage.spotlightTitle", {
                      defaultValue: "À la une",
                    })}
                  </h3>

                  <div className="space-y-4">
                    {spotlight.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="block rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              item.kind === "news"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.badge}
                          </span>

                          <span className="text-xs text-slate-500">
                            {formatDate(item.date, locale)}
                          </span>
                        </div>

                        <h4 className="font-semibold text-slate-900">
                          {item.title}
                        </h4>

                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {item.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {gridItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-52 overflow-hidden">
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span
                        className={`px-3 py-1 rounded-full font-medium ${
                          item.kind === "news"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.badge}
                      </span>

                      <span className="text-slate-500">
                        {formatDate(item.date, locale)}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 line-clamp-3">{item.excerpt}</p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Link
                        to={item.href}
                        className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
                      >
                        {t("actualitesPage.readMore", {
                          defaultValue: "Lire les détails",
                        })}
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {item.kind === "opportunity" ? (
                        <Link
                          to="/inscription"
                          className="inline-flex items-center gap-2 text-slate-700 font-medium hover:underline"
                        >
                          {t("actualitesPage.ctaRegisterShort", {
                            defaultValue: "S’inscrire",
                          })}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-[2rem] text-white p-8 md:p-10 shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%)]" />
              <div className="relative max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  {t("actualitesPage.finalBadge", {
                    defaultValue: "Harvest Center Updates",
                  })}
                </div>

                <h2 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight text-white">
                  {t("actualitesPage.finalTitle", {
                    defaultValue:
                      "Restez connecté aux contenus qui peuvent faire avancer votre avenir",
                  })}
                </h2>

                <p className="mt-4 text-white/90 text-lg leading-8">
                  {t("actualitesPage.finalText", {
                    defaultValue:
                      "Suivez les nouvelles actualités, repérez les meilleures opportunités et engagez-vous dans un parcours de formation tourné vers l’excellence.",
                  })}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/inscription"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 px-6 py-3 font-semibold hover:bg-slate-100 transition"
                  >
                    {t("actualitesPage.ctaRegister", {
                      defaultValue: "Faire une demande d’inscription",
                    })}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/contact"
                    className="inline-flex items-center rounded-2xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition"
                  >
                    {t("actualitesPage.ctaContact", {
                      defaultValue: "Nous contacter",
                    })}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}