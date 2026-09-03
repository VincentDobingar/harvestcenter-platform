import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import api from "@/utils/api";
import ProgressBar from "@/components/ProgressBar";

export default function CourseDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [doneSet, setDoneSet] = useState(() => new Set());
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
          const isEnrolled = (eRes.data || []).some((e) => e.course_id === data.id);
          setEnrolled(isEnrolled);
        } catch {}

        try {
          const pRes = await api.get(`/progress/course/${data.id}`);
          const ids = Array.isArray(pRes.data?.doneLessonIds)
            ? pRes.data.doneLessonIds
            : [];
          setDoneSet(new Set(ids));
        } catch {}
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.error || t("coursePage.errors.load"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug, t]);

  const { totalLessons, doneCount, progress } = useMemo(() => {
    if (!course) return { totalLessons: 0, doneCount: 0, progress: 0 };

    const total = (course.modules || []).reduce(
      (acc, m) => acc + (m.lessons?.length || 0),
      0
    );
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
      setActionMsg(t("coursePage.enrollSuccess"));
    } catch (e) {
      setActionMsg(e?.response?.data?.error || t("coursePage.errors.enroll"));
    } finally {
      setTimeout(() => setActionMsg(""), 2500);
    }
  }

  async function toggleLesson(lessonId) {
    if (!enrolled) {
      setActionMsg(t("coursePage.mustEnroll"));
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
      setActionMsg(e?.response?.data?.error || t("coursePage.errors.action"));
      setTimeout(() => setActionMsg(""), 2500);
    }
  }

  if (loading) return <div className="p-6">{t("common.loading")}</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!course) return <div className="p-6">{t("coursePage.notFound")}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <nav className="text-sm text-gray-600">
        <Link to="/" className="text-blue-600 underline">{t("nav.home")}</Link>{" "}
        <span>›</span>{" "}
        <Link to="/my-courses" className="text-blue-600 underline">
          {t("coursePage.myCourses")}
        </Link>{" "}
        <span>›</span>{" "}
        <span className="text-gray-800">{course.title}</span>
      </nav>

      <header className="rounded-2xl bg-white shadow p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600">
              {course.category} {course.level ? `• ${course.level}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!enrolled && (
              <button
                onClick={handleEnroll}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                {t("coursePage.enroll")}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <ProgressBar value={progress} />
          <div className="text-sm text-gray-700">
            {t("coursePage.progress")}: <b>{progress}%</b> ({doneCount}/{totalLessons}{" "}
            {t("coursePage.lessons")})
          </div>
        </div>

        {actionMsg && <div className="text-blue-700 text-sm">{actionMsg}</div>}
      </header>

      <section className="space-y-4">
        {(course.modules || []).length === 0 && (
          <div className="rounded-2xl bg-white shadow p-4">
            {t("coursePage.noLessons")}
          </div>
        )}

        {(course.modules || []).map((m) => (
          <div key={m.id} className="rounded-2xl bg-white shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                {t("coursePage.module")} {m.sort_order || ""} — {m.title}
              </h2>
            </div>

            <ul className="divide-y">
              {(m.lessons || []).map((l) => {
                const isDone = doneSet.has(l.id);

                return (
                  <li key={l.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{l.title}</div>
                      <div className="text-sm text-gray-600">
                        {l.duration_min
                          ? `${l.duration_min} min`
                          : t("coursePage.variableDuration")}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLesson(l.id)}
                        className={`px-3 py-2 rounded-xl text-sm ${
                          isDone
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                        title={
                          isDone
                            ? t("coursePage.markInProgress")
                            : t("coursePage.markDone")
                        }
                      >
                        {isDone ? t("coursePage.done") : t("coursePage.markDone")}
                      </button>

                      {l.content_url && (
                        <a
                          href={l.content_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl text-sm bg-blue-50 text-blue-700 underline"
                        >
                          {t("coursePage.open")}
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