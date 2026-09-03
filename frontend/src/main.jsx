// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";

async function loadRuntimeConfig() {
  try {
    const resp = await fetch("/config.json", { cache: "no-cache" });
    if (!resp.ok) throw new Error("No runtime config");
    const json = await resp.json();
    window.__RUNTIME_CONFIG__ = json;
    return json;
  } catch (e) {
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