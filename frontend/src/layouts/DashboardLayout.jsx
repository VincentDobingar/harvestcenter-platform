// layouts/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({ title = "Tableau de bord" }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <DashboardSidebar />
            <main className="md:col-span-3">
              <Outlet />
            </main>
          </div>
      </div>
    </div>
  );
}
