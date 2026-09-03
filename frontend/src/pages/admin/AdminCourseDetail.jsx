// src/pages/admin/AdminCourseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import AdminCourseAssign from "@/pages/admin/AdminCourseAssign";

export default function AdminCourseDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (id) fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchCourse() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/courses/${id}`);
      const data = res.data?.course ?? res.data ?? null;
      setCourse(data);
    } catch (err) {
      console.error("fetchCourse error", err);
      setError(t("adminCourseDetail.errors.load"));
    } finally {
      setLoading(false);
    }
  }

  function openAssign() {
    setAssignModal({
      courseId: course?.id || id,
      courseTitle: course?.title || course?.name,
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
      alert(t("adminCourseDetail.success.assigned"));
      closeAssign();
      fetchCourse();
    } catch (err) {
      console.error("assign error", err);
      alert(t("adminCourseDetail.errors.assign"));
    }
  }

  async function toggleActive() {
    if (!course) return;
    setToggling(true);

    try {
      const newStatus = !course.active;
      await api.patch(`/api/admin/courses/${course.id}/status`, {
        active: !!newStatus,
      });
      setCourse((prev) => ({ ...prev, active: !!newStatus }));
    } catch (err) {
      console.error("toggleActive error", err);
      alert(t("adminCourseDetail.errors.status"));
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <div className="p-6">{t("common.loading")}</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!course)
    return <div className="p-6 text-gray-500">{t("adminCourseDetail.notFound")}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {course.title || course.name || `${t("adminCourseDetail.course")} #${course.id}`}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t("common.back")}
          </Button>
          <Button onClick={fetchCourse}>{t("common.refresh")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>{t("adminCourseDetail.sections.info")}</CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-2">{course.description || "—"}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
            <div>
              <strong>{t("adminCourseDetail.duration")}:</strong> {course.duration || "—"}
            </div>
            <div>
              <strong>{t("adminCourseDetail.level")}:</strong> {course.level || "—"}
            </div>
            <div>
              <strong>{t("adminCourseDetail.status")}:</strong>{" "}
              {course.active ? (
                <span className="text-green-600">{t("adminCourseDetail.active")}</span>
              ) : (
                <span className="text-red-600">{t("adminCourseDetail.inactive")}</span>
              )}
            </div>
          </div>

          <div className="mt-3 text-sm">
            <strong>{t("adminCourseDetail.teacher")}:</strong>{" "}
            {course.teacher ? (
              <span>
                {course.teacher.full_name ||
                  course.teacher.name ||
                  course.teacher.email}
              </span>
            ) : (
              <em className="text-gray-500">
                {t("adminCourseDetail.noTeacher")}
              </em>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={openAssign}>
              {t("adminCourseDetail.assignTeacher")}
            </Button>
            <Button onClick={toggleActive} disabled={toggling}>
              {toggling
                ? t("adminCourseDetail.updating")
                : course.active
                ? t("adminCourseDetail.deactivate")
                : t("adminCourseDetail.activate")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>{t("adminCourseDetail.sections.students")}</CardHeader>
        <CardContent>
          {Array.isArray(course.students) && course.students.length ? (
            <div className="space-y-2">
              {course.students.map((s) => (
                <div
                  key={s.id || s.student_id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div>
                    <div className="font-medium">
                      {s.full_name || s.nom || s.email}
                    </div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {s.payment_status ||
                      (s.paid
                        ? t("adminCourseDetail.paid")
                        : t("adminCourseDetail.unpaid"))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {t("adminCourseDetail.empty.students")}
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