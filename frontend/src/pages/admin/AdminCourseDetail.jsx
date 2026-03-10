// src/pages/admin/AdminCourseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import AdminCourseAssign from "@/pages/admin/AdminCourseAssign";

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (id) fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchCourse() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/courses/${id}`);
      // backend may return { course } or course directly
      const data = res.data?.course ?? res.data ?? null;
      setCourse(data);
    } catch (err) {
      console.error("fetchCourse error", err);
      setError("Impossible de charger le cours.");
    } finally {
      setLoading(false);
    }
  }

  function openAssign() {
    setAssignModal({ courseId: course?.id || id, courseTitle: course?.title || course?.name });
  }
  function closeAssign() {
    setAssignModal(null);
  }

  async function handleAssign(courseId, teacherId) {
    try {
      await api.post(`/api/admin/courses/${courseId}/assign`, { teacher_id: Number(teacherId) });
      alert("Formateur assigné.");
      closeAssign();
      fetchCourse();
    } catch (err) {
      console.error("assign error", err);
      alert("Erreur lors de l'assignation.");
    }
  }

  async function toggleActive() {
    if (!course) return;
    setToggling(true);
    try {
      const newStatus = !course.active;
      await api.patch(`/api/admin/courses/${course.id}/status`, { active: !!newStatus });
      setCourse((c) => ({ ...c, active: !!newStatus }));
    } catch (err) {
      console.error("toggleActive error", err);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!course) return <div className="p-6 text-gray-500">Cours introuvable.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{course.title || course.name || `Cours #${course.id}`}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          <Button onClick={fetchCourse}>Rafraîchir</Button>
        </div>
      </div>

      <Card>
        <CardHeader>Informations</CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-2">{course.description || "—"}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
            <div><strong>Durée:</strong> {course.duration || "—"}</div>
            <div><strong>Niveau:</strong> {course.level || "—"}</div>
            <div><strong>Statut:</strong> {course.active ? <span className="text-green-600">Actif</span> : <span className="text-red-600">Inactif</span>}</div>
          </div>

          <div className="mt-3 text-sm">
            <strong>Formateur:</strong>{" "}
            {course.teacher ? (
              <span>{course.teacher.full_name || course.teacher.name || course.teacher.email}</span>
            ) : (
              <em className="text-gray-500">Aucun formateur assigné</em>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={openAssign}>Assigner formateur</Button>
            <Button onClick={toggleActive} disabled={toggling}>
              {toggling ? "Mise à jour…" : (course.active ? "Désactiver" : "Activer")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>Étudiants inscrits</CardHeader>
        <CardContent>
          {Array.isArray(course.students) && course.students.length ? (
            <div className="space-y-2">
              {course.students.map((s) => (
                <div key={s.id || s.student_id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{s.full_name || s.nom || s.email}</div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </div>
                  <div className="text-sm text-gray-600">{s.payment_status || (s.paid ? "Payé" : "Non payé")}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Aucun étudiant inscrit.</div>
          )}
        </CardContent>
      </Card>

      {assignModal && (
        <AdminCourseAssign
          courseId={assignModal.courseId}
          courseTitle={assignModal.courseTitle}
          onClose={closeAssign}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
