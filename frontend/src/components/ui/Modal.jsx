// src/ui/Modal.jsx

import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-3xl" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* content */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className={`w-[92vw] ${maxWidth} bg-white rounded-2xl shadow-xl overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-base font-semibold text-blue-800">{title}</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
