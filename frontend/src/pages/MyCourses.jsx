// src/pages/MyCourses.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import CourseCard from "@/components/CourseCard";
import { asArray } from "@/utils/asArray";

export default function MyCourses() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [enrollments, setEnrollments] = useState(null);
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
        setErr(
          e?.response?.data?.error ||
            t("myCoursesPage.errors.load", {
              defaultValue: "Impossible de charger les cours.",
            })
        );
        setEnrollments([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [t]);

  if (enrollments === null) {
    return (
      <div className="p-4">
        {t("common.loading", { defaultValue: "Chargement..." })}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">
        {t("myCoursesPage.title", { defaultValue: "Mes cours" })}
      </h1>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {asArray(enrollments).map((e) => {
          const course = e.course ?? {};
          const courseId = e.id ?? e.enrollment_id ?? e.course_id ?? course.id;

          const slug =
            e.slug ??
            e.course_slug ??
            course.slug ??
            (courseId ? `course-${courseId}` : undefined);

          const title =
            course.title ??
            e.title ??
            e.name ??
            `${t("myCoursesPage.course", { defaultValue: "Cours" })} #${courseId ?? "?"}`;

          const cover =
            course.cover_url ??
            e.cover_url ??
            course.image_url ??
            e.image_url ??
            null;

          const category = course.category ?? e.category ?? null;
          const level = course.level ?? e.level ?? null;
          const progress = e.progress_percent ?? e.progress ?? 0;

          const handleOpen = () => {
            if (slug && typeof slug === "string" && !slug.startsWith("course-")) {
              nav(`/courses/${slug}`);
            } else if (courseId) {
              nav(`/courses/${courseId}`);
            } else {
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
        <p className="text-sm text-gray-600">
          {t("myCoursesPage.empty", { defaultValue: "Aucun cours trouvé." })}
        </p>
      )}
    </div>
  );
}