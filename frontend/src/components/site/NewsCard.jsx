// src/components/site/NewsCard.jsx
// Cartes d'actualité du site public : « une » (grande) et carte de grille.
import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { newsDate, newsExcerpt, newsHref, newsImage, isScholarshipNews, NEWS_PLACEHOLDER } from "./news";

function onImgError(e) {
  if (!e.currentTarget.src.endsWith(NEWS_PLACEHOLDER)) e.currentTarget.src = NEWS_PLACEHOLDER;
}

function Meta({ item, lang, light = false }) {
  const scholarship = isScholarshipNews(item);
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] ${light ? "text-white/75" : "text-mist"}`}>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold uppercase tracking-wide ${
          scholarship ? "bg-millet text-ink" : light ? "bg-white/15 text-white" : "bg-ink/[0.06] text-ink"
        }`}
      >
        {scholarship ? (String(lang).startsWith("en") ? "Scholarship" : "Bourse") : String(lang).startsWith("en") ? "News" : "Actualité"}
      </span>
      <time dateTime={item.created_at} className="tabular-nums">
        {newsDate(item.created_at, lang)}
      </time>
    </div>
  );
}

/** Grande carte : image plein cadre, texte en surimpression. */
export function NewsFeature({ item, lang, className = "" }) {
  return (
    <Link
      to={newsHref(item)}
      className={`group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink focus-ring ${className}`}
    >
      <img
        src={newsImage(item.image_url)}
        onError={onImgError}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/5" />
      <div className="p-6 md:p-9">
        <Meta item={item} lang={lang} light />
        <h3 className="mt-4 max-w-2xl font-display text-[1.75rem] font-semibold leading-[1.12] text-white md:text-[2.4rem]">
          {item.title}
        </h3>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/80 line-clamp-3">{newsExcerpt(item, 220)}</p>
        <span className="mt-6 inline-flex items-center gap-2 font-semibold text-millet">
          {String(lang).startsWith("en") ? "Read the article" : "Lire l’article"}
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Carte de grille : image 16/10, méta, titre, extrait. */
export function NewsCard({ item, lang, compact = false }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
        <img
          src={newsImage(item.image_url)}
          onError={onImgError}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <Meta item={item} lang={lang} />
        <h3 className={`mt-2.5 font-display font-semibold leading-snug text-ink ${compact ? "text-[1.05rem]" : "text-[1.2rem]"} line-clamp-3`}>
          <Link to={newsHref(item)} className="after:absolute after:inset-0 hover:text-brand focus-ring rounded">
            {item.title}
          </Link>
        </h3>
        {!compact && <p className="mt-2 text-[15px] leading-7 text-mist line-clamp-3">{newsExcerpt(item)}</p>}
      </div>
    </article>
  );
}

/** Ligne compacte : vignette + titre (listes latérales). */
export function NewsRow({ item, lang }) {
  return (
    <article className="group relative flex gap-4 py-4">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-paper ring-1 ring-line">
        <img src={newsImage(item.image_url)} onError={onImgError} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="min-w-0">
        <Meta item={item} lang={lang} />
        <h3 className="mt-1.5 font-display text-[1.02rem] font-semibold leading-snug text-ink line-clamp-2">
          <Link to={newsHref(item)} className="after:absolute after:inset-0 hover:text-brand focus-ring rounded">
            {item.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse rounded-2xl bg-paper" />
      <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-paper" />
      <div className="mt-3 h-5 w-5/6 animate-pulse rounded bg-paper" />
      <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-paper" />
    </div>
  );
}
