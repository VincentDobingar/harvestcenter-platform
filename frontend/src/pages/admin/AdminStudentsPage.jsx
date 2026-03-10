// src/pages/admin/AdminStudentsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/students")
      .then((res) => {
        setStudents(res.data);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des étudiants :", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePaid = async (id, currentStatus) => {
    try {
      const res = await axios.put(`/api/admin/students/${id}/payment`, {
        paid: !currentStatus,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, paid: res.data.paid } : s
        )
      );
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Chargement...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Liste des étudiants inscrits</h1>

      {students.length === 0 ? (
        <p>Aucun étudiant inscrit pour le moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} className="shadow-md">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold">
                  {student.nom} {student.prenom}
                </h2>
                <p className="text-sm text-gray-600">{student.email}</p>
                <p className="text-sm mt-2">
                  Statut :{" "}
                  <span
                    className={
                      student.paid
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {student.paid ? "Payé" : "Non payé"}
                  </span>
                </p>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant={student.paid ? "outline" : "default"}
                    onClick={() => togglePaid(student.id, student.paid)}
                  >
                    {student.paid ? "Marquer non payé" : "Valider paiement"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
