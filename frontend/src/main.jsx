// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";

/**
 * Bootstrapping runtime config:
 * - fetch('/config.json') at startup (no-cache)
 * - set window.__RUNTIME_CONFIG__ so src/utils/api.js can read it
 * - fallback to build-time envs if fetch fails
 */
async function loadRuntimeConfig() {
  try {
    const resp = await fetch("/config.json", { cache: "no-cache" });
    if (!resp.ok) throw new Error("No runtime config");
    const json = await resp.json();
    // Make runtime config available globally for api.js
    window.__RUNTIME_CONFIG__ = json;
    return json;
  } catch (e) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("No runtime config found, falling back to build-time envs");
    }
    return null;
  }
}

(async () => {
  await loadRuntimeConfig();

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
