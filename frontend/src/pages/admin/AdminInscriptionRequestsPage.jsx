// src/pages/admin/AdminInscriptionRequestsPage.jsx

// src/pages/admin/AdminInscriptionRequestsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "validated", label: "Validée" },
  { value: "rejected", label: "Rejetée" },
  { value: "enrolled", label: "Inscrite" },
];

export default function AdminInscriptionRequestsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests(filters = {}) {
    try {
      setLoading(true);

      const params = {};
      if (filters.q?.trim()) params.q = filters.q.trim();
      if (filters.status) params.status = filters.status;

      // Si ton util api ajoute déjà /api, garde /admin/...
      const res = await api.get("/admin/inscription-requests", { params });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.rows ?? [];

      setRows(data);
    } catch (err) {
      console.error("fetchRequests error:", err);
      toast.error("Impossible de charger les demandes d’inscription.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, nextStatus) {
    try {
      const res = await api.patch(`/admin/inscription-requests/${id}/status`, {
        status: nextStatus,
      });

      const updated = res.data?.request ?? { id, status: nextStatus };

      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, ...updated, status: nextStatus } : row
        )
      );

      if (selected?.id === id) {
        setSelected((prev) => ({ ...prev, ...updated, status: nextStatus }));
      }

      toast.success("Statut mis à jour.");
    } catch (err) {
      console.error("updateStatus error:", err);
      toast.error("Impossible de mettre à jour le statut.");
    }
  }

  async function toggleAcceptFees(id, currentValue) {
    try {
      const res = await api.patch(`/admin/inscription-requests/${id}/payment`, {
        accept_fees: !currentValue,
      });

      const updatedValue =
        res.data?.request?.accept_fees ??
        res.data?.accept_fees ??
        !currentValue;

      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, accept_fees: updatedValue } : row
        )
      );

      if (selected?.id === id) {
        setSelected((prev) => ({ ...prev, accept_fees: updatedValue }));
      }

      toast.success("Statut du paiement mis à jour.");
    } catch (err) {
      console.error("toggleAcceptFees error:", err);
      toast.error("Impossible de mettre à jour le paiement.");
    }
  }

  const stats = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === "pending").length,
      validated: rows.filter((r) => r.status === "validated").length,
      enrolled: rows.filter((r) => r.status === "enrolled").length,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Demandes d’inscription
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Suivi des demandes, validation et paiement des frais d’inscription.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher nom, email, téléphone…"
              className="min-w-[260px] rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button onClick={() => fetchRequests({ q, status })}>
              Rechercher
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setStatus("");
                fetchRequests({});
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card><CardContent className="p-4"><div className="text-sm text-slate-500">Total</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-slate-500">En attente</div><div className="text-2xl font-bold text-amber-600">{stats.pending}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-slate-500">Validées</div><div className="text-2xl font-bold text-blue-600">{stats.validated}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-slate-500">Inscrites</div><div className="text-2xl font-bold text-green-600">{stats.enrolled}</div></CardContent></Card>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          Chargement…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          Aucune demande trouvée.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-semibold">Demandeur</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Langue / Niveau</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold">Paiement</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const fullName =
                      row.full_name ||
                      `${row.prenom || ""} ${row.nom || ""}`.trim() ||
                      "—";

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{fullName}</div>
                          <div className="text-xs text-slate-500">
                            #{row.id} • {row.created_at || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>{row.email || "—"}</div>
                          <div className="text-xs text-slate-500">
                            {row.telephone || row.whatsapp || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>{row.module_name || row.module_id || "—"}</div>
                          <div className="text-xs text-slate-500">
                            {row.niveau_langue || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                            {row.status || "pending"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              row.accept_fees
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.accept_fees ? "Payé" : "Non payé"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelected(row)}
                            >
                              Détails
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAcceptFees(row.id, !!row.accept_fees)}
                            >
                              {row.accept_fees ? "Annuler paiement" : "Valider paiement"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {selected ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selected.full_name ||
                        `${selected.prenom || ""} ${selected.nom || ""}`.trim() ||
                        "Détail de la demande"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Demande #{selected.id}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setSelected(null)}
                  >
                    Fermer
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong>Email :</strong> {selected.email || "—"}</p>
                  <p><strong>Téléphone :</strong> {selected.telephone || "—"}</p>
                  <p><strong>WhatsApp :</strong> {selected.whatsapp || "—"}</p>
                  <p><strong>Sexe :</strong> {selected.sexe || "—"}</p>
                  <p><strong>Date de naissance :</strong> {selected.date_naissance || "—"}</p>
                  <p><strong>Lieu de naissance :</strong> {selected.lieu_naissance || "—"}</p>
                  <p><strong>Quartier :</strong> {selected.quartier || "—"}</p>
                  <p><strong>Arrondissement :</strong> {selected.arrondissement || "—"}</p>
                  <p><strong>Niveau langue :</strong> {selected.niveau_langue || "—"}</p>
                  <p><strong>Horaire préféré :</strong> {selected.horaire_prefere || "—"}</p>
                  <p><strong>Module :</strong> {selected.module_name || selected.module_id || "—"}</p>
                  <p><strong>Session :</strong> {selected.session_name || selected.session_id || "—"}</p>
                </div>

                <div className="mt-5 grid gap-3">
                  <Button onClick={() => updateStatus(selected.id, "validated")}>
                    Valider la demande
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selected.id, "enrolled")}
                  >
                    Marquer comme inscrite
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selected.id, "rejected")}
                  >
                    Rejeter la demande
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      toggleAcceptFees(selected.id, !!selected.accept_fees)
                    }
                  >
                    {selected.accept_fees
                      ? "Retirer le statut payé"
                      : "Marquer les frais comme payés"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">
                Sélectionne une demande pour voir le détail et effectuer des actions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}