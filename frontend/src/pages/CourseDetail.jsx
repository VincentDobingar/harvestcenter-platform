import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/utils/api";
import ProgressBar from "@/components/ProgressBar";

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [doneSet, setDoneSet] = useState(() => new Set()); // lesson_ids "done"
  const [actionMsg, setActionMsg] = useState("");

  // Charger le cours (+ modules + leçons)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/courses/${slug}`);
        if (!mounted) return;
        setCourse(data);

        // Vérifier si inscrit à ce cours
        try {
          const eRes = await api.get("/enrollments/me");
          const isEnrolled = (eRes.data || []).some((e) => e.course_id === data.id);
          setEnrolled(isEnrolled);
        } catch {}

        // Charger la liste des leçons déjà "done" (si endpoint dispo, sinon ignore)
        try {
          const pRes = await api.get(`/progress/course/${data.id}`);
          const ids = Array.isArray(pRes.data?.doneLessonIds) ? pRes.data.doneLessonIds : [];
          setDoneSet(new Set(ids));
        } catch {
          // pas bloquant : on commence vide
        }
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.error || "Impossible de charger le cours");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // Nombre total de leçons & progression
  const { totalLessons, doneCount, progress } = useMemo(() => {
    if (!course) return { totalLessons: 0, doneCount: 0, progress: 0 };
    const total = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const done = Math.min(doneSet.size, total);
    return {
      totalLessons: total,
      doneCount: done,
      progress: total > 0 ? Math.round((100 * done) / total) : 0,
    };
  }, [course, doneSet]);

  async function handleEnroll() {
    if (!course) return;
    try {
      await api.post("/enrollments", { course_id: course.id });
      setEnrolled(true);
      setActionMsg("Inscription réussie ✅");
    } catch (e) {
      setActionMsg(e?.response?.data?.error || "Inscription impossible");
    } finally {
      setTimeout(() => setActionMsg(""), 2500);
    }
  }

  async function toggleLesson(lessonId) {
    if (!enrolled) {
      setActionMsg("Vous devez vous inscrire au cours avant de marquer une leçon.");
      setTimeout(() => setActionMsg(""), 2500);
      return;
    }
    try {
      const { data } = await api.post(`/progress/lessons/${lessonId}/toggle`);
      // data.status: 'done' | 'in_progress'
      setDoneSet((prev) => {
        const next = new Set(prev);
        if (data?.status === "done") next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });
    } catch (e) {
      setActionMsg(e?.response?.data?.error || "Action impossible");
      setTimeout(() => setActionMsg(""), 2500);
    }
  }

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!course) return <div className="p-6">Cours introuvable.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <nav className="text-sm text-gray-600">
        <Link to="/" className="text-blue-600 underline">Accueil</Link> <span>›</span>{" "}
        <Link to="/my-courses" className="text-blue-600 underline">Mes cours</Link> <span>›</span>{" "}
        <span className="text-gray-800">{course.title}</span>
      </nav>

      <header className="rounded-2xl bg-white shadow p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600">{course.category} {course.level ? `• ${course.level}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {!enrolled && (
              <button onClick={handleEnroll} className="px-4 py-2 rounded-xl bg-blue-600 text-white">
                S’inscrire au cours
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <ProgressBar value={progress} />
          <div className="text-sm text-gray-700">
            Progression : <b>{progress}%</b> ({doneCount}/{totalLessons} leçons)
          </div>
        </div>

        {actionMsg && <div className="text-blue-700 text-sm">{actionMsg}</div>}
      </header>

      {/* Modules + Leçons */}
      <section className="space-y-4">
        {(course.modules || []).length === 0 && (
          <div className="rounded-2xl bg-white shadow p-4">
            Aucune leçon disponible pour le moment.
          </div>
        )}

        {(course.modules || []).map((m) => (
          <div key={m.id} className="rounded-2xl bg-white shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Module {m.sort_order || ""} — {m.title}</h2>
            </div>
            <ul className="divide-y">
              {(m.lessons || []).map((l) => {
                const isDone = doneSet.has(l.id);
                return (
                  <li key={l.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{l.title}</div>
                      <div className="text-sm text-gray-600">
                        {l.duration_min ? `${l.duration_min} min` : "Durée variable"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLesson(l.id)}
                        className={`px-3 py-2 rounded-xl text-sm ${
                          isDone ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        title={isDone ? "Marquer comme en cours" : "Marquer comme terminé"}
                      >
                        {isDone ? "Terminé ✓" : "Marquer terminé"}
                      </button>
                      {l.content_url && (
                        <a
                          href={l.content_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl text-sm bg-blue-50 text-blue-700 underline"
                        >
                          Ouvrir
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
