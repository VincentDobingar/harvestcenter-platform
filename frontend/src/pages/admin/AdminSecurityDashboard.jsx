// 📁 /pages/admin/AdminResetPassword.jsx
import { useEffect, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function AdminSecurityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityDashboard();
  }, []);

  async function fetchSecurityDashboard() {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/security-dashboard");
      setData(res.data || null);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger le tableau de sécurité.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!data) {
    return <p>Aucune donnée disponible.</p>;
  }

  const auditLogs = Array.isArray(data.recentAudit) ? data.recentAudit : [];

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">🔐 Security Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          ❌ Failed logins (24h): {data.failedLogins24h ?? 0}
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          📱 Active sessions: {data.activeSessions ?? 0}
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          🌍 Suspicious IPs: {data.suspiciousIPs ?? 0}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-3">📜 Audit Logs</h3>

        {auditLogs.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun log récent.
          </p>
        ) : (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="border-b pb-2 text-sm text-gray-700"
              >
                {log.user || "Utilisateur"} → {log.action || "Action"} (
                {log.entity || "Entité"})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}