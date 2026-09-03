// src/pages/admin/AdminStudentsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminStudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const res = await api.get("/admin/students");
      const rows = Array.isArray(res.data) ? res.data : res.data?.rows ?? [];
      setStudents(rows);
    } catch (err) {
      console.error("Erreur lors du chargement des étudiants :", err);
      toast.error("Impossible de charger les étudiants.");
    } finally {
      setLoading(false);
    }
  }

  async function togglePaid(id, currentStatus) {
    try {
      const res = await api.patch(`/admin/students/${id}/payment`, {
        paid: !currentStatus,
      });

      const updatedPaid =
        res.data?.paid ??
        res.data?.student?.paid ??
        !currentStatus;

      setStudents((prev) =>
        prev.map((student) =>
          student.id === id ? { ...student, paid: updatedPaid } : student
        )
      );

      toast.success("Statut de paiement mis à jour.");
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      toast.error("Impossible de mettre à jour le paiement.");
    }
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Étudiants inscrits
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestion des étudiants et suivi du paiement d’inscription.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          Aucun étudiant inscrit pour le moment.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} className="rounded-2xl shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {student.full_name ||
                      `${student.nom || ""} ${student.prenom || ""}`.trim() ||
                      "Étudiant"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {student.email || "—"}
                  </p>
                </div>

                <p className="text-sm">
                  Statut paiement :{" "}
                  <span
                    className={
                      student.paid
                        ? "font-semibold text-green-600"
                        : "font-semibold text-red-600"
                    }
                  >
                    {student.paid ? "Payé" : "Non payé"}
                  </span>
                </p>

                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/students/${student.id}`)}
                  >
                    Détails
                  </Button>

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