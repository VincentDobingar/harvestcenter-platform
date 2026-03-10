// src/pages/admin/AdminClassDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import AdminCourseAssign from "@/pages/admin/AdminCourseAssign";

export default function AdminClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [klass, setKlass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null); // { courseId, courseTitle }
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchClass() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/admin/classes/${id}`);
      // backend returns { class: klass }
      const data = res.data?.class ?? res.data ?? null;
      setKlass(data);
    } catch (err) {
      console.error("fetchClass error", err);
      setError("Impossible de charger la classe.");
    } finally {
      setLoading(false);
    }
  }

  function openAssign(course) {
    setAssignModal({ courseId: course.id ?? course.course_id, courseTitle: course.title ?? course.name });
  }
  function closeAssign() {
    setAssignModal(null);
  }

  async function handleAssign(courseId, teacherId) {
    try {
      await api.post(`/api/admin/courses/${courseId}/assign`, { teacher_id: Number(teacherId) });
      // feedback + refresh
      alert("Formateur assigné.");
      closeAssign();
      fetchClass();
    } catch (err) {
      console.error("assign error", err);
      alert("Erreur lors de l'assignation.");
    }
  }

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!klass) return <div className="p-6 text-gray-500">Classe introuvable.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{klass.title || klass.name || `Classe #${klass.id}`}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          <Button onClick={fetchClass}>Rafraîchir</Button>
        </div>
      </div>

      <Card>
        <CardHeader>Infos</CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-2">{klass.description || "—"}</p>
          <div className="text-xs text-gray-500">Créée le : {klass.created_at ? new Date(klass.created_at).toLocaleString() : "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Cours rattachés</CardHeader>
        <CardContent>
          {Array.isArray(klass.courses) && klass.courses.length ? (
            <div className="space-y-3">
              {klass.courses.map((c) => (
                <div key={c.id || c.course_id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{c.title || c.name || `Cours #${c.id || c.course_id}`}</div>
                    <div className="text-xs text-gray-500">{c.description || ""}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open(`/admin/courses/${c.id || c.course_id}`, "_self")}>Détails</Button>
                    <Button onClick={() => openAssign(c)}>Assigner formateur</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Aucun cours rattaché.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Emplois du temps</CardHeader>
        <CardContent>
          {Array.isArray(klass.timetables) && klass.timetables.length ? (
            <ul className="list-disc pl-5 text-sm">
              {klass.timetables.map((t) => (
                <li key={t.id}>
                  {t.course_title || t.course_name || `Cours #${t.course_id}`} — {t.starts_at ? new Date(t.starts_at).toLocaleString() : t.starts_at} à {t.ends_at ? new Date(t.ends_at).toLocaleString() : t.ends_at}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Aucun emploi du temps enregistré.</div>
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
