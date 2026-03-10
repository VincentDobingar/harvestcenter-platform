// src/pages/admin/AdminClassesPage.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminCourseAssign from "./AdminCourseAssign"; // si tu as déjà ce composant, sinon je peux le générer

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(null); // { courseId, courseTitle }
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/classes");
      const rows = res.data?.rows ?? res.data ?? [];
      setClasses(rows);
    } catch (err) {
      console.error("fetchClasses error", err);
      setError("Impossible de charger les classes.");
    } finally {
      setLoading(false);
    }
  }

  function openAssign(course) {
    setAssigning({ courseId: course.id || course.course_id, courseTitle: course.title || course.name });
  }
  function closeAssign() {
    setAssigning(null);
  }

  async function handleAssign(courseId, teacherId) {
    try {
      await api.post(`/api/admin/courses/${courseId}/assign`, { teacher_id: teacherId });
      // feedback + refresh
      alert("Cours assigné.");
      closeAssign();
      fetchClasses();
    } catch (err) {
      console.error("assign error", err);
      alert("Erreur lors de l'assignation.");
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Gestion des classes</h2>
        <div className="flex gap-2">
          <Button onClick={fetchClasses} variant="outline">Rafraîchir</Button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="py-6 text-center">Chargement…</div>
      ) : classes.length === 0 ? (
        <div className="py-6 text-center text-gray-500">Aucune classe trouvée.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <CardHeader>{c.title || c.name || `Classe #${c.id}`}</CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-2">{c.description || "—"}</div>
                <div className="text-xs text-gray-500">Créée : {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</div>
                {Array.isArray(c.courses) && c.courses.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-semibold">Cours</div>
                    <ul className="text-sm list-disc pl-5">
                      {c.courses.slice(0,5).map((cr) => (
                        <li key={cr.id || cr.course_id}>{cr.title || cr.name || `Cours #${cr.id || cr.course_id}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-end gap-2">
                  <Button onClick={() => window.open(`/admin/classes/${c.id}`, "_self")} variant="outline">Détails</Button>
                  {/* Exemple: assign first course if exists */}
                  {Array.isArray(c.courses) && c.courses[0] && (
                    <Button onClick={() => openAssign(c.courses[0])}>Assigner formateur</Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {assigning && (
        <AdminCourseAssign
          courseId={assigning.courseId}
          courseTitle={assigning.courseTitle}
          onClose={closeAssign}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
