import React, { lazy, Suspense } from "react";
import RequireRole from "@/components/RequireRole";
import PageLoader from "@/components/ui/PageLoader";

const TeacherDashboard = lazy(() => import("@/pages/teacher/TeacherDashboard"));

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const teacherRoutes = [
  {
    path: "teacher",
    element: (
      <RequireRole allowed={["teacher", "formateur"]}>
        {withSuspense(TeacherDashboard)}
      </RequireRole>
    ),
  },
];
