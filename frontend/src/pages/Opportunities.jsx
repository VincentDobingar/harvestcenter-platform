// src/pages/Opportunities.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import api, { BASE_URL } from "@/utils/api";
import {
  Search,
  CalendarDays,
  MapPin,
  Building2,
  ArrowRight,
  Briefcase,
} from "lucide-react";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "/images/opportunity-fallback.jpg";

  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/images/")) return imageUrl;

  if (imageUrl.startsWith("/uploads/")) {
    const apiRoot = BASE_URL.replace(/\/api$/, "");
    return `${apiRoot}${imageUrl}`;
  }

  return imageUrl;
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

function getTypeLabel(t, type) {
  return t(`opportunitiesPage.types.${type}`, {
    defaultValue: type || "Other",
  });
}

function pickLocalizedField(item, field, lang = "fr") {
  const isEn = String(lang).startsWith("en");
  const primary = isEn ? "en" : "fr";
  const secondary = isEn ? "fr" : "en";

  if (!item || typeof item !== "object") return "";

  // 1) translations.en.title / translations.fr.title
  if (item.translations?.[primary]?.[field]) {
    return item.translations[primary][field];
  }
  if (item.translations?.[secondary]?.[field]) {
    return item.translations[secondary][field];
  }

  // 2) title_en / title_fr
  if (item[`${field}_${primary}`]) return item[`${field}_${primary}`];
  if (item[`${field}_${secondary}`]) return item[`${field}_${secondary}`];

  // 3) titleEn / titleFr
  const camelPrimary =
    field + (primary === "en" ? "En" : "Fr");
  const camelSecondary =
    field + (secondary === "en" ? "En" : "Fr");

  if (item[camelPrimary]) return item[camelPrimary];
  if (item[camelSecondary]) return item[camelSecondary];

  // 4) title: { fr: "...", en: "..." }
  if (
    item[field] &&
    typeof item[field] === "object" &&
    !Array.isArray(item[field])
  ) {
    if (item[field][primary]) return item[field][primary];
    if (item[field][secondary]) return item[field][secondary];
  }

  // 5) fallback simple
  return item[field] || "";
}

