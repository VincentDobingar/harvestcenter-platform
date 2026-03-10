// src/pages/Assignments.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/utils/api";

export default function Assignments() {
  const [assignments, setAssignments] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/assignments");
        setAssignments(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr("Impossible de charger les devoirs");
        setAssignments([]);
      }
    })();
  }, []);

  if (assignments === null) {
    return <div className="p-4">Chargement…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mes devoirs</h1>

      {err && <div className="text-red-600">{err}</div>}

      {assignments.length === 0 ? (
        <p className="text-gray-500">Aucun devoir disponible.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl bg-white shadow p-4 space-y-2"
            >
              <h3 className="font-semibold">{a.title}</h3>

              <p className="text-sm text-gray-600">
                {a.description?.slice(0, 120) || "—"}
              </p>

              <div className="text-sm">
                Cours : {a.course_title}
              </div>

              <div className="text-sm">
                Échéance :{" "}
                {a.deadline
                  ? new Date(a.deadline).toLocaleString()
                  : "—"}
              </div>

              <Link
                to={`/assignments/${a.id}`}
                className="block text-center bg-blue-600 text-white rounded-lg py-2"
              >
                Ouvrir
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
