// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";

async function loadRuntimeConfig() {
  try {
    // « ?v=2 » distingue cette version de l'ancienne application : seule
    // l'ancienne demande /config.json sans paramètre, et le serveur lui répond
    // en vidant le cache du navigateur (voir .htaccess).
    const resp = await fetch("/config.json?v=2", { cache: "no-cache" });
    if (!resp.ok) throw new Error("No runtime config");
    const json = await resp.json();
    window.__RUNTIME_CONFIG__ = json;
    return json;
  } catch {
    if (import.meta.env.DEV) {
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