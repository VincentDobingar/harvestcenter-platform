// utils/newsQuery.js
// Filtres de la liste publique des actualités : pagination, recherche
// et thèmes (ex. « bourses » pour la page Opportunités).

// Un thème = une expression régulière MySQL appliquée au titre et au texte.
// « followship » : orthographe utilisée dans plusieurs publications Facebook.
export const NEWS_TOPICS = {
  bourses: "bourse|scholarship|fellowship|followship|chevening",
};

export const MAX_NEWS_LIMIT = 50;

export function buildNewsListQuery(query = {}) {
  const limit = Math.min(MAX_NEWS_LIMIT, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const offset = (page - 1) * limit;

  const where = ["is_active = 1"];
  const params = [];

  const topic = NEWS_TOPICS[String(query.topic || "").toLowerCase()];
  if (topic) {
    where.push("(title REGEXP ? OR content REGEXP ?)");
    params.push(topic, topic);
  }

  const q = String(query.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    where.push("(title LIKE ? OR content LIKE ? OR excerpt LIKE ?)");
    params.push(like, like, like);
  }

  return { limit, page, offset, whereSql: where.join(" AND "), params };
}
