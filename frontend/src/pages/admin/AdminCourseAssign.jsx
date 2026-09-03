// src/pages/admin/AdminCourseAssign.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function AdminCourseAssign({
  courseId,
  courseTitle,
  onClose = () => {},
  onAssign = () => {},
}) {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/teachers");
      const rows = res.data ?? [];
      setTeachers(rows);
      if (rows.length > 0) setSelected(rows[0].id);
    } catch (err) {
      console.error("fetchTeachers error", err);
      setError(t("adminCourseAssign.errors.load"));
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selected) return setError(t("adminCourseAssign.errors.choose"));
    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/api/admin/courses/${courseId}/assign`, {
        teacher_id: Number(selected),
      });
      onAssign(courseId, selected);
    } catch (err) {
      console.error("assign error", err);
      setError(err?.response?.data?.error || t("adminCourseAssign.errors.assign"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader>
            {t("adminCourseAssign.title")} — {courseTitle || `${t("adminCourseAssign.course")} #${courseId}`}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div>{t("adminCourseAssign.loading")}</div>
            ) : (
              <>
                {error && (
                  <div className="mb-3 text-sm text-red-600">{error}</div>
                )}

                <div className="mb-3">
                  <label className="block text-sm mb-1">
                    {t("adminCourseAssign.chooseTeacher")}
                  </label>

                  <select
                    className="w-full border rounded p-2"
                    value={selected ?? ""}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="" disabled>
                      {t("adminCourseAssign.select")}
                    </option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name ||
                          teacher.name ||
                          teacher.email ||
                          `#${teacher.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-gray-500">
                  {t("adminCourseAssign.helper")}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleAssign}
                disabled={submitting || loading}
              >
                {submitting
                  ? t("adminCourseAssign.assigning")
                  : t("adminCourseAssign.assign")}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}