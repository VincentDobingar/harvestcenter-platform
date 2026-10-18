// routes/DashboardRoutes.jsx
// Espaces étudiant et formateur, dans le cadre commun AppShell.
import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { teacherRoutes } from "@/routes/teacherRoutes";
import { studentRoutes } from "@/routes/studentRoutes";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppShell from "@/layouts/AppShell";
import PageLoader from "@/components/ui/PageLoader";
import NotFound from "@/pages/NotFound";

const Profile = lazy(() => import("@/pages/Profile"));
const MyCourses = lazy(() => import("@/pages/MyCourses"));
const Assignments = lazy(() => import("@/pages/Assignments"));
const Notes = lazy(() => import("@/pages/Notes"));
const Timetable = lazy(() => import("@/pages/Timetable"));

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// eslint-disable-next-line react-refresh/only-export-components -- route-local redirect component, only consumed by the dashboardRoutes config below
function DashboardIndexRedirect() {
  const { user, getDashboardPath } = useAuth();
  return <Navigate to={getDashboardPath(user?.role)} replace />;
}

export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardIndexRedirect /> },
      { path: "profile", element: withSuspense(Profile) },
      { path: "my-courses", element: withSuspense(MyCourses) },
      { path: "assignments", element: withSuspense(Assignments) },
      { path: "notes", element: withSuspense(Notes) },
      { path: "timetable", element: withSuspense(Timetable) },
      ...studentRoutes,
      ...teacherRoutes,
      { path: "*", element: <NotFound /> },
    ],
  },
];
