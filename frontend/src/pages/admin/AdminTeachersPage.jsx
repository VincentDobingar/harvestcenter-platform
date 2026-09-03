// src/pages/admin/AdminTeachersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [assignClassId, setAssignClassId] = useState("");
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
    fetchCourses();
    fetchSubjects();
  }, []);

  async function fetchTeachers(filters = {}) {
    try {
      setLoading(true);

      const params = {};
      if (filters.q?.trim()) params.q = filters.q.trim();
      if (filters.subject?.trim()) params.subject = filters.subject.trim();
      if (filters.classFilter?.trim()) params.class_name = filters.classFilter.trim();

      const res = await api.get("/admin/teachers", { params });
      const rows = Array.isArray(res.data) ? res.data : res.data?.rows ?? [];
      setTeachers(rows);
    } catch (err) {
      console.error("fetchTeachers error", err);
      toast.error("Erreur lors du chargement des formateurs.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchClasses() {
    try {
      const res = await api.get("/admin/classes");
      const rows = Array.isArray(res.data) ? res.data : [];
      setClasses(rows);
    } catch (err) {
      console.error("fetchClasses error", err);
      toast.error("Impossible de charger les classes.");
    }
  }

  async function fetchCourses() {
    try {
      const res = await api.get("/admin/courses");
      const rows = Array.isArray(res.data) ? res.data : [];
      setCourses(rows);
    } catch (err) {
      console.error("fetchCourses error", err);
      toast.error("Impossible de charger les cours.");
    }
  }

  async function fetchSubjects() {
    try {
      const res = await api.get("/admin/subjects");
      const rows = Array.isArray(res.data) ? res.data : [];
      setSubjects(rows);
    } catch (err) {
      console.error("fetchSubjects error", err);
      toast.error("Impossible de charger les matières.");
    }
  }

  async function assignClass() {
    if (!selectedTeacher?.id || !assignClassId) {
      toast.error("Sélectionne une classe.");
      return;
    }

    try {
      const res = await api.post(
        `/admin/teachers/${selectedTeacher.id}/assign-class`,
        { class_id: Number(assignClassId) }
      );

      const updatedTeacher = res.data?.teacher;
      if (updatedTeacher) {
        setSelectedTeacher(updatedTeacher);
        setTeachers((prev) =>
          prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
        );
      }

      setAssignClassId("");
      toast.success("Classe affectée avec succès.");
    } catch (err) {
      console.error("assignClass error", err);
      toast.error("Impossible d’affecter la classe.");
    }
  }

  async function removeClass(classId) {
    if (!selectedTeacher?.id || !classId) return;

    try {
      const res = await api.delete(
        `/admin/teachers/${selectedTeacher.id}/classes/${classId}`
      );

      const updatedTeacher = res.data?.teacher;
      if (updatedTeacher) {
        setSelectedTeacher(updatedTeacher);
        setTeachers((prev) =>
          prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
        );
      }

      toast.success("Affectation classe supprimée.");
    } catch (err) {
      console.error("removeClass error", err);
      toast.error("Impossible de supprimer cette affectation.");
    }
  }

  async function assignCourse() {
    if (!selectedTeacher?.id || !assignCourseId) {
      toast.error("Sélectionne un cours.");
      return;
    }

    try {
      const res = await api.post(
        `/admin/teachers/${selectedTeacher.id}/assign-course`,
        { course_id: Number(assignCourseId) }
      );

      const updatedTeacher = res.data?.teacher;
      if (updatedTeacher) {
        setSelectedTeacher(updatedTeacher);
        setTeachers((prev) =>
          prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
        );
      }

      setAssignCourseId("");
      toast.success("Cours affecté avec succès.");
    } catch (err) {
      console.error("assignCourse error", err);
      toast.error("Impossible d’affecter ce cours.");
    }
  }

  async function removeCourse(courseId) {
    if (!selectedTeacher?.id || !courseId) return;

    try {
      const res = await api.delete(
        `/admin/teachers/${selectedTeacher.id}/courses/${courseId}`
      );

      const updatedTeacher = res.data?.teacher;
      if (updatedTeacher) {
        setSelectedTeacher(updatedTeacher);
        setTeachers((prev) =>
          prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
        );
      }

      toast.success("Affectation cours supprimée.");
    } catch (err) {
      console.error("removeCourse error", err);
      toast.error("Impossible de supprimer cette affectation.");
    }
  }

  async function assignSubject() {
    if (!selectedTeacher?.id || !assignSubjectId) {
      toast.error("Sélectionne une matière.");
      return;
    }

    try {
      const res = await api.post(
        `/admin/teachers/${selectedTeacher.id}/assign-subject`,
        { subject_id: Number(assignSubjectId) }
      );

      const updatedTeacher = res.data?.teacher;
      if (updatedTeacher) {
        setSelectedTeacher(updatedTeacher);
        setTeachers((prev) =>
          prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
        );
      }

      setAssignSubjectId("");
      toast.success("Matière affectée avec succès.");
    } catch (err) {
      console.error("assignSubject error", err);
      toast.error("Impossible d’affecter cette matière.");
    }
  }

  async function removeSubject(subjectId) {
    if (!selectedTeacher?.id || !subjectId) return;

    try {
      const res = await api.delete(
        `/admin/teachers/${selectedTeacher.id}/subjects/${subjectId}`
      );

      const updatedTeacher = res.data?.teacher;
      if (updatedTeacher) {
        setSelectedTeacher(updatedTeacher);
        setTeachers((prev) =>
          prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
        );
      }

      toast.success("Affectation matière supprimée.");
    } catch (err) {
      console.error("removeSubject error", err);
      toast.error("Impossible de supprimer cette affectation.");
    }
  }

  async function copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email || "");
      toast.success("Email copié");
    } catch {
      toast.error("Impossible de copier l’email.");
    }
  }

  const subjectOptions = useMemo(() => {
    return [...new Set(subjects.map((s) => s.name).filter(Boolean))];
  }, [subjects]);

  const classOptions = useMemo(() => {
    return [...new Set(classes.map((c) => c.name).filter(Boolean))];
  }, [classes]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Formateurs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestion des enseignants par matière, classe et cours.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom ou email…"
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            />

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            >
              <option value="">Toutes les matières</option>
              {subjectOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            >
              <option value="">Toutes les classes</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <Button onClick={() => fetchTeachers({ q, subject, classFilter })}>
              Rechercher
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setSubject("");
                setClassFilter("");
                fetchTeachers();
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          Chargement…
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          Aucun formateur trouvé.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.95fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {teachers.map((teacher) => {
              const fullName =
                teacher.full_name ||
                `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
                teacher.email;

              return (
                <Card key={teacher.id || teacher.email} className="rounded-2xl shadow-sm">
                  <CardContent className="p-5">
                    <div className="space-y-2">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {fullName}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {teacher.email || "—"}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-600">
                        <div><strong>Matière :</strong> {teacher.subject_name || "—"}</div>
                        <div>
                          <strong>Classe(s) :</strong>{" "}
                          {Array.isArray(teacher.classes) && teacher.classes.length > 0
                            ? teacher.classes.join(", ")
                            : "—"}
                        </div>
                        <div>
                          <strong>Cours :</strong>{" "}
                          {Array.isArray(teacher.courses) && teacher.courses.length > 0
                            ? teacher.courses.join(", ")
                            : "—"}
                        </div>
                        <div><strong>Statut :</strong> {teacher.status || "active"}</div>
                      </div>

                      <div className="pt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          Voir détails
                        </Button>

                        <Button onClick={() => copyEmail(teacher.email)}>
                          Copier email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedTeacher ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedTeacher.full_name ||
                        `${selectedTeacher.first_name || ""} ${selectedTeacher.last_name || ""}`.trim() ||
                        "Formateur"}
                    </h2>
                    <p className="text-sm text-slate-500">Profil enseignant</p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setSelectedTeacher(null)}
                  >
                    Fermer
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong>Email :</strong> {selectedTeacher.email || "—"}</p>
                  <p><strong>Username :</strong> {selectedTeacher.username || "—"}</p>
                  <p><strong>Matière principale :</strong> {selectedTeacher.subject_name || "—"}</p>
                  <p><strong>Téléphone :</strong> {selectedTeacher.phone || "—"}</p>
                  <p><strong>Statut :</strong> {selectedTeacher.status || "active"}</p>
                </div>

                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Classes affectées</h3>
                  {Array.isArray(selectedTeacher.classes) && selectedTeacher.classes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.classes.map((clsName, index) => {
                        const clsId = selectedTeacher.class_ids?.[index];
                        return (
                          <div
                            key={`${clsName}-${clsId || index}`}
                            className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                          >
                            <span>{clsName}</span>
                            {clsId ? (
                              <button
                                onClick={() => removeClass(clsId)}
                                className="text-red-600"
                              >
                                ×
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Aucune classe affectée.</div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <h3 className="font-semibold">Affecter une classe</h3>
                  <div className="flex gap-2">
                    <select
                      value={assignClassId}
                      onChange={(e) => setAssignClassId(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5"
                    >
                      <option value="">Choisir une classe</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={assignClass}>Affecter</Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Cours affectés</h3>
                  {Array.isArray(selectedTeacher.courses) && selectedTeacher.courses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.courses.map((courseTitle, index) => {
                        const courseId = selectedTeacher.course_ids?.[index];
                        return (
                          <div
                            key={`${courseTitle}-${courseId || index}`}
                            className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                          >
                            <span>{courseTitle}</span>
                            {courseId ? (
                              <button
                                onClick={() => removeCourse(courseId)}
                                className="text-red-600"
                              >
                                ×
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Aucun cours affecté.</div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <h3 className="font-semibold">Affecter un cours</h3>
                  <div className="flex gap-2">
                    <select
                      value={assignCourseId}
                      onChange={(e) => setAssignCourseId(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5"
                    >
                      <option value="">Choisir un cours</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <Button onClick={assignCourse}>Affecter</Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Matières affectées</h3>
                  {Array.isArray(selectedTeacher.subjects) && selectedTeacher.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.subjects.map((subjectName, index) => {
                        const subjectId = selectedTeacher.subject_ids?.[index];
                        return (
                          <div
                            key={`${subjectName}-${subjectId || index}`}
                            className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                          >
                            <span>{subjectName}</span>
                            {subjectId ? (
                              <button
                                onClick={() => removeSubject(subjectId)}
                                className="text-red-600"
                              >
                                ×
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Aucune matière affectée.</div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <h3 className="font-semibold">Affecter une matière</h3>
                  <div className="flex gap-2">
                    <select
                      value={assignSubjectId}
                      onChange={(e) => setAssignSubjectId(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5"
                    >
                      <option value="">Choisir une matière</option>
                      {subjects.map((subjectItem) => (
                        <option key={subjectItem.id} value={subjectItem.id}>
                          {subjectItem.name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={assignSubject}>Affecter</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">
                Sélectionne un formateur pour gérer ses affectations.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}