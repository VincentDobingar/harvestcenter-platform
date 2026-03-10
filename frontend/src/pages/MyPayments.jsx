// src/pages/MyPayments.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

/**
 * MyPayments — page simple pour lister les paiements d'un utilisateur.
 * Remplace/étends selon ton backend (champs, endpoints).
 */
export default function MyPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        // tentative d'endpoint : adapte selon ton API
        const endpoint = user?.id ? `/profiles/${user.id}/payments` : `/payments/me`;
        const res = await api.get(endpoint).catch(() => ({ data: [] }));
        if (!mounted) return;
        // normalize: res.data may be array or { rows: [...] }
        const data = res?.data ?? [];
        const rows = Array.isArray(data) ? data : (data.rows ?? []);
        setPayments(rows);
      } catch (e) {
        console.error("MyPayments load error", e);
        if (mounted) setErr("Impossible de charger les paiements");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mes paiements</h1>

      {loading ? (
        <div>Chargement…</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : payments.length === 0 ? (
        <div className="text-gray-500">Aucun paiement trouvé.</div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id ?? JSON.stringify(p)} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{p.description ?? p.coursTitle ?? "Paiement"}</div>
                <div className="text-sm text-gray-500">Statut: {p.status ?? p.payment_status ?? "—"}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{p.amount ?? p.total ?? "—"}</div>
                <div className="text-xs text-gray-500">{p.currency ?? "USD"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
