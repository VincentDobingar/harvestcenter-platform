// layouts/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({ children, title }) {
  const { t } = useTranslation();

  const resolvedTitle = title || t("dashboardLayout.title");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <DashboardSidebar />
          </aside>

          {/* Main content */}
          <main className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 min-h-[70vh]">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-brand">
                  {resolvedTitle}
                </h1>
              </div>

              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
