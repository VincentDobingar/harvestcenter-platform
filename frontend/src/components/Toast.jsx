// 📁 src/components/Toast.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// --- Event helper pour déclencher un toast hors React (ex: dans api.js)
export function toastEvent(detail) {
  window.dispatchEvent(new CustomEvent("app:toast", { detail }));
}

// --- Contexte
const ToastContext = createContext(null);

// Types acceptés: "info" | "success" | "error"
const TYPE_STYLES = {
  info:    { base: "bg-brand text-white", icon: "ℹ︎" },
  success: { base: "bg-green-600 text-white", icon: "✓" },
  error:   { base: "bg-red-600 text-white", icon: "!" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    const item = {
      id,
      type: t.type || "info",
      title: t.title || "",
      description: t.description || "",
      duration: typeof t.duration === "number" ? t.duration : 3500,
    };
    setToasts((arr) => [...arr, item]);
    if (item.duration > 0) setTimeout(() => remove(id), item.duration);
    return id;
  }, [remove]);

  // Écoute les événements globaux "app:toast" (ex: envoyés depuis api.js)
  useEffect(() => {
    const onEvt = (e) => push(e.detail || {});
    window.addEventListener("app:toast", onEvt);
    return () => window.removeEventListener("app:toast", onEvt);
  }, [push]);

  const value = useMemo(() => ({
    push,
    info:   (title, description = "", duration) => push({ type: "info", title, description, duration }),
    success:(title, description = "", duration) => push({ type: "success", title, description, duration }),
    error:  (title, description = "", duration) => push({ type: "error", title, description, duration }),
    remove,
  }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// --- Rendu visuel du conteneur
function ToastViewport({ toasts, onClose }) {
  const firstRender = useRef(true);
  useEffect(() => { firstRender.current = false; }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-[min(92vw,380px)]">
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;
        return (
          <div
            key={t.id}
            role="status"
            className={`rounded-xl shadow-lg ${s.base} px-4 py-3 border border-black/5`}
          >
            <div className="flex items-start gap-3">
              <div className="text-lg leading-none select-none">{s.icon}</div>
              <div className="flex-1">
                {t.title && <div className="font-semibold">{t.title}</div>}
                {t.description && <div className="opacity-90 text-sm mt-0.5">{t.description}</div>}
              </div>
              <button
                onClick={() => onClose(t.id)}
                className="text-white/85 hover:text-white text-sm px-2 -m-2"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
