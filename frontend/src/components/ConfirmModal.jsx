// src/components/ConfirmModal.jsx
import React from "react";

/**
 * Props:
 * - open: boolean
 * - title: string
 * - message: string (JSX ok)
 * - confirmLabel?: string
 * - cancelLabel?: string
 * - onConfirm: async fn or fn
 * - onCancel: fn
 */
export default function ConfirmModal({
  open,
  title = "Confirmer",
  message = "Êtes-vous sûr ?",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm = () => {},
  onCancel = () => {},
  loading = false,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-sm text-gray-700 mb-4">{message}</div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded border"
            type="button"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded bg-red-600 text-white"
            type="button"
            disabled={loading}
          >
            {loading ? "Patientez…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
