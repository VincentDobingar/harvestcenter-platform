// 📁 src/pages/CourseDetailTimeline.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, PlayCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import api from "@/utils/api";
import ProgressBar from "@/components/ProgressBar";
import { asArray } from "@/utils/asArray"; // ⬅️ NEW

export default function CourseDetailTimeline() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [doneSet, setDoneSet] = useState(() => new Set());
  const [openModuleIds, setOpenModuleIds] = useState(() => new Set());
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/courses/${slug}`);
        if (!mounted) return;
        setCourse(data);

        try {
          const eRes = await api.get("/enrollments/me");
          const isEnrolled = asArray(eRes.data).some((e) => e.course_id === data.id);
          setEnrolled(isEnrolled);
        } catch {}

        try {
          const pRes = await api.get(`/progress/course/${data.id}`);
          const ids = asArray(pRes.data?.doneLessonIds);
          setDoneSet(new Set(ids));
        } catch {}

        const firstModule = asArray(data?.modules)[0];
        if (firstModule?.id) setOpenModuleIds(new Set([firstModule.id]));
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.error || "Impossible de charger le cours");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  const { totalLessons, doneCount, progress } = useMemo(() => {
    const modules = asArray(course?.modules);
    const total = modules.reduce((acc, m) => acc + asArray(m?.lessons).length, 0);
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
      setActionMsg("Inscris-toi au cours pour marquer une leçon.");
      setTimeout(() => setActionMsg(""), 2500);
      return;
    }
    try {
      const { data } = await api.post(`/progress/lessons/${lessonId}/toggle`);
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

  function toggleModule(moduleId) {
    setOpenModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!course) return <div className="p-6">Cours introuvable.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <nav className="text-sm text-gray-600">
        <Link to="/" className="text-brand underline">Accueil</Link> <span>›</span>{" "}
        <Link to="/my-courses" className="text-brand underline">Mes cours</Link> <span>›</span>{" "}
        <span className="text-gray-800">{course.title}</span>
      </nav>

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white shadow p-5 space-y-3 border"
      >
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand" /> {course.title}
            </h1>
            <p className="text-gray-600">{course.category} {course.level ? `• ${course.level}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {!enrolled && (
              <button onClick={handleEnroll} className="px-4 py-2 rounded-xl btn-brand">
                S’inscrire au cours
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <ProgressBar value={progress} />
          <div className="text-sm text-gray-700">Progression : <b>{progress}%</b> ({doneCount}/{totalLessons} leçons)</div>
        </div>

        {actionMsg && <div className="text-brand text-sm">{actionMsg}</div>}
      </motion.header>

      <section className="space-y-5">
        {asArray(course?.modules).map((m, idx) => {
          const expanded = openModuleIds.has(m.id);
          return (
            <motion.div
              key={m.id ?? idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white border rounded-2xl overflow-hidden"
            >
              <button onClick={() => toggleModule(m.id)} className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 grid place-items-center rounded-xl bg-brand/10 text-brand border border-brand/30">
                    {expanded ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                  </div>
                  <div>
                    <div className="font-semibold">Module {m.sort_order || idx + 1} — {m.title}</div>
                    <div className="text-xs text-gray-500">{asArray(m?.lessons).length} leçon(s)</div>
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="divide-y"
                  >
                    {asArray(m?.lessons).map((l) => {
                      const isDone = doneSet.has(l.id);
                      return (
                        <li key={l.id} className="p-4 grid md:grid-cols-[1fr_auto] items-center gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-6 h-6 rounded-full border grid place-items-center ${isDone ? 'bg-green-50 border-green-600 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4"/> : <PlayCircle className="w-4 h-4"/>}
                            </div>
                            <div>
                              <div className="font-medium">{l.title}</div>
                              <div className="text-xs text-gray-600 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5"/> {l.duration_min ? `${l.duration_min} min` : 'Durée variable'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => toggleLesson(l.id)}
                              className={`px-3 py-2 rounded-xl text-sm border transition ${isDone ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
                              title={isDone ? 'Marquer comme en cours' : 'Marquer comme terminé'}
                            >
                              {isDone ? 'Terminé ✓' : 'Marquer terminé'}
                            </button>
                            {l.content_url && (
                              <a
                                className="px-3 py-2 rounded-xl text-sm bg-brand/10 text-brand underline"
                                href={l.content_url} target="_blank" rel="noreferrer"
                              >Ouvrir</a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
