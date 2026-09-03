// src/pages/admin/AdminClassDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import AdminCourseAssign from "@/pages/admin/AdminCourseAssign";

export default function AdminClassDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [klass, setKlass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchClass() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/admin/classes/${id}`);
      const data = res.data?.class ?? res.data ?? null;
      setKlass(data);
    } catch (err) {
      console.error("fetchClass error", err);
      setError(t("adminClassDetail.errors.load"));
    } finally {
      setLoading(false);
    }
  }

  function openAssign(course) {
    setAssignModal({
      courseId: course.id ?? course.course_id,
      courseTitle: course.title ?? course.name,
    });
  }

  function closeAssign() {
    setAssignModal(null);
  }

  async function handleAssign(courseId, teacherId) {
    try {
      await api.post(`/api/admin/courses/${courseId}/assign`, {
        teacher_id: Number(teacherId),
      });
      alert(t("adminClassDetail.success.assigned"));
      closeAssign();
      fetchClass();
    } catch (err) {
      console.error("assign error", err);
      alert(t("adminClassDetail.errors.assign"));
    }
  }

  if (loading) return <div className="p-6">{t("common.loading")}</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!klass)
    return <div className="p-6 text-gray-500">{t("adminClassDetail.notFound")}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {klass.title || klass.name || `${t("adminClassDetail.class")} #${klass.id}`}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t("common.back")}
          </Button>
          <Button onClick={fetchClass}>{t("common.refresh")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>{t("adminClassDetail.sections.info")}</CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-2">{klass.description || "—"}</p>
          <div className="text-xs text-gray-500">
            {t("adminClassDetail.createdAt")} :{" "}
            {klass.created_at
              ? new Date(klass.created_at).toLocaleString()
              : "—"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>{t("adminClassDetail.sections.courses")}</CardHeader>
        <CardContent>
          {Array.isArray(klass.courses) && klass.courses.length ? (
            <div className="space-y-3">
              {klass.courses.map((c) => (
                <div
                  key={c.id || c.course_id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div>
                    <div className="font-medium">
                      {c.title || c.name || `${t("adminClassDetail.course")} #${c.id || c.course_id}`}
                    </div>
                    <div className="text-xs text-gray-500">{c.description || ""}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(`/admin/courses/${c.id || c.course_id}`, "_self")
                      }
                    >
                      {t("common.details")}
                    </Button>
                    <Button onClick={() => openAssign(c)}>
                      {t("adminClassDetail.assignTeacher")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {t("adminClassDetail.empty.courses")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>{t("adminClassDetail.sections.timetables")}</CardHeader>
        <CardContent>
          {Array.isArray(klass.timetables) && klass.timetables.length ? (
            <ul className="list-disc pl-5 text-sm">
              {klass.timetables.map((tt) => (
                <li key={tt.id}>
                  {tt.course_title || tt.course_name || `${t("adminClassDetail.course")} #${tt.course_id}`} —{" "}
                  {tt.starts_at ? new Date(tt.starts_at).toLocaleString() : tt.starts_at}{" "}
                  {t("adminClassDetail.to")}{" "}
                  {tt.ends_at ? new Date(tt.ends_at).toLocaleString() : tt.ends_at}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">
              {t("adminClassDetail.empty.timetables")}
            </div>
          )}
        </CardContent>
      </Card>

      {assignModal && (
        <AdminCourseAssign
          courseId={assignModal.courseId}
          courseTitle={assignModal.courseTitle}
          onClose={closeAssign}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}