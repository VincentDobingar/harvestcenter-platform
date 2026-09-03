import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";

export default function StudentRanking() {
  const { t } = useTranslation();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    api
      .get("/student/ranking")
      .then((res) => setRanking(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">{t("studentRankingPage.title")}</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">{t("studentRankingPage.rank")}</th>
            <th className="p-2">{t("studentRankingPage.name")}</th>
            <th className="p-2">{t("studentRankingPage.average")}</th>
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