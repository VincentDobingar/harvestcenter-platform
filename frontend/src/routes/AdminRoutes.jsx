// src/routes/AdminRoutes.jsx
import React, { lazy } from "react";
import RequireRole from "@/components/RequireRole";
import NotFound from "@/pages/NotFound";

// Layouts
import AdminLayout from "@/layouts/AdminLayout";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";

// Lazy-loaded pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminForgotPassword = lazy(() => import("@/pages/admin/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("@/pages/admin/AdminResetPassword"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/SuperAdminDashboard"));
const NewsEditor = lazy(() => import("@/pages/superadmin/NewsEditor"));
const MediaManager = lazy(() => import("@/pages/superadmin/MediaManager"));
const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia"));
const AjouterUtilisateur = lazy(() => import("@/pages/admin/AjouterUtilisateur"));

// Pages légères (liste, détails)
import AdminStudentsPage from "@/pages/admin/AdminStudentsPage";
import AdminClassesPage from "@/pages/admin/AdminClassesPage";
import AdminClassDetail from "@/pages/admin/AdminClassDetail";
import AdminCourseDetail from "@/pages/admin/AdminCourseDetail";
import AdminTeachersPage from "@/pages/admin/AdminTeachersPage";

export const adminRoutes = {
  path: "/admin",
  children: [
    { index: true, element: <AdminDashboard /> },
    { path: "login", element: <AdminLogin /> },
    { path: "forgot", element: <AdminForgotPassword /> },
    { path: "reset-password/:token", element: <AdminResetPassword /> },

    { path: "students", element: <AdminStudentsPage /> },
    { path: "classes", element: <AdminClassesPage /> },
    { path: "classes/:id", element: <AdminClassDetail /> },
    { path: "courses/:id", element: <AdminCourseDetail /> },
    { path: "teachers", element: <AdminTeachersPage /> },

    // Protected admin area
    {
      path: "",
      element: (
        <RequireRole allowed={["admin", "administrateur", "secretaire"]}>
          <AdminLayout />
        </RequireRole>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "media", element: <AdminMedia /> },
        { path: "utilisateurs/ajouter", element: <AjouterUtilisateur /> },
        { path: "*", element: <NotFound /> },
      ],
    },

    { path: "*", element: <NotFound /> },
  ],
};

export const superAdminRoutes = {
  path: "/superadmin",
  element: (
    <RequireRole allowed={["superadmin"]}>
      <SuperAdminLayout />
    </RequireRole>
  ),
  children: [
    { index: true, element: <SuperAdminDashboard /> },
    { path: "news", element: <NewsEditor /> },
    { path: "media", element: <MediaManager /> },
    { path: "*", element: <NotFound /> },
  ],
};
