// src/pages/superadmin/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Newspaper, Megaphone, LayoutDashboard, Image as ImageIcon } from "lucide-react";
import api from "@/utils/api";
import { PageHeader, StatCard, StatGrid, Panel, SkeletonGrid, Notice } from "@/components/dash";

const SHORTCUTS = [
  { to: "/superadmin/news", icon: Newspaper, label: "Publier une actualité", desc: "Page d’accueil et rubrique Actualités" },
  { to: "/superadmin/opportunities", icon: Megaphone, label: "Ajouter une opportunité", desc: "Bourses, stages, offres d’emploi" },
  { to: "/superadmin/users", icon: Users, label: "Gérer les comptes", desc: "Rôles et accès des utilisateurs" },
  { to: "/superadmin/media", icon: ImageIcon, label: "Médiathèque", desc: "Photos et documents du site" },
  { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord admin", desc: "Inscriptions, classes, paiements" },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ users: 0, news: 0, opportunities: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/superadmin/dashboard");
        setStats({
          users: res.data?.users ?? 0,
          news: res.data?.news ?? 0,
          opportunities: res.data?.opportunities ?? 0,
        });
      } catch (e) {
        console.error("dashboard stats error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Vue d’ensemble" subtitle="Contenus publiés sur le site et comptes de la plateforme." />

      {error && <Notice tone="bad">Les chiffres n’ont pas pu être chargés. Rechargez la page dans un instant.</Notice>}

      {loading ? (
        <SkeletonGrid count={3} />
      ) : (
        <StatGrid cols={3}>
          <StatCard primary icon={Users} label="Comptes utilisateurs" value={stats.users} to="/superadmin/users" />
          <StatCard icon={Newspaper} label="Actualités publiées" value={stats.news} to="/superadmin/news" />
          <StatCard icon={Megaphone} label="Opportunités en ligne" value={stats.opportunities} to="/superadmin/opportunities" />
        </StatGrid>
      )}

      <Panel title="Accès rapides" bodyClassName="!p-0">
        <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
          {SHORTCUTS.map(({ to, icon: Icon, label, desc }) => (
            <li key={to} className="sm:border-b sm:border-line sm:odd:border-r">
              <Link to={to} className="focus-ring flex items-center gap-4 px-5 py-4 hover:bg-paper">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-ink">{label}</span>
                  <span className="block truncate text-[13px] text-mist">{desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
