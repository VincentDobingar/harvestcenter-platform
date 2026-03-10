// 📁 src/pages/Assignments.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/utils/api";
import { asArray } from "@/utils/asArray";

export default function Assignments() {
  const [assignments, setAssignments] = useState(null); // null = loading
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/assignments");
        setAssignments(asArray(data));
      } catch (e) {
        setErr(e?.response?.data?.error || "Impossible de charger les devoirs");
        setAssignments([]); // évite .map sur non-array
      }
    })();
  }, []);

  if (assignments === null) return <div className="p-4">Chargement…</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mes devoirs</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {asArray(assignments).map((a) => (
          <div key={a.id} className="rounded-2xl bg-white shadow p-4 space-y-2">
            <h3 className="card-title">{a.title}</h3>
            <p className="text-sm text-gray-600">
              {a.instructions ? String(a.instructions).slice(0, 140) : "—"}
            </p>
            <div className="text-sm">
              Échéance : {a.due_at ? new Date(a.due_at).toLocaleString() : "—"}
            </div>
            <div className="text-sm text-gray-600">Barème : {a.max_score ?? 20}</div>
            <Link to={`/assignments/${a.id}`} className="btn-brand w-full text-center">
              Ouvrir
            </Link>
          </div>
        ))}
      </div>

      {asArray(assignments).length === 0 && (
        <p className="text-sm text-gray-600">Aucun devoir pour l’instant.</p>
      )}
    </div>
  );
}
