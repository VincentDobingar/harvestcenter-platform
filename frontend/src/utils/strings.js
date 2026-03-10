// util: src/utils/strings.js (ou en haut du fichier où utilisé)
export function safeJoin(val, sep = ",") {
  if (Array.isArray(val)) return val.join(sep);
  if (val == null) return "";
  // si c'est un objet, on essaie de le convertir proprement
  if (typeof val === "object") {
    try {
      // si c'est un iterable (Set etc.)
      if (typeof val.join !== "function" && typeof val[Symbol.iterator] === "function") {
        return Array.from(val).join(sep);
      }
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}
