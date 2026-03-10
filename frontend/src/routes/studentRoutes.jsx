import React, { lazy } from "react";
import RequireRole from "@/components/RequireRole";
import PageLoader from "@/components/ui/PageLoader";
import { Suspense } from "react";

const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentAssignments = lazy(() => import("@/pages/student/StudentAssignments"));
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
        {withSuspense(StudentAssignments)}
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
