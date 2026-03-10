// src/pages/admin/AdminCourseAssign.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

/**
 * AdminCourseAssign
 * Props:
 * - courseId
 * - courseTitle
 * - onClose()
 * - onAssign(courseId, teacherId)  -> handler called after successful assignment
 */
export default function AdminCourseAssign({ courseId, courseTitle, onClose = () => {}, onAssign = () => {} }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/teachers");
      // backend returns array
      setTeachers(res.data ?? []);
      if ((res.data ?? []).length > 0) setSelected((res.data ?? [])[0].id);
    } catch (err) {
      console.error("fetchTeachers error", err);
      setError("Impossible de charger la liste des formateurs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selected) return setError("Choisir un formateur.");
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/api/admin/courses/${courseId}/assign`, { teacher_id: Number(selected) });
      onAssign(courseId, selected);
    } catch (err) {
      console.error("assign error", err);
      setError(err?.response?.data?.error || "Erreur lors de l'assignation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader>
            Assigner un formateur — {courseTitle || `Cours #${courseId}`}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Chargement des formateurs…</div>
            ) : (
              <>
                {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
                <div className="mb-3">
                  <label className="block text-sm mb-1">Choisir un formateur</label>
                  <select
                    className="w-full border rounded p-2"
                    value={selected ?? ""}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="" disabled>-- Sélectionner --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name ?? t.name ?? t.email ?? `#${t.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-gray-500">
                  Si la liste est vide, vérifie que des utilisateurs ont bien le rôle formateur.
                </div>
              </>
            )}
          </CardContent>

          <CardFooter>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
              <Button onClick={handleAssign} disabled={submitting || loading}>
                {submitting ? "Assignation…" : "Assigner"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
