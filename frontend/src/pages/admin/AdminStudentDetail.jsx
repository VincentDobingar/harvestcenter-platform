// src/pages/admin/AdminStudentDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchStudent();
  }, [id]);

  async function fetchStudent() {
    try {
      setLoading(true);

      const res = await api.get(`/admin/students/${id}`);
      const data = res.data?.student ?? res.data ?? null;

      setStudent(data);
      setPaid(Boolean(data?.paid));
    } catch (err) {
      console.error("fetchStudent error:", err);
      toast.error("Impossible de charger l'étudiant.");
    } finally {
      setLoading(false);
    }
  }

  async function savePayment() {
    if (!student) return;

    try {
      setSavingPayment(true);

      const res = await api.patch(`/admin/students/${student.id}/payment`, {
        paid,
      });

      const updated = res.data?.student ?? {};
      setStudent((prev) => ({ ...prev, ...updated }));
      setPaid(Boolean(res.data?.paid ?? updated?.paid ?? paid));

      toast.success("Paiement mis à jour.");
    } catch (err) {
      console.error("savePayment error:", err);
      toast.error("Impossible de mettre à jour le paiement.");
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) {
    return <div className="p-6">Chargement…</div>;
  }

  if (!student) {
    return <div className="p-6">Étudiant introuvable.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {student.full_name ||
              `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
              student.name ||
              "Étudiant"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{student.email || "—"}</p>
        </div>

        <Button variant="outline" onClick={() => navigate("/admin/students")}>
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Profil</h2>

          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>ID :</strong> {student.id}</p>
            <p><strong>Prénom :</strong> {student.first_name || "—"}</p>
            <p><strong>Nom :</strong> {student.last_name || "—"}</p>
            <p><strong>Username :</strong> {student.username || "—"}</p>
            <p><strong>Rôle :</strong> {student.role || "student"}</p>
            <p><strong>Statut :</strong> {student.status || "—"}</p>
            <p><strong>Créé le :</strong> {student.created_at || "—"}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Paiement</h2>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              <span>{paid ? "Payé" : "Non payé"}</span>
            </label>

            <Button onClick={savePayment} disabled={savingPayment}>
              {savingPayment ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>

          <div className="text-sm text-slate-600">
            Statut actuel :{" "}
            <span className={paid ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
              {paid ? "Payé" : "Non payé"}
            </span>
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">
            Cours inscrits
          </h2>
          {Array.isArray(student.courses) && student.courses.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {student.courses.map((course) => (
                <li key={course.id || course.course_id}>
                  {course.title || course.name || `Cours #${course.id || course.course_id}`}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-500">Aucun cours trouvé.</div>
          )}

          <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">
            Notes & progression
          </h2>
          {Array.isArray(student.grades) && student.grades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="py-2 text-left">Cours</th>
                    <th className="py-2 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {student.grades.map((grade, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {grade.course_title || grade.course_name || grade.course_id || "—"}
                      </td>
                      <td className="py-2">{grade.grade ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Aucune note trouvée.</div>
          )}
        </div>
      </div>
    </div>
  );
}