// 📁 src/components/ToastProvider.jsx
import { Toaster } from "react-hot-toast";

/**
 * 🌍 ToastProvider
 *
 * Fournit un contexte global pour les notifications (`react-hot-toast`).
 * À placer tout en haut de l'application (voir App.jsx).
 *
 * Pour déclencher une notification, utiliser les helpers de
 * `@/utils/notify` (`notifySuccess`, `notifyError`) plutôt que
 * d'importer `react-hot-toast` directement.
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
              primary: "#16a34a",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}
