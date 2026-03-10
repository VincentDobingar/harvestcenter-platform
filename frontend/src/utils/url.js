// src/utils/url.js
export function normalizePath(path) {
  if (!path) return "/";
  // ensure exactly one leading slash and no trailing slash (unless it's just "/")
  const p = String(path).trim();
  const withoutLeading = p.replace(/^\/+/, "");
  return "/" + withoutLeading.replace(/\/+$/, "");
}

// helper : make public URL absolute when needed
export function toAbsoluteUrl(u) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  // If backend returns a path like "/api/uploads/..." prefer using API_BASE if provided
  try {
    // prefer explicit VITE_API_BASE_URL when available (handles front/back different origins)
    const apiBase = import.meta.env.VITE_API_BASE_URL || null;
    if (apiBase && u.startsWith("/api")) {
      // ensure no duplicate slashes
      const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
      return base + u.replace(/^\/api/, "/api");
    }

    // fallback: use current origin
    return window.location.origin + (u.startsWith("/") ? u : "/" + u);
  } catch (e) {
    // last resort fallback
    return "http://localhost:5000" + (u.startsWith("/") ? u : "/" + u);
  }
}
