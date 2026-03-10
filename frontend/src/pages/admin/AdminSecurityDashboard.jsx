import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminSecurityDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/security-dashboard")
      .then(res => setData(res.data));
  }, []);

  if (!data) return <p>Chargement...</p>;

  return (
    <div>
      <h2>🔐 Security Dashboard</h2>

      <div>❌ Failed logins (24h): {data.failedLogins24h}</div>
      <div>📱 Active sessions: {data.activeSessions}</div>
      <div>🌍 Suspicious IPs: {data.suspiciousIPs}</div>

      <h3>📜 Audit Logs</h3>
      {data.recentAudit.map(log => (
        <div key={log.id}>
          {log.user} → {log.action} ({log.entity})
        </div>
      ))}
    </div>
  );
}
