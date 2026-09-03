import axios from "axios";

function normalizeNoTrailing(url) {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function normalizeLeading(url) {
  if (!url) return "";
  return url.startsWith("/") ? url : `/${url}`;
}

const BASE_URL = `${normalizeNoTrailing(
  import.meta.env.VITE_API_BASE_URL
)}${normalizeLeading(import.meta.env.VITE_API_PREFIX || "/api")}`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      originalRequest?.skipAuthRefresh ||
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/logout") ||
      originalRequest?.url?.includes("/auth/me")
    ) {
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh", {}, { skipAuthRefresh: true });
        return api(originalRequest);
      } catch (err) {
        console.warn("Session expirée.");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };