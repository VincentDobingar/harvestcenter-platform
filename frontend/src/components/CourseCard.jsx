import { useTranslation } from "react-i18next";
import ProgressBar from "./ProgressBar";

export default function CourseCard({ course, progress = 0, onOpen }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl shadow p-4 bg-white hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={course.cover_url || "/images/course-fallback.jpg"}
          alt={course.title || t("courseCard.coverAlt")}
          className="w-16 h-16 object-cover rounded-xl"
        />

        <div className="flex-1">
          <h3 className="font-semibold">{course.title}</h3>
          <p className="text-sm text-gray-500">
            {course.category} {course.level ? `• ${course.level}` : ""}
          </p>
        </div>

        <button
          onClick={onOpen}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm"
        >
          {t("courseCard.open")}
        </button>
      </div>

      <div className="mt-3">
        <ProgressBar value={progress} />
        <div className="text-xs text-gray-600 mt-1">
          {t("courseCard.progress", { value: progress })}
        </div>
      </div>
    </div>
  );
}