// src/pages/OpportunityDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  Building2,
  ExternalLink,
} from "lucide-react";
import api, { BASE_URL } from "@/utils/api";
import { getLocalizedValue } from "@/utils/localizeContent";

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

export default function OpportunityDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();

  const lang = i18n.resolvedLanguage || i18n.language || "fr";
  const locale = String(lang).startsWith("en") ? "en-GB" : "fr-FR";

  const [rawItem, setRawItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchOpportunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lang]);

  async function fetchOpportunity() {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.get(`/opportunities/slug/${slug}`, {
        params: { lang },
      });

      const item = res.data?.data || null;

      if (!item) {
        setRawItem(null);
        setErrorMsg(
          t("opportunitiesPage.notFound", {
            defaultValue: "Opportunité introuvable.",
          })
        );
        return;
      }

      setRawItem(item);
    } catch (err) {
      console.error("fetch opportunity detail error:", err);
      setRawItem(null);
      setErrorMsg(
        err?.response?.data?.message ||
          t("opportunitiesPage.loadError", {
            defaultValue: "Impossible de charger cette opportunité.",
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
      summary: getLocalizedValue(rawItem, "summary", lang),
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
            to="/opportunites"
            className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("opportunitiesPage.backToList", {
              defaultValue: "Retour aux opportunités",
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
            to="/opportunites"
            className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("opportunitiesPage.backToList", {
              defaultValue: "Retour aux opportunités",
            })}
          </Link>
        </div>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="h-[260px] md:h-[420px] overflow-hidden bg-slate-100">
            <img
              src={getImageUrl(item.image_url)}
              alt={item.title || "Opportunity"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
              {item.type ? (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {getTypeLabel(t, item.type)}
                </span>
              ) : null}

              {item.deadline ? (
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <CalendarDays className="w-4 h-4" />
                  {formatDate(item.deadline, locale)}
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
                    {item.sponsor}
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

            {item.summary ? (
              <div className="mt-8">
                <p className="text-lg leading-8 text-slate-700">
                  {item.summary}
                </p>
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
                  {t("opportunitiesPage.apply", {
                    defaultValue: "Postuler",
                  })}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : null}

              <Link
                to="/opportunites"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {t("opportunitiesPage.backToList", {
                  defaultValue: "Retour aux opportunités",
                })}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}