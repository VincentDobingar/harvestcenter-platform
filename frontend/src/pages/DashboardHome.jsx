// src/pages/DashboardHome.jsx
import React from "react";
import Dashboard from "@/pages/Dashboard";

/**
 * DashboardHome — alias léger pour compatibilité avec les routes/anciens imports
 * (certaines routes utilisent <DashboardHome /> ; plutôt que changer toutes les routes,
 * on crée un alias ici).
 */
export default function DashboardHome(props) {
  return <Dashboard {...props} />;
}
