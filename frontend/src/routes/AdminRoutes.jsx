// src/routes/AdminRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import RequireRole from "@/components/RequireRole";
import NotFound from "@/pages/NotFound";
import PageLoader from "@/components/ui/PageLoader";

import AppShell from "@/layouts/AppShell";

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

// Anciennes adresses de connexion admin : tout passe par la page unique.
const toLogin = <Navigate to="/account?tab=login" replace />;
const adminPublicRoutes = [
  { path: "/admin/login", element: toLogin },
  { path: "/admin/forgot", element: toLogin },
  { path: "/admin/reset-password/:token", element: toLogin },
];

const adminProtectedRoutes = {
  path: "/admin",
  element: (
    <RequireRole allowed={["admin", "superadmin"]}>
      <AppShell />
    </RequireRole>
  ),
  children: [
    { index: true, element: withSuspense(AdminDashboard) },
    { path: "dashboard", element: <Navigate to="/admin" replace /> },
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
      <AppShell />
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