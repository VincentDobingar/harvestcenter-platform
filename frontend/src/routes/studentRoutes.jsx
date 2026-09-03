import React, { lazy } from "react";
import RequireRole from "@/components/RequireRole";
import PageLoader from "@/components/ui/PageLoader";
import { Suspense } from "react";

import Assignments from "@/pages/Assignments";
import AssignmentDetail from "@/pages/AssignmentDetail";

const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentPayments = lazy(() => import("@/pages/student/StudentPayments"));
const Inscription = lazy(() => import("@/pages/Inscription"));

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const studentRoutes = [
  {
    path: "student",
    element: (
      <RequireRole allowed={["student", "etudiant"]}>
        {withSuspense(StudentDashboard)}
      </RequireRole>
    ),
  },
  {
    path: "student/assignments",
    element: (
      <RequireRole allowed={["student", "etudiant"]}>
        <Assignments />
      </RequireRole>
    ),
  },
  {
    path: "student/assignments/:id",
    element: (
      <RequireRole allowed={["student", "etudiant"]}>
        <AssignmentDetail />
      </RequireRole>
    ),
  },
  {
    path: "student/payments",
    element: (
      <RequireRole allowed={["student", "etudiant"]}>
        {withSuspense(StudentPayments)}
      </RequireRole>
    ),
  },
  {
    path: "student/inscription",
    element: (
      <RequireRole allowed={["student", "etudiant"]}>
        {withSuspense(Inscription)}
      </RequireRole>
    ),
  },
];
