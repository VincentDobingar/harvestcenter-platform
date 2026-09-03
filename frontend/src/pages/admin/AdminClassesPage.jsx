// src/pages/admin/AdminClassesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    try {
      setLoading(true);
      const res = await api.get("/admin/classes");
      const rows = Array.isArray(res.data) ? res.data : res.data?.rows ?? [];
      setClasses(rows);
    } catch (err) {
      console.error("fetchClasses error", err);
      toast.error("Impossible de charger les classes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultation des classes disponibles.
          </p>
        </div>

        <Button variant="outline" onClick={fetchClasses}>
          Actualiser
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          Chargement…
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          Aucune classe trouvée.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id} className="rounded-2xl shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {c.name || `Classe #${c.id}`}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Niveau : {c.level || "—"}
                  </p>
                </div>

                <div className="text-sm text-slate-600">
                  Année académique : {c.academic_year || "—"}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/classes/${c.id}`)}
                  >
                    Détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}