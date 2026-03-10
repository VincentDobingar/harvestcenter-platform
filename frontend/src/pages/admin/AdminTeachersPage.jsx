// src/pages/admin/AdminTeachersPage.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers(search = "") {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      const res = await api.get("/api/admin/teachers", { params });
      // some backends return array directly
      const rows = res.data ?? [];
      setTeachers(Array.isArray(rows) ? rows : (rows.rows ?? []));
    } catch (err) {
      console.error("fetchTeachers error", err);
      toast.error("Erreur lors du chargement des formateurs.");
    } finally {
      setLoading(false);
    }
  }

  function goToProfile(t) {
    // try go to teacher profile route if exists
    if (t.username) navigate(`/teacher/${t.username}`, { replace: false });
    else navigate(`/teacher/${t.id}`, { replace: false });
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Formateurs</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher nom / email…"
            className="border rounded px-3 py-2"
          />
          <Button onClick={() => fetchTeachers(q)}>Rechercher</Button>
          <Button variant="outline" onClick={() => { setQ(""); fetchTeachers(); }}>Réinitialiser</Button>
        </div>
      </div>

      <div>
        {loading ? (
          <div>Chargement…</div>
        ) : teachers.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun formateur trouvé.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => (
              <Card key={t.id || t.email}>
                <CardHeader>{t.full_name ?? t.name ?? t.email}</CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">{t.email}</div>
                  <div className="text-xs text-gray-500 mt-2">Rôle: {t.role ?? "teacher"}</div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={() => goToProfile(t)}>Voir profil</Button>
                    <Button onClick={() => { navigator.clipboard?.writeText(t.email || ""); toast.success("Email copié"); }}>Contacter</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
