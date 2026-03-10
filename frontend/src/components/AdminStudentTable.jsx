// src/components/AdminStudentTable.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { normalizePath } from "@/utils/url";

/**
 * AdminStudentTable
 * Props:
 *  - students: array of student objects { id, full_name, email, ... }
 *  - onOpenDetails?: optional override function (student) => void
 *
 * This component uses React Router navigation by default (navigate(path, {replace:true}))
 * to avoid full page reloads and to prevent double slashes.
 */
export default function AdminStudentTable({ students = [], onOpenDetails: onOpenDetailsProp }) {
  const navigate = useNavigate();

  function handleOpenDetails(s) {
    if (typeof onOpenDetailsProp === "function") {
      return onOpenDetailsProp(s);
    }
    const path = normalizePath(`/admin/etudiants/${s.id}`);
    navigate(path, { replace: true });
  }

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
                      onClick={() => handleOpenDetails(s)}
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
