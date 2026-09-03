// src/pages/student/StudentPayments.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export default function StudentPayments() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPayments() {
      try {
        setLoading(true);
        setErr("");

        const endpoint = user?.id
          ? `/profiles/${user.id}/payments`
          : `/payments/me`;

        const res = await api.get(endpoint).catch(() => ({ data: [] }));
        if (!mounted) return;

        const data = res?.data ?? [];
        const rows = Array.isArray(data) ? data : data.rows ?? [];
        setPayments(rows);
      } catch (e) {
        console.error("StudentPayments load error:", e);
        if (!mounted) return;

        setErr(
          e?.response?.data?.message ||
            t("myPaymentsPage.errors.load", {
              defaultValue: "Impossible de charger les paiements.",
            })
        );
        setPayments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPayments();

    return () => {
      mounted = false;
    };
  }, [user, t]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">
        {t("myPaymentsPage.title", { defaultValue: "Mes paiements" })}
      </h1>

      {loading ? (
        <div>{t("common.loading", { defaultValue: "Chargement..." })}</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : payments.length === 0 ? (
        <div className="text-gray-500">
          {t("myPaymentsPage.empty", { defaultValue: "Aucun paiement trouvé." })}
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id ?? JSON.stringify(p)}
              className="p-4 border rounded-2xl bg-white flex justify-between items-center"
            >
              <div>
                <div className="font-medium">
                  {p.description ??
                    p.coursTitle ??
                    p.course_title ??
                    t("myPaymentsPage.payment", { defaultValue: "Paiement" })}
                </div>

                <div className="text-sm text-gray-500">
                  {t("myPaymentsPage.status", { defaultValue: "Statut" })}:{" "}
                  {p.status ?? p.payment_status ?? "—"}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">{p.amount ?? p.total ?? "—"}</div>
                <div className="text-xs text-gray-500">
                  {p.currency ?? "USD"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}