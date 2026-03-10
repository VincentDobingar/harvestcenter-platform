import React, { useEffect, useState } from "react";
import api from "@/utils/api";

export default function StudentRanking() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    api.get("/student/ranking")
      .then(res => setRanking(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">🏆 Classement</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Rang</th>
            <th className="p-2">Nom</th>
            <th className="p-2">Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((r, index) => (
            <tr key={r.id} className="border-t">
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2">{r.full_name}</td>
              <td className="p-2 text-center">{Number(r.average_score).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
