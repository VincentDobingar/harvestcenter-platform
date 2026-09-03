// src/components/ConfirmModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm = () => {},
  onCancel = () => {},
  loading = false,
}) {
  const { t } = useTranslation();

  if (!open) return null;

  const resolvedTitle = title || t("confirmModal.title");
  const resolvedMessage = message || t("confirmModal.message");
  const resolvedConfirm = confirmLabel || t("confirmModal.confirm");
  const resolvedCancel = cancelLabel || t("confirmModal.cancel");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold mb-2">{resolvedTitle}</h3>
        <div className="text-sm text-gray-700 mb-4">{resolvedMessage}</div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded border"
            type="button"
            disabled={loading}
          >
            {resolvedCancel}
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded bg-red-600 text-white"
            type="button"
            disabled={loading}
          >
            {loading ? t("confirmModal.wait") : resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}