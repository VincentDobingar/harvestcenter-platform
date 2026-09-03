// src/components/HomeNews.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Section from "@/components/ui/Section";
import { Link } from "react-router-dom";
import api, { BASE_URL } from "@/utils/api";
import { getLocalizedValue } from "@/utils/localizeContent";
import {
  ArrowRight,
  CalendarDays,
  Newspaper,
  RefreshCcw,
} from "lucide-react";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "/images/news/placeholder.jpg";

  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/images/")) return imageUrl;

  if (imageUrl.startsWith("/uploads/")) {
    const apiRoot = BASE_URL.replace(/\/api$/, "");
    return `${apiRoot}${imageUrl}`;
  }

  return imageUrl;
}

function getExcerpt(item) {
  if (item?.excerpt) return item.excerpt;
  if (!item?.content) return "";
  return item.content.length > 170
    ? `${item.content.slice(0, 170).trim()}...`
    : item.content;
}

function formatDate(value, locale = "fr-FR") {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function NewsSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1.35fr_0.95fr] gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="h-[320px] bg-slate-200 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-full bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-5/6 bg-slate-200 rounded animate-pulse" />
          <div className="h-12 w-40 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="h-24 w-28 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-4/5 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeNews() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "fr";
  const locale = lang.startsWith("en") ? "en-GB" : "fr-FR";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews(lang);
  }, [lang]);

  async function fetchNews(currentLang) {
    try {
      setLoading(true);
      const res = await api.get("/news", {
        params: { limit: 4, lang: currentLang },
      });

      const rows = Array.isArray(res.data?.rows) ? res.data.rows : [];

      const localizedRows = rows.map((item) => ({
        ...item,
        title: getLocalizedValue(item, "title", currentLang),
        excerpt: getLocalizedValue(item, "excerpt", currentLang),
        content: getLocalizedValue(item, "content", currentLang),
      }));

      setItems(localizedRows);
    } catch (error) {
      console.error("fetch home news error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const featured = useMemo(() => items[0] || null, [items]);
  const sideItems = useMemo(() => items.slice(1, 4), [items]);

  if (!loading && items.length === 0) return null;

  return (
    <Section
      id="news"
      title={t("home.news.title")}
      subtitle={t("home.news.subtitle")}
      centered
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Newspaper className="w-4 h-4" />
            {t("actualitesPage.badge", {
              defaultValue: "Actualités & Opportunités Harvest Center",
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => fetchNews(lang)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw className="w-4 h-4" />
            {t("common.refresh")}
          </button>

          <Link
            to="/actualites"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            {t("home.news.viewAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {loading ? (
        <NewsSkeleton />
      ) : (
        <div className="grid lg:grid-cols-[1.35fr_0.95fr] gap-6 items-start">
          {featured ? (
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-xl">
              <Link
                to={featured.slug ? `/actualites/news/${featured.slug}` : "/actualites"}
                className="block"
              >
                <div className="relative h-[280px] md:h-[380px] overflow-hidden">
                  <img
                    src={getImageUrl(featured.image_url)}
                    alt={featured.title}
                    className="w-full h-full object-cover transition duration-500 hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                </div>
              </Link>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 font-semibold text-blue-700">
                    {t("actualitesPage.badges.news", { defaultValue: "Actualité" })}
                  </span>

                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(featured.created_at, locale)}
                  </span>
                </div>

                <h3 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight text-slate-900">
                  {featured.title}
                </h3>

                <p className="mt-5 text-lg leading-8 text-slate-600">
                  {getExcerpt(featured)}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={featured.slug ? `/actualites/news/${featured.slug}` : "/actualites"}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
                  >
                    {t("home.news.readMore")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/inscription"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t("actualitesPage.ctaRegisterShort", {
                      defaultValue: "S’inscrire",
                    })}
                  </Link>
                </div>
              </div>
            </article>
          ) : null}

          <div className="space-y-4">
            <h3 className="text-3xl font-extrabold text-slate-900">
              {t("actualitesPage.spotlightTitle", { defaultValue: "À la une" })}
            </h3>

            {sideItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex gap-4">
                  <Link
                    to={item.slug ? `/actualites/news/${item.slug}` : "/actualites"}
                    className="shrink-0"
                  >
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.title}
                      className="h-24 w-28 rounded-2xl object-cover"
                      loading="lazy"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                        {t("actualitesPage.badges.news", { defaultValue: "Actualité" })}
                      </span>

                      <span className="text-slate-500">
                        {formatDate(item.created_at, locale)}
                      </span>
                    </div>

                    <h4 className="mt-3 text-2xl font-bold leading-snug text-slate-900 line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-slate-600 leading-7 line-clamp-2">
                      {getExcerpt(item)}
                    </p>

                    <Link
                      to={item.slug ? `/actualites/news/${item.slug}` : "/actualites"}
                      className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      {t("home.news.readMore")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}