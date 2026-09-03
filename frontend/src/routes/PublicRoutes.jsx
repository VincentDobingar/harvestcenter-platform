// routes/PublicRoutes.jsx
import React, { lazy, Suspense } from "react";
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PageLoader from "@/components/ui/PageLoader";

import { studentRoutes } from "./studentRoutes";
import { teacherRoutes } from "./teacherRoutes";

// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/public/Contact";
import Courses from "@/pages/public/Formations";
import Equipe from "@/pages/Equipe";
import Inscription from "@/pages/Inscription";
import Galerie from "@/pages/public/Galerie";
import NotFound from "@/pages/NotFound";
import Account from "@/pages/auth/Account";
import Unauthorized from "@/pages/Unauthorized";
import Opportunities from "@/pages/Opportunities";
import Actualites from "@/pages/Actualites";
import ActualiteDetail from "@/pages/ActualiteDetail";
import OpportunityDetail from "@/pages/OpportunityDetail"; 

// Dashboard core
const DashboardIndex = lazy(() => import("@/pages/dashboard/DashboardIndex"));
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

export const publicRoutes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "equipe", element: <Equipe /> },
      { path: "opportunites", element: <Opportunities /> },
      { path: "actualites", element: <Actualites /> },
      { path: "actualites/opportunites/:slug", element: <OpportunityDetail /> },
      { path: "actualites/:type/:slug", element: <ActualiteDetail /> },
      { path: "galerie", element: <Galerie /> },
      { path: "contact", element: <Contact /> },
      { path: "courses", element: <Courses /> },
      { path: "inscription", element: <Inscription /> },

      { path: "account", element: <Account /> },
      { path: "login", element: <Account /> },
      { path: "register", element: <Account /> },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <DashboardLayout />,
            children: [
              { index: true, element: withSuspense(DashboardIndex) },
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
        ],
      },

      { path: "unauthorized", element: <Unauthorized /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];