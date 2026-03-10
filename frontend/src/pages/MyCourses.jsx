// src/pages/MyCourses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import CourseCard from "@/components/CourseCard";
import { asArray } from "@/utils/asArray";

export default function MyCourses() {
  const nav = useNavigate();
  const [enrollments, setEnrollments] = useState(null); // null = loading
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/enrollments/me");
        if (!mounted) return;
        setEnrollments(asArray(data));
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.error || "Impossible de charger vos cours");
        setEnrollments([]); // évite .map sur non-array
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (enrollments === null) return <div className="p-4">Chargement…</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mes cours</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {asArray(enrollments).map((e) => {
          // Normalisation défensive
          const course = e.course ?? {};
          const courseId = e.id ?? e.enrollment_id ?? e.course_id ?? course.id;
          const slug =
            e.slug ??
            e.course_slug ??
            course.slug ??
            (courseId ? `course-${courseId}` : undefined); // fallback non idéal — utilisé only if needed
          const title = course.title ?? e.title ?? e.name ?? `Cours #${courseId ?? "?"}`;
          const cover = course.cover_url ?? e.cover_url ?? course.image_url ?? e.image_url ?? null;
          const category = course.category ?? e.category ?? null;
          const level = course.level ?? e.level ?? null;
          const progress = e.progress_percent ?? e.progress ?? 0;

          const handleOpen = () => {
            if (slug && typeof slug === "string" && !slug.startsWith("course-")) {
              nav(`/courses/${slug}`);
            } else if (courseId) {
              // fallback to a course detail route by id (if your routing supports it)
              nav(`/courses/${courseId}`);
            } else {
              // last resort: go to dashboard courses list
              nav("/dashboard/my-courses");
            }
          };

          return (
            <CourseCard
              key={courseId ?? JSON.stringify(e)}
              course={{
                id: courseId,
                title,
                slug,
                cover_url: cover,
                category,
                level,
              }}
              progress={progress}
              onOpen={handleOpen}
            />
          );
        })}
      </div>

      {asArray(enrollments).length === 0 && (
        <p className="text-sm text-gray-600">Vous n’êtes inscrit à aucun cours pour l’instant.</p>
      )}
    </div>
  );
}
