// src/routes/AdminRoutes.jsx
import React, { lazy, Suspense } from "react";
import RequireRole from "@/components/RequireRole";
import NotFound from "@/pages/NotFound";
import PageLoader from "@/components/ui/PageLoader";

import AdminLayout from "@/layouts/AdminLayout";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";

const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminForgotPassword = lazy(() => import("@/pages/admin/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("@/pages/admin/AdminResetPassword"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/SuperAdminDashboard"));
const NewsEditor = lazy(() => import("@/pages/superadmin/NewsEditor"));
const MediaManager = lazy(() => import("@/pages/superadmin/MediaManager"));
const OpportunityManager = lazy(() => import("@/pages/superadmin/OpportunityManager"));
const UserManager = lazy(() => import("@/pages/superadmin/UserManager"));

const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia"));
const AjouterUtilisateur = lazy(() => import("@/pages/admin/AjouterUtilisateur"));
const AdminStudentsPage = lazy(() => import("@/pages/admin/AdminStudentsPage"));
const AdminStudentDetail = lazy(() => import("@/pages/admin/AdminStudentDetail"));
const AdminClassesPage = lazy(() => import("@/pages/admin/AdminClassesPage"));
const AdminClassDetail = lazy(() => import("@/pages/admin/AdminClassDetail"));
const AdminTeachersPage = lazy(() => import("@/pages/admin/AdminTeachersPage"));
const AdminInscriptionRequestsPage = lazy(() => import("@/pages/admin/AdminInscriptionRequestsPage"));
const AdminCoursesPage = lazy(() => import("@/pages/admin/AdminCoursesPage"));
const AdminTimetablesPage = lazy(() => import("@/pages/admin/AdminTimetablesPage"));

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const adminPublicRoutes = [
  { path: "/admin/login", element: withSuspense(AdminLogin) },
  { path: "/admin/forgot", element: withSuspense(AdminForgotPassword) },
  { path: "/admin/reset-password/:token", element: withSuspense(AdminResetPassword) },
];

const adminProtectedRoutes = {
  path: "/admin",
  element: (
    <RequireRole allowed={["admin", "administrateur", "administrator", "secretaire", "superadmin"]}>
      <AdminLayout />
    </RequireRole>
  ),
  children: [
    { index: true, element: withSuspense(AdminDashboard) },
    { path: "inscriptions/demandes", element: withSuspense(AdminInscriptionRequestsPage) },
    { path: "students", element: withSuspense(AdminStudentsPage) },
    { path: "students/:id", element: withSuspense(AdminStudentDetail) },
    { path: "teachers", element: withSuspense(AdminTeachersPage) },
    { path: "classes", element: withSuspense(AdminClassesPage) },
    { path: "classes/:id", element: withSuspense(AdminClassDetail) },
    { path: "courses", element: withSuspense(AdminCoursesPage) },
    { path: "timetables", element: withSuspense(AdminTimetablesPage) },
    { path: "media", element: withSuspense(AdminMedia) },
    { path: "utilisateurs/ajouter", element: withSuspense(AjouterUtilisateur) },
    { path: "*", element: <NotFound /> },
  ],
};

const superAdminRoutes = {
  path: "/superadmin",
  element: (
    <RequireRole allowed={["superadmin"]}>
      <SuperAdminLayout />
    </RequireRole>
  ),
  children: [
    { index: true, element: withSuspense(SuperAdminDashboard) },
    { path: "news", element: withSuspense(NewsEditor) },
    { path: "opportunities", element: withSuspense(OpportunityManager) },
    { path: "users", element: withSuspense(UserManager) },
    { path: "media", element: withSuspense(MediaManager) },
    { path: "*", element: <NotFound /> },
  ],
};

export const adminRoutes = [
  ...adminPublicRoutes,
  adminProtectedRoutes,
  superAdminRoutes,
];