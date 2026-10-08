// src/utils/notify.js
import { toast } from "react-hot-toast";

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
