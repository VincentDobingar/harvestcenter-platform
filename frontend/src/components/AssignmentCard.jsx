// src/components/AssignmentCard.jsx

export default function AssignmentCard({ a, onOpen }) {
  return (
    <div className="rounded-2xl border p-4 bg-white hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold">{a.title}</h4>
          <p className="text-sm text-gray-600">
            {a.type?.toUpperCase()} • {a.due_at ? `Échéance: ${new Date(a.due_at).toLocaleString()}` : "Pas d'échéance"}
          </p>
        </div>
        <button onClick={onOpen} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm">Voir</button>
      </div>
    </div>
  );
}
