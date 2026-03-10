// src/pages/admin/AdminStudentDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import toast from "react-hot-toast";

/**
 * AdminStudentDetail
 * - GET /api/admin/students/:id
 * - PATCH /api/admin/students/:id/payment
 */
export default function AdminStudentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paid, setPaid] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchStudent() {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/students/${id}`);
      const data = res.data?.student ?? res.data ?? null;
      setStudent(data);
      setPaid(((data?.payment_status || "") .toString().toLowerCase() === "paid"));
      setAmount(data?.amount_paid ?? "");
    } catch (err) {
      console.error("fetchStudent error:", err);
      toast.error("Impossible de charger l'étudiant.");
    } finally {
      setLoading(false);
    }
  }

  async function savePayment() {
    if (!student) return;
    setSavingPayment(true);
    try {
      const body = { paid, amount: amount === "" ? null : Number(amount) };
      const res = await api.patch(`/api/admin/students/${student.id}/payment`, body);
      const updated = res.data?.student ?? null;
      setStudent((s) => ({ ...s, ...updated }));
      toast.success("Paiement mis à jour.");
    } catch (err) {
      console.error("savePayment error:", err);
      toast.error("Impossible de mettre à jour le paiement.");
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!student) return <div className="p-6">Étudiant introuvable.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{student.full_name || student.name || student.nom || "—"}</h2>
          <div className="text-sm text-gray-600">{student.email}</div>
        </div>
        <div>
          <button onClick={() => nav("/admin/students", { replace: true })} className="px-3 py-2 border rounded">Retour</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold mb-2">Profil</h3>
          <div className="text-sm"><strong>ID:</strong> {student.id}</div>
          <div className="text-sm"><strong>Username:</strong> {student.username}</div>
          <div className="text-sm"><strong>Inscrit le:</strong> {student.created_at || student.createdAt || "—"}</div>
          <div className="text-sm"><strong>Role:</strong> {student.role || "student"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Paiement</h3>
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
              <span>{paid ? "Payé" : "Non payé"}</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant payé"
              className="border rounded px-3 py-2 w-36"
            />
            <button onClick={savePayment} disabled={savingPayment} className="px-3 py-2 bg-blue-600 text-white rounded">
              {savingPayment ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>

          <h3 className="font-semibold mb-2 mt-4">Cours inscrits</h3>
          {Array.isArray(student.courses) && student.courses.length ? (
            <ul className="list-disc pl-5">
              {student.courses.map((c) => (
                <li key={c.id || c.course_id}>
                  {c.title || c.name || `Cours #${c.id || c.course_id}`} — {c.progress ? `${c.progress}%` : "—"}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Aucun cours trouvé.</div>
          )}

          <h3 className="font-semibold mb-2 mt-4">Notes & progression</h3>
          {Array.isArray(student.grades) && student.grades.length ? (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr><th className="py-1 text-left">Cours</th><th className="py-1 text-left">Note</th></tr>
              </thead>
              <tbody>
                {student.grades.map((g, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1">{g.course_title || g.course_name || g.course_id}</td>
                    <td className="py-1">{g.grade ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-gray-500">Aucune note trouvée.</div>
          )}
        </div>
      </div>
    </div>
  );
}
