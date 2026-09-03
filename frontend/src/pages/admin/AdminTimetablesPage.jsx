// src/pages/admin/AdminTimetablesPage.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function AdminTimetablesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, []);

  async function fetchTimetables() {
    try {
      setLoading(true);
      const res = await api.get("/admin/timetables");
      const data = Array.isArray(res.data) ? res.data : res.data?.rows ?? [];
      setRows(data);
    } catch (err) {
      console.error("fetchTimetables error:", err);
      toast.error("Impossible de charger l’emploi du temps.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emploi du temps</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultation des séances planifiées.
          </p>
        </div>

        <Button variant="outline" onClick={fetchTimetables}>
          Actualiser
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          Chargement…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          Aucun emploi du temps trouvé.
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Matière</th>
                <th className="px-4 py-3 text-left">Jour</th>
                <th className="px-4 py-3 text-left">Début</th>
                <th className="px-4 py-3 text-left">Fin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-4 py-3">{row.class_name || "—"}</td>
                  <td className="px-4 py-3">{row.subject || "—"}</td>
                  <td className="px-4 py-3">{row.day || "—"}</td>
                  <td className="px-4 py-3">{row.start_time || "—"}</td>
                  <td className="px-4 py-3">{row.end_time || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}