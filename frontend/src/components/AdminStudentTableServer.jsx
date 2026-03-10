// src/components/AdminStudentTableServer.jsx
import React from "react";
import { normalizePath } from "@/utils/url";

/**
 * AdminStudentTableServer
 * - variant server-side friendly / class-like usage
 * - props:
 *    - students: []
 *    - onOpenDetails: optional function(student) => void
 *
 * If onOpenDetails is not provided, uses normalized window.location.href fallback.
 */
export default function AdminStudentTableServer({ students = [], onOpenDetails }) {
  function defaultOpenDetails(s) {
    const path = normalizePath(`/admin/etudiants/${s.id}`);
    // fallback: full page navigation but normalized to avoid double '//'
    window.location.href = path;
  }

  const openDetails = (s) => (typeof onOpenDetails === "function" ? onOpenDetails(s) : defaultOpenDetails(s));

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Nom</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students && students.length ? (
              students.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{s.id}</td>
                  <td className="py-2 px-2">{s.full_name || s.nom || "—"}</td>
                  <td className="py-2 px-2">{s.email || "—"}</td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => openDetails(s)}
                      className="text-sm px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  Aucun étudiant trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
