// 📁 src/components/ToastProvider.jsx
import React from "react";
import { Toaster, toast } from "react-hot-toast";

/**
 * 🌍 ToastProvider
 *
 * Fournit un contexte global pour les notifications (`react-hot-toast`).
 * 
 * 💡 À placer tout en haut de ton application (comme tu l’as déjà fait dans App.jsx) :
 * ```jsx
 * <BrowserRouter>
 *   <ToastProvider>
 *     <AuthProvider>
 *       <AppRoutes />
 *     </AuthProvider>
 *   </ToastProvider>
 * </BrowserRouter>
 * ```
 *
 * ➕ Tu peux ensuite utiliser les toasts dans n’importe quel composant :
 * ```js
 * import { toast } from "react-hot-toast";
 * toast.success("Opération réussie !");
 * toast.error("Une erreur est survenue");
 * ```
 */

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #eee",
            fontSize: "0.9rem",
          },
          success: {
            iconTheme: {
              primary: "#16a34a", // vert Tailwind
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626", // rouge Tailwind
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}

/* -------------------------------------------------------
   💡 Helpers optionnels (facultatifs)
   Tu peux les importer depuis ce fichier :
   import { notifySuccess, notifyError } from "@/components/ToastProvider";
------------------------------------------------------- */
export function notifySuccess(msg) {
  toast.success(msg || "Opération réussie !");
}

export function notifyError(err) {
  let message =
    typeof err === "string"
      ? err
      : err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Une erreur est survenue";
  toast.error(message);
}
