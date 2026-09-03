// src/pages/admin/TimetableManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const EMPTY_FORM = {
  id: null,
  class_id: "",
  course_id: "",
  teacher_id: "",
  day_of_week: "Lundi",
  starts_at: "",
  ends_at: "",
  room: "",
  notes: "",
};

function timeOf(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function toDateTimeLocal(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export default function TimetableManager() {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([fetchLists(), fetchTimetables()]);
  }

  async function fetchLists() {
    try {
      const [classesRes, coursesRes, teachersRes] = await Promise.all([
        api.get("/api/admin/classes").catch(() => ({ data: { rows: [] } })),
        api.get("/api/admin/courses").catch(() => ({ data: [] })),
        api.get("/api/admin/teachers").catch(() => ({ data: [] })),
      ]);

      setClasses(classesRes.data?.rows || classesRes.data || []);
      setCourses(coursesRes.data?.rows || coursesRes.data || []);
      setTeachers(teachersRes.data?.rows || teachersRes.data || []);
    } catch (err) {
      console.error("fetchLists error", err);
      toast.error("Impossible de charger les listes.");
    }
  }

  async function fetchTimetables() {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/timetables");
      setTimetables(res.data?.rows || res.data || []);
    } catch (err) {
      console.error("fetchTimetables error", err);
      toast.error("Impossible de charger les emplois du temps.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function openNew() {
    setForm({
      ...EMPTY_FORM,
      class_id: classes[0]?.id ? String(classes[0].id) : "",
      course_id: courses[0]?.id ? String(courses[0].id) : "",
      teacher_id: teachers[0]?.id ? String(teachers[0].id) : "",
    });
  }

  function openEdit(item) {
    setForm({
      id: item.id,
      class_id: item.class_id ? String(item.class_id) : "",
      course_id: item.course_id ? String(item.course_id) : "",
      teacher_id: item.teacher_id ? String(item.teacher_id) : "",
      day_of_week: item.day_of_week || "Lundi",
      starts_at: toDateTimeLocal(item.starts_at),
      ends_at: toDateTimeLocal(item.ends_at),
      room: item.room || "",
      notes: item.notes || "",
    });
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateForm() {
    if (!form.class_id || !form.course_id || !form.day_of_week || !form.starts_at || !form.ends_at) {
      toast.error("Remplir les champs obligatoires : classe, cours, jour, début et fin.");
      return false;
    }

    const start = new Date(form.starts_at);
    const end = new Date(form.ends_at);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Dates invalides.");
      return false;
    }

    if (end <= start) {
      toast.error("L'heure de fin doit être après l'heure de début.");
      return false;
    }

    return true;
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        class_id: Number(form.class_id),
        course_id: Number(form.course_id),
        teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
        day_of_week: form.day_of_week,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        room: form.room || null,
        notes: form.notes || null,
      };

      if (form.id) {
        await api.patch(`/api/admin/timetables/${form.id}`, payload);
        toast.success("Créneau modifié.");
      } else {
        await api.post("/api/admin/timetables", payload);
        toast.success("Créneau ajouté.");
      }

      await fetchTimetables();
      resetForm();
    } catch (err) {
      console.error("save timetable error", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erreur lors de l'enregistrement.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce créneau ?")) return;

    try {
      await api.delete(`/api/admin/timetables/${id}`);
      toast.success("Créneau supprimé.");
      await fetchTimetables();
    } catch (err) {
      console.error("delete timetable error", err);
      toast.error("Impossible de supprimer.");
    }
  }

  const timetablesByDay = useMemo(() => {
    const grouped = {};
    DAYS.forEach((day) => {
      grouped[day] = [];
    });

    (timetables || []).forEach((item) => {
      const day = item.day_of_week || "Lundi";
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item);
    });

    Object.keys(grouped).forEach((day) => {
      grouped[day].sort(
        (a, b) => new Date(a.starts_at) - new Date(b.starts_at)
      );
    });

    return grouped;
  }, [timetables]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          Gestion des emplois du temps
        </h1>

        <div className="flex gap-2">
          <button
            onClick={openNew}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Nouveau créneau
          </button>

          <button
            onClick={fetchTimetables}
            className="px-3 py-2 bg-gray-200 rounded"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-white p-3 rounded shadow min-h-[220px]"
          >
            <h3 className="font-semibold mb-2">{day}</h3>

            {loading ? (
              <div>Chargement…</div>
            ) : timetablesByDay[day]?.length ? (
              timetablesByDay[day].map((item) => (
                <div
                  key={item.id}
                  className="mb-2 p-2 border rounded space-y-1"
                >
                  <div className="text-sm font-medium">
                    {item.course_title || `Cours #${item.course_id}`}
                  </div>

                  <div className="text-xs text-gray-600">
                    {item.class_title || ""}{" "}
                    {item.teacher_name ? `— ${item.teacher_name}` : ""}
                  </div>

                  <div className="text-xs">
                    {timeOf(item.starts_at)} → {timeOf(item.ends_at)}
                  </div>

                  {item.room && (
                    <div className="text-xs text-gray-500">
                      Salle : {item.room}
                    </div>
                  )}

                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">Aucun créneau</div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">
          {form.id ? "Modifier créneau" : "Nouveau créneau"}
        </h2>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <label>
            <div className="text-sm mb-1">Classe</div>
            <select
              value={form.class_id}
              onChange={(e) => updateField("class_id", e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">— sélectionner —</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title || item.name || `#${item.id}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="text-sm mb-1">Cours</div>
            <select
              value={form.course_id}
              onChange={(e) => updateField("course_id", e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">— sélectionner —</option>
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title || item.name || `#${item.id}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="text-sm mb-1">Formateur</div>
            <select
              value={form.teacher_id}
              onChange={(e) => updateField("teacher_id", e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">— sélectionner —</option>
              {teachers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.full_name || item.name || `#${item.id}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="text-sm mb-1">Jour</div>
            <select
              value={form.day_of_week}
              onChange={(e) => updateField("day_of_week", e.target.value)}
              className="w-full border rounded p-2"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="text-sm mb-1">Début</div>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => updateField("starts_at", e.target.value)}
              className="w-full border rounded p-2"
            />
          </label>

          <label>
            <div className="text-sm mb-1">Fin</div>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => updateField("ends_at", e.target.value)}
              className="w-full border rounded p-2"
            />
          </label>

          <label>
            <div className="text-sm mb-1">Salle</div>
            <input
              value={form.room}
              onChange={(e) => updateField("room", e.target.value)}
              className="w-full border rounded p-2"
            />
          </label>

          <label>
            <div className="text-sm mb-1">Remarques</div>
            <input
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full border rounded p-2"
            />
          </label>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 border rounded"
              >
                Annuler
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              {saving
                ? "Enregistrement..."
                : form.id
                ? "Enregistrer"
                : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}