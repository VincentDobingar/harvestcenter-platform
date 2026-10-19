// src/components/site/news.js
// Outils partagés par les pages publiques qui affichent des actualités
// (accueil, Actualités, Opportunités).
import { BASE_URL } from "@/utils/api";
import { getLocalizedValue } from "@/utils/localizeContent";

export const NEWS_PLACEHOLDER = "/images/news/harvest-center5.jpg";

// Même liste de mots que l'API (utils/newsQuery.js, thème « bourses ») :
// sert aussi de filet de sécurité si l'API ne connaît pas encore ce thème.
export const SCHOLARSHIP_PATTERN = /bourse|scholarship|fellowship|followship|chevening/i;

export function isScholarshipNews(item) {
  return SCHOLARSHIP_PATTERN.test(`${item?.title || ""} ${item?.content || ""}`);
}

export function newsImage(url) {
  if (!url) return NEWS_PLACEHOLDER;
  if (url.startsWith("http") || url.startsWith("/images/")) return url;
  if (url.startsWith("/uploads/")) return `${BASE_URL.replace(/\/api$/, "")}${url}`;
  return url;
}

export function newsDate(value, lang = "fr", opts = { day: "numeric", month: "long", year: "numeric" }) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(String(lang).startsWith("en") ? "en-GB" : "fr-FR", opts);
}

export function newsExcerpt(item, max = 170) {
  const src = (item?.excerpt || item?.content || "").replace(/\s+/g, " ").trim();
  if (src.length <= max) return src;
  const cut = src.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

export function newsHref(item) {
  return item?.slug ? `/actualites/news/${item.slug}` : "/actualites";
}

/** Titre / texte dans la langue du visiteur. */
export function localizeNews(item, lang) {
  return {
    ...item,
    title: getLocalizedValue(item, "title", lang) || item.title,
    excerpt: getLocalizedValue(item, "excerpt", lang) || item.excerpt,
    content: getLocalizedValue(item, "content", lang) || item.content,
  };
}
