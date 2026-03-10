// src/utils/auth.js
import api from "./api";

const TOKEN_KEY = "hc_token";

const Auth = {
  saveToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      /* ignore storage errors */
    }
  },

  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },

  logoutLocal() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  },

  /**
   * Login: expects (email, password)
   * Returns the server response (usually { user, token })
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email et mot de passe requis");
    }

    try {
      console.info("[Auth.login] attempting", { email });

      // use shared api instance (baseURL includes /api)
      const res = await api.post("/api/auth/login", { email, password });
      const data = res?.data ?? null;

      const token = data?.token ?? null;
      if (!token) {
        // if backend returned user but no token, still save nothing and return data
        console.warn("[Auth.login] no token received from server");
        return data;
      }

      // store token and also set Authorization header for future requests
      this.saveToken(token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.info("[Auth.login] success, token saved");
      return data;
    } catch (err) {
      console.error("[Auth.login] failed:", err?.response?.data ?? err.message ?? err);
      // rethrow for UI to handle
      throw err;
    }
  },

  /**
   * fetchMe: get current user, uses api which already injects Authorization header
   * Returns the user object or throws.
   */
  async fetchMe() {
    const token = this.getToken();
    console.debug("[Auth.fetchMe] starting, token:", token ? "present" : "none");
    if (!token) {
      throw new Error("token_missing");
    }

    try {
      const res = await api.get("/api/auth/me");
      // backend either returns user directly or { ok: true, user: {...} }
      const payload = res?.data ?? null;
      const user = payload?.user ?? payload;
      if (!user) throw new Error("Utilisateur introuvable");
      console.debug("[Auth.fetchMe] success", user);
      return user;
    } catch (err) {
      console.warn("[Auth.fetchMe] failed:", err?.response?.data ?? err.message ?? err);
      // if 401 -> clear token locally (api interceptor also does it)
      if (err?.response?.status === 401) {
        this.logoutLocal();
      }
      throw err;
    }
  },

  /**
   * helper redirect path based on role
   */
  getRedirectForRole(role) {
    const r = String(role || "").toLowerCase();
    if (r.includes("admin")) return "/admin";
    if (r.includes("formateur") || r.includes("teacher")) return "/teacher";
    if (r.includes("etudiant") || r.includes("student")) return "/student";
    return "/dashboard";
  },
};

export default Auth;
