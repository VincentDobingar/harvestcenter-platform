import React from "react";
import { Navigate } from "react-router-dom";
import { teacherRoutes } from "@/routes/TeacherRoutes";
import { studentRoutes } from "@/routes/StudentRoutes";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";

function DashboardIndexRedirect() {
  const { user, booting, getDashboardPath } = useAuth();

  if (booting) return <PageLoader />;

  if (!user) {
    return <Navigate to="/account?tab=login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export const dashboardRoutes = [
  {
    path: "dashboard",
    children: [
      {
        index: true,
        element: <DashboardIndexRedirect />,
      },
      ...teacherRoutes,
      ...studentRoutes,
    ],
  },
];