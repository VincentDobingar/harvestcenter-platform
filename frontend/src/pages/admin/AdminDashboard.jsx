// src/pages/admin/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminStudentTable from "@/components/AdminStudentTable";
import AdminStudentTableServer from "@/components/AdminStudentTableServer";
import { normalizePath } from "@/utils/url";

/**
 * AdminDashboard
 * - simple example page that lists students and opens their details
 * - in real app, replace fetchStudents() by real data loading hook
 */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // sample data — replace with real fetch
  const students = [
    { id: 1, full_name: "Alice Dupont", email: "alice@example.com" },
    { id: 2, full_name: "Bob Martin", email: "bob@example.com" },
  ];

  function handleOpenDetails(s) {
    const path = normalizePath(`/admin/etudiants/${s.id}`);
    navigate(path, { replace: true });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Tableau des étudiants</h1>

      <div className="mb-6">
        <AdminStudentTable students={students} onOpenDetails={handleOpenDetails} />
      </div>

      <div className="mb-6">
        {/* Server variant (accepts onOpenDetails prop too) */}
        <AdminStudentTableServer students={students} onOpenDetails={handleOpenDetails} />
      </div>
    </div>
  );
}