export default function Opportunities() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "fr";
  const locale = lang.startsWith("en") ? "en-GB" : "fr-FR";

  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    fetchOpportunities(lang);
  }, [lang]);

  async function fetchOpportunities(currentLang) {
    try {
      setLoading(true);

      const res = await api.get("/opportunities", {
        params: { lang: currentLang },
      });

      setRawItems(Array.isArray(res.data?.rows) ? res.data.rows : []);
    } catch (err) {
      console.error("fetch opportunities error:", err);
      setRawItems([]);
    } finally {
      setLoading(false);
    }
  }

  const items = useMemo(() => {
    return rawItems.map((item) => ({
      ...item,
      title: pickLocalizedField(item, "title", lang),
      summary:
        pickLocalizedField(item, "summary", lang) ||
        pickLocalizedField(item, "excerpt", lang),
      content: pickLocalizedField(item, "content", lang),
      sponsor: pickLocalizedField(item, "sponsor", lang) || item.sponsor || "",
      location: pickLocalizedField(item, "location", lang) || item.location || "",
      country: pickLocalizedField(item, "country", lang) || item.country || "",
    }));
  }, [rawItems, lang]);

  const filtered = useMemo(() => {
    const search = q.toLowerCase().trim();

    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.title?.toLowerCase().includes(search) ||
        item.sponsor?.toLowerCase().includes(search) ||
        item.location?.toLowerCase().includes(search) ||
        item.country?.toLowerCase().includes(search) ||
        item.summary?.toLowerCase().includes(search) ||
        item.content?.toLowerCase().includes(search);

      const matchType = !type || item.type === type;

      return matchSearch && matchType;
    });
  }, [items, q, type]);

  const featured = filtered[0] || null;
  const others = featured ? filtered.slice(1) : [];

  const stats = useMemo(() => {
    const total = filtered.length;
    const types = new Set(filtered.map((item) => item.type).filter(Boolean)).size;
    const withDeadline = filtered.filter((item) => item.deadline).length;

    return { total, types, withDeadline };
  }, [filtered]);

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold">
              {t("opportunitiesPage.badge", {
                defaultValue: "Harvest Center Opportunities",
              })}
            </span>

            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              {t("opportunitiesPage.title", {
                defaultValue: "Opportunities",
              })}
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-8 max-w-3xl">
              {t("opportunitiesPage.subtitle", {
                defaultValue:
                  "Find all our opportunities here: scholarships, fellowships, various offers and other calls.",
              })}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-slate-100 transition"
              >
                {t("opportunitiesPage.ctaRegister", {
                  defaultValue: "Submit an application",
                })}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center rounded-2xl border border-white/25 text-white px-6 py-3 font-semibold hover:bg-white/10 transition"
              >
                {t("opportunitiesPage.ctaContact", {
                  defaultValue: "Contact us",
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
              {t("opportunitiesPage.stats.total", {
                defaultValue: "Visible opportunities",
              })}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.total}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="text-sm text-slate-500">
              {t("opportunitiesPage.stats.categories", {
                defaultValue: "Available categories",
              })}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.types}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="text-sm text-slate-500">
              {t("opportunitiesPage.stats.deadlines", {
                defaultValue: "With deadlines",
              })}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.withDeadline}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="grid lg:grid-cols-[1fr_260px] gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("opportunitiesPage.search", {
                  defaultValue: "Search an opportunity...",
                })}
                className="w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("opportunitiesPage.allTypes", { defaultValue: "All types" })}</option>
              <option value="scholarship">{t("opportunitiesPage.types.scholarship", { defaultValue: "Scholarship" })}</option>
              <option value="fellowship">{t("opportunitiesPage.types.fellowship", { defaultValue: "Fellowship" })}</option>
              <option value="job">{t("opportunitiesPage.types.job", { defaultValue: "Job" })}</option>
              <option value="internship">{t("opportunitiesPage.types.internship", { defaultValue: "Internship" })}</option>
              <option value="training">{t("opportunitiesPage.types.training", { defaultValue: "Training" })}</option>
              <option value="grant">{t("opportunitiesPage.types.grant", { defaultValue: "Grant" })}</option>
              <option value="other">{t("opportunitiesPage.types.other", { defaultValue: "Other" })}</option>
            </select>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        {loading ? (
          <div className="text-slate-500">{t("common.loading", { defaultValue: "Loading..." })}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-500">
            {t("opportunitiesPage.empty", {
              defaultValue: "No opportunity available at the moment.",
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
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {getTypeLabel(t, featured.type)}
                      </span>

                      {featured.deadline ? (
                        <span className="inline-flex items-center gap-2 text-slate-500">
                          <CalendarDays className="w-4 h-4" />
                          {formatDate(featured.deadline, locale)}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {featured.title}
                    </h2>

                    {(featured.sponsor || featured.location || featured.country) && (
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {featured.sponsor ? (
                          <span className="inline-flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {featured.sponsor}
                          </span>
                        ) : null}

                        {[featured.location, featured.country].filter(Boolean).length ? (
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {[featured.location, featured.country].filter(Boolean).join(", ")}
                          </span>
                        ) : null}
                      </div>
                    )}

                    <p className="text-slate-600 leading-8">
                      {featured.summary || featured.content || ""}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      {featured.slug ? (
                        <Link
                          to={`/actualites/opportunites/${featured.slug}`}
                          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-5 py-3 font-semibold hover:bg-blue-700 transition"
                        >
                          {t("opportunitiesPage.details", {
                            defaultValue: "View details",
                          })}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : null}

                      {featured.apply_url ? (
                        <a
                          href={featured.apply_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-2xl border border-blue-200 bg-white text-blue-700 px-5 py-3 font-semibold hover:bg-blue-50 transition"
                        >
                          {t("opportunitiesPage.apply", {
                            defaultValue: "Apply",
                          })}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-7">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {t("opportunitiesPage.sideTitle", {
                      defaultValue: "Don’t miss",
                    })}
                  </h3>

                  <div className="space-y-4">
                    {others.slice(0, 4).map((item) => (
                      <Link
                        key={item.id}
                        to={item.slug ? `/actualites/opportunites/${item.slug}` : "/opportunites"}
                        className="block rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            {getTypeLabel(t, item.type)}
                          </span>

                          {item.deadline ? (
                            <span className="text-xs text-slate-500">
                              {formatDate(item.deadline, locale)}
                            </span>
                          ) : null}
                        </div>

                        <h4 className="font-semibold text-slate-900">{item.title}</h4>

                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {item.summary || item.content || ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {others.map((item) => (
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
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {getTypeLabel(t, item.type)}
                      </span>

                      {item.deadline ? (
                        <span className="text-slate-500">
                          {formatDate(item.deadline, locale)}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">
                      {item.title}
                    </h3>

                    {(item.sponsor || item.location || item.country) && (
                      <div className="text-sm text-slate-500">
                        {[item.sponsor, item.location, item.country]
                          .filter(Boolean)
                          .join(" • ")}
                      </div>
                    )}

                    <p className="text-slate-600 line-clamp-3">
                      {item.summary || item.content || ""}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      {item.slug ? (
                        <Link
                          to={`/actualites/opportunites/${item.slug}`}
                          className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
                        >
                          {t("opportunitiesPage.details", {
                            defaultValue: "View details",
                          })}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : null}

                      {item.apply_url ? (
                        <a
                          href={item.apply_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-slate-700 font-medium hover:underline"
                        >
                          {t("opportunitiesPage.apply", {
                            defaultValue: "Apply",
                          })}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length > 0 && (
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-[2rem] text-white p-8 md:p-10 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%)]" />
                <div className="relative max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold">
                    <Briefcase className="w-4 h-4" />
                    {t("opportunitiesPage.finalBadge", {
                      defaultValue: "Harvest Center Career & Learning",
                    })}
                  </div>

                  <h2 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight text-white">
                    {t("opportunitiesPage.finalTitle", {
                      defaultValue:
                        "Don’t miss the opportunity that could transform your journey",
                    })}
                  </h2>

                  <p className="mt-4 text-white/90 text-lg leading-8">
                    {t("opportunitiesPage.finalText", {
                      defaultValue:
                        "Explore, compare, and apply to the opportunities that best match your academic, professional, and international ambitions.",
                    })}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/inscription"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 px-6 py-3 font-semibold hover:bg-slate-100 transition"
                    >
                      {t("opportunitiesPage.ctaRegister", {
                        defaultValue: "Submit an application",
                      })}
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to="/contact"
                      className="inline-flex items-center rounded-2xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition"
                    >
                      {t("opportunitiesPage.ctaContact", {
                        defaultValue: "Contact us",
                      })}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}