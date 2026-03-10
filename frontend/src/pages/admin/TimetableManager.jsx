// src/pages/admin/TimetableManager.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const HOUR_START = 7;
const HOUR_END = 21;

/**
 * convert a ISO timestamp into "HH:mm" local string
 */
function timeOf(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

export default function TimetableManager() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [editing, setEditing] = useState(null); // timetable object or null
  const [form, setForm] = useState({
    id: null, class_id: "", course_id: "", teacher_id: "", day_of_week: "Lundi",
    starts_at: "", ends_at: "", room: "", notes: ""
  });

  async function fetchLists() {
    try {
      const [c1, c2, c3] = await Promise.all([
        api.get("/api/admin/classes").catch(()=>({ data: { rows: [] }})),
        api.get("/api/admin/courses").catch(()=>({ data: [] })),
        api.get("/api/admin/teachers").catch(()=>({ data: [] })),
      ]);
      setClasses((c1.data?.rows) || []);
      setCourses(c2.data?.rows || c2.data || []);
      setTeachers(c3.data?.rows || c3.data || []);
    } catch (e) {
      console.error("fetchLists error", e);
    }
  }

  async function fetchTimetables() {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/timetables");
      setTimetables(res.data?.rows ?? []);
    } catch (e) {
      console.error("fetchTimetables error", e);
      toast.error("Impossible de charger les emplois du temps");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLists();
    fetchTimetables();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({
      id: null, class_id: classes[0]?.id || "", course_id: courses[0]?.id || "", teacher_id: teachers[0]?.id || "",
      day_of_week: "Lundi", starts_at: "", ends_at: "", room: "", notes: ""
    });
  }

  function openEdit(t) {
    setEditing(t);
    setForm({
      id: t.id,
      class_id: t.class_id ?? "",
      course_id: t.course_id ?? "",
      teacher_id: t.teacher_id ?? "",
      day_of_week: t.day_of_week ?? "Lundi",
      starts_at: t.starts_at ? new Date(t.starts_at).toISOString().slice(0,16) : "",
      ends_at: t.ends_at ? new Date(t.ends_at).toISOString().slice(0,16) : "",
      room: t.room || "",
      notes: t.notes || ""
    });
  }

  function updateField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e) {
    e?.preventDefault();
    try {
      const payload = {
        class_id: form.class_id || null,
        course_id: form.course_id || null,
        teacher_id: form.teacher_id || null,
        day_of_week: form.day_of_week,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        room: form.room,
        notes: form.notes
      };
      if (!payload.class_id || !payload.course_id || !payload.starts_at || !payload.ends_at || !payload.day_of_week) {
        toast.error("Remplir les champs obligatoires (classe, cours, début et fin).");
        return;
      }
      if (form.id) {
        const res = await api.patch(`/api/admin/timetables/${form.id}`, payload);
        toast.success("Créneau modifié");
      } else {
        const res = await api.post("/api/admin/timetables", payload);
        toast.success("Créneau ajouté");
      }
      await fetchTimetables();
      setEditing(null);
    } catch (err) {
      console.error("save error", err);
      toast.error("Erreur lors de l'enregistrement");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    try {
      await api.delete(`/api/admin/timetables/${id}`);
      toast.success("Supprimé");
      await fetchTimetables();
    } catch (e) {
      console.error("delete error", e);
      toast.error("Impossible de supprimer");
    }
  }

  // structure timetablesByDay { 'Lundi': [...], ... }
  const timetablesByDay = useMemo(() => {
    const m = {};
    for (const d of DAYS) m[d] = [];
    (timetables || []).forEach(t => {
      const d = t.day_of_week || "Lundi";
      if (!m[d]) m[d] = [];
      m[d].push(t);
    });
    for (const d of Object.keys(m)) {
      m[d].sort((a,b) => new Date(a.starts_at) - new Date(b.starts_at));
    }
    return m;
  }, [timetables]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Gestion des emplois du temps</h1>
        <div>
          <button onClick={openNew} className="px-3 py-2 bg-green-600 text-white rounded mr-2">Nouveau créneau</button>
          <button onClick={fetchTimetables} className="px-3 py-2 bg-gray-200 rounded">Rafraîchir</button>
        </div>
      </div>

      {/* GRID hebdo */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <div key={day} className="bg-white p-3 rounded shadow min-h-[200px]">
            <h3 className="font-semibold mb-2">{day}</h3>
            {loading ? <div>Chargement…</div> : (
              <>
                {timetablesByDay[day] && timetablesByDay[day].length ? (
                  timetablesByDay[day].map((t) => (
                    <div key={t.id} className="mb-2 p-2 border rounded">
                      <div className="text-sm font-medium">{t.course_title || `Cours #${t.course_id}`}</div>
                      <div className="text-xs text-gray-600">{t.class_title || ""} — {t.teacher_name || ""}</div>
                      <div className="text-xs mt-1">{timeOf(t.starts_at)} → {timeOf(t.ends_at)}</div>
                      <div className="mt-1 flex gap-2">
                        <button onClick={() => openEdit(t)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Modifier</button>
                        <button onClick={() => handleDelete(t.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                      </div>
                    </div>
                  ))
                ) : <div className="text-xs text-gray-400">Aucun créneau</div>}
              </>
            )}
          </div>
        ))}
      </div>

      {/* FORM modal / inline */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">{form.id ? "Modifier créneau" : "Nouveau créneau"}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
          <label className="col-span-1">
            <div className="text-sm">Classe</div>
            <select value={form.class_id} onChange={(e)=>updateField("class_id", e.target.value)} className="w-full border rounded p-2">
              <option value="">— sélectionne —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.title || c.name || `#${c.id}`}</option>)}
            </select>
          </label>

          <label className="col-span-1">
            <div className="text-sm">Cours</div>
            <select value={form.course_id} onChange={(e)=>updateField("course_id", e.target.value)} className="w-full border rounded p-2">
              <option value="">— sélectionne —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name || `#${c.id}`}</option>)}
            </select>
          </label>

          <label>
            <div className="text-sm">Formateur</div>
            <select value={form.teacher_id} onChange={(e)=>updateField("teacher_id", e.target.value)} className="w-full border rounded p-2">
              <option value="">— sélectionne —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.name || `#${t.id}`}</option>)}
            </select>
          </label>

          <label>
            <div className="text-sm">Jour</div>
            <select value={form.day_of_week} onChange={(e)=>updateField("day_of_week", e.target.value)} className="w-full border rounded p-2">
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label>
            <div className="text-sm">Début</div>
            <input type="datetime-local" value={form.starts_at} onChange={(e)=>updateField("starts_at", e.target.value)} className="w-full border rounded p-2" />
          </label>

          <label>
            <div className="text-sm">Fin</div>
            <input type="datetime-local" value={form.ends_at} onChange={(e)=>updateField("ends_at", e.target.value)} className="w-full border rounded p-2" />
          </label>

          <label className="col-span-1">
            <div className="text-sm">Salle</div>
            <input value={form.room} onChange={(e)=>updateField("room", e.target.value)} className="w-full border rounded p-2" />
          </label>

          <label className="col-span-1">
            <div className="text-sm">Remarques</div>
            <input value={form.notes} onChange={(e)=>updateField("notes", e.target.value)} className="w-full border rounded p-2" />
          </label>

          <div className="col-span-2 flex gap-2 justify-end">
            {form.id && <button type="button" onClick={()=>{ setEditing(null); setForm({ id:null,class_id:"",course_id:"",teacher_id:"",day_of_week:"Lundi",starts_at:"",ends_at:"",room:"",notes:"" }) }} className="px-3 py-2 border rounded">Annuler</button>}
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">{form.id ? "Enregistrer" : "Ajouter"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
