// src/components/DebugAuthModal.jsx
import React, { useEffect, useState } from "react";

/**
 * DebugAuthModal
 * - affiche window.__LAST_AUTH_REQ__ et window.__LAST_AUTH_RESP__
 * - bouton flottant bottom-right pour ouvrir/fermer
 * - auto-refresh quand les variables globales changent (poll léger)
 */

function pretty(o) {
  try {
    return JSON.stringify(o, null, 2);
  } catch {
    return String(o);
  }
}

export default function DebugAuthModal({ pollInterval = 800 }) {
  const [open, setOpen] = useState(false);
  const [lastReq, setLastReq] = useState(null);
  const [lastResp, setLastResp] = useState(null);

  useEffect(() => {
    // initial read
    setLastReq(window.__LAST_AUTH_REQ__ ?? null);
    setLastResp(window.__LAST_AUTH_RESP__ ?? null);

    // lightweight poll to update when AuthContext writes to window.__*
    const id = setInterval(() => {
      const r = window.__LAST_AUTH_REQ__ ?? null;
      const s = window.__LAST_AUTH_RESP__ ?? null;
      // shallow compare by stringifying small objects
      if (pretty(r) !== pretty(lastReq)) setLastReq(r);
      if (pretty(s) !== pretty(lastResp)) setLastResp(s);
    }, pollInterval);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quick copy helpers
  const copy = (txt) => {
    navigator.clipboard?.writeText(txt)?.catch(() => {});
  };

  return (
    <>
      {/* floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Debug Auth (req/resp)"
        className="fixed z-50 right-4 bottom-4 w-12 h-12 rounded-full shadow-lg bg-black/80 text-white grid place-items-center hover:scale-105 transition"
        type="button"
        aria-label="Toggle auth debug"
      >
        DBG
      </button>

      {/* modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-medium">Auth Debug Console</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    copy(pretty(lastReq));
                  }}
                  className="text-sm px-2 py-1 rounded border"
                >
                  Copier REQ
                </button>
                <button
                  onClick={() => {
                    copy(pretty(lastResp));
                  }}
                  className="text-sm px-2 py-1 rounded border"
                >
                  Copier RESP
                </button>
                <button
                  onClick={() => {
                    // clear globals for next run
                    window.__LAST_AUTH_REQ__ = undefined;
                    window.__LAST_AUTH_RESP__ = undefined;
                    setLastReq(null);
                    setLastResp(null);
                  }}
                  className="text-sm px-2 py-1 rounded border text-red-600"
                >
                  Clear
                </button>
                <button onClick={() => setOpen(false)} className="text-sm px-3 py-1 rounded bg-gray-100">
                  Fermer
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[70vh] overflow-auto space-y-4">
              <section>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Dernière requête</div>
                  <div className="text-xs text-gray-500">{lastReq ? new Date(lastReq.at || Date.now()).toLocaleString() : "—"}</div>
                </div>
                <pre className="bg-gray-100 p-3 rounded text-xs whitespace-pre-wrap break-all" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" }}>
                  {pretty(lastReq) || "Aucune requête enregistrée"}
                </pre>
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Dernière réponse</div>
                  <div className="text-xs text-gray-500">{lastResp ? (lastResp.at ? new Date(lastResp.at).toLocaleString() : "") : "—"}</div>
                </div>
                <pre className="bg-gray-100 p-3 rounded text-xs whitespace-pre-wrap break-all" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" }}>
                  {pretty(lastResp) || "Aucune réponse enregistrée"}
                </pre>
              </section>

              <section>
                <div className="text-sm font-semibold mb-2">Conseils</div>
                <ul className="text-xs text-gray-600 list-disc pl-5">
                  <li>Regarde `status` et `data` dans la réponse pour détecter 404/500 ou body inattendu.</li>
                  <li>Si le backend renvoie HTML (Express error page), vérifie l'URL base (api.baseURL) et `API_BASE` côté serveur.</li>
                  <li>Copie les objets et colle-les dans Postman / curl pour reproduire.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
