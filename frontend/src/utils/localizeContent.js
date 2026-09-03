// src/utils/localizeContent.js

export function getLocalizedValue(item, key, lang = "fr") {
  if (!item) return "";

  const normalizedLang = String(lang || "fr").toLowerCase();
  const shortLang = normalizedLang.startsWith("en") ? "en" : "fr";
  const isEn = shortLang === "en";

  // Cas 1 : structure translations
  if (item.translations?.[normalizedLang]?.[key]) {
    return item.translations[normalizedLang][key];
  }

  if (item.translations?.[shortLang]?.[key]) {
    return item.translations[shortLang][key];
  }

  // Cas 2 : colonnes séparées title_fr / title_en
  const preferredKeys = isEn
    ? [`${key}_en`, `${key}En`, key]
    : [`${key}_fr`, `${key}Fr`, key];

  const fallbackKeys = isEn
    ? [`${key}_fr`, `${key}Fr`]
    : [`${key}_en`, `${key}En`];

  for (const k of [...preferredKeys, ...fallbackKeys]) {
    const value = item?.[k];
    if (typeof value === "string" && value.trim()) return value;
  }

  return item?.[key] || "";
}