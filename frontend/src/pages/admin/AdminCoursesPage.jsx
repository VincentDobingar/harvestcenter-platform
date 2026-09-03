// src/pages/admin/AdminCoursesPage.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const res = await api.get("/admin/courses");
      const rows = Array.isArray(res.data) ? res.data : res.data?.rows ?? [];
      setCourses(rows);
    } catch (err) {
      console.error("fetchCourses error:", err);
      toast.error("Impossible de charger les cours.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Cours</h1>
        <p className="mt-1 text-sm text-slate-500">
          Liste des cours disponibles.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">Chargement…</div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          Aucun cours trouvé.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {course.title || `Cours #${course.id}`}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {course.description || "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}