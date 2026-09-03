// src/pages/ActualiteDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Building2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import api, { BASE_URL } from "@/utils/api";
import { getLocalizedValue } from "@/utils/localizeContent";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "/images/news-fallback.jpg";

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

function normalizeType(value) {
  const v = String(value || "").toLowerCase().trim();
  if (["opportunite", "opportunites", "opportunity", "opportunities"].includes(v)) {
    return "opportunity";
  }
  return "news";
}

export default function ActualiteDetail() {
  const { type, slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const lang = i18n.resolvedLanguage || i18n.language || "fr";
  const locale = String(lang).startsWith("en") ? "en-GB" : "fr-FR";

  const [rawItem, setRawItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const normalizedType = useMemo(() => normalizeType(type), [type]);

  useEffect(() => {
    if (normalizedType === "opportunity") {
      navigate(`/actualites/opportunites/${slug}`, { replace: true });
      return;
    }
    fetchNewsDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lang, normalizedType]);

  async function fetchNewsDetail() {
    try {
      setLoading(true);
      setErrorMsg("");

      // Adapte cette ligne si ton backend news utilise un autre endpoint public
      const res = await api.get(`/news/slug/${slug}`, {
        params: { lang },
      });

      const data = res.data?.data || res.data?.row || null;

      if (!data) {
        setRawItem(null);
        setErrorMsg(
          t("actualiteDetailPage.notFound", {
            defaultValue: "Contenu introuvable.",
          })
        );
        return;
      }

      setRawItem(data);
    } catch (err) {
      console.error("fetch actualite detail error:", err);
      setRawItem(null);
      setErrorMsg(
        err?.response?.data?.message ||
          t("actualiteDetailPage.notFound", {
            defaultValue: "Contenu introuvable.",
          })
      );
    } finally {
      setLoading(false);
    }
  }

  const item = useMemo(() => {
    if (!rawItem) return null;

    return {
      ...rawItem,
      title: getLocalizedValue(rawItem, "title", lang),
      excerpt:
        getLocalizedValue(rawItem, "excerpt", lang) ||
        getLocalizedValue(rawItem, "summary", lang),
      content: getLocalizedValue(rawItem, "content", lang),
      sponsor: getLocalizedValue(rawItem, "sponsor", lang),
      location: getLocalizedValue(rawItem, "location", lang),
      country: getLocalizedValue(rawItem, "country", lang),
    };
  }, [rawItem, lang]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-slate-500">
          {t("common.loading", { defaultValue: "Chargement..." })}
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          {errorMsg}
        </div>

        <div className="mt-6">
          <Link
            to="/actualites"
            className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("actualiteDetailPage.back", {
              defaultValue: "Retour aux actualités",
            })}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="mb-6">
          <Link
            to="/actualites"
            className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("actualiteDetailPage.back", {
              defaultValue: "Retour aux actualités",
            })}
          </Link>
        </div>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="h-[260px] md:h-[420px] overflow-hidden bg-slate-100">
            <img
              src={getImageUrl(item.image_url)}
              alt={item.title || "News"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                {t("actualiteDetailPage.badges.news", {
                  defaultValue: "Actualité",
                })}
              </span>

              {(item.published_at || item.created_at) ? (
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <CalendarDays className="w-4 h-4" />
                  {formatDate(item.published_at || item.created_at, locale)}
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              {item.title}
            </h1>

            {(item.sponsor || item.location || item.country) && (
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
                {item.sponsor ? (
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>
                      {t("actualiteDetailPage.fields.sponsor", {
                        defaultValue: "Sponsor",
                      })}
                      {" : "}
                      {item.sponsor}
                    </span>
                  </span>
                ) : null}

                {[item.location, item.country].filter(Boolean).length > 0 ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {[item.location, item.country].filter(Boolean).join(", ")}
                  </span>
                ) : null}
              </div>
            )}

            {item.excerpt ? (
              <div className="mt-8">
                <p className="text-lg leading-8 text-slate-700">{item.excerpt}</p>
              </div>
            ) : null}

            {item.content ? (
              <div className="mt-8 prose prose-slate max-w-none">
                {String(item.content)
                  .split(/\n{2,}|\r\n\r\n/)
                  .map((paragraph, idx) =>
                    paragraph.trim() ? <p key={idx}>{paragraph.trim()}</p> : null
                  )}
              </div>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-4">
              {item.apply_url ? (
                <a
                  href={item.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition"
                >
                  {t("actualiteDetailPage.applyNow", {
                    defaultValue: "Postuler maintenant",
                  })}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : null}

              <Link
                to="/actualites"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {t("actualiteDetailPage.viewAll", {
                  defaultValue: "Voir toutes les actualités",
                })}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50 transition"
              >
                {t("actualiteDetailPage.contact", {
                  defaultValue: "Nous contacter",
                })}
              </Link>
            </div>
          </div>
        </article>

        <div className="mt-8 rounded-[2rem] bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-8 md:p-10 text-white shadow-xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
            {t("actualiteDetailPage.finalBadge", {
              defaultValue: "Harvest Center",
            })}
          </div>

          <h2 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight">
            {t("actualiteDetailPage.finalTitleNews", {
              defaultValue: "Restez connecté aux actualités qui font avancer votre avenir",
            })}
          </h2>

          <p className="mt-4 text-white/85 text-lg leading-8 max-w-3xl">
            {t("actualiteDetailPage.finalTextNews", {
              defaultValue:
                "Suivez nos informations, découvrez nos initiatives et rejoignez une dynamique de formation ouverte sur le monde.",
            })}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/actualites"
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-slate-100 transition"
            >
              {t("actualiteDetailPage.viewAll", {
                defaultValue: "Voir toutes les actualités",
              })}
            </Link>

            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/15 transition"
            >
              {t("actualiteDetailPage.register", {
                defaultValue: "Faire une demande d’inscription",
              })}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}