// src/services/authService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Instance axios partagée
const API = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage to outgoing requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Public methods
export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email and password required");
  }

  try {
    // IMPORTANT: send `email` (not `identifier`)
    const res = await API.post("/api/auth/login", { email, password });

    const { token, user } = res.data;
    if (token) {
      localStorage.setItem("token", token);
    }
    return { user, token };
  } catch (err) {
    // normalize error
    const payload = err.response?.data ?? { message: err.message };
    const message = payload.message || payload.error || "Login failed";
    const status = err.response?.status;
    const error = new Error(message);
    error.status = status;
    error.payload = payload;
    throw error;
  }
}

export async function fetchMe() {
  try {
    const res = await API.get("/api/auth/me");
    return res.data.user ?? null;
  } catch (err) {
    // If token invalid/expired, clear stored token
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    throw err;
  }
}

export function logout() {
  // call server logout if you want to remove refresh token cookie
  API.post("/api/auth/logout").catch(() => {});
  localStorage.removeItem("token");
}

// helper to get current token (if needed elsewhere)
export function getToken() {
  return localStorage.getItem("token");
}

// helper to set token (e.g. if you get a new token after refresh)
export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export default API;
