// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";

export default function ProtectedRoute({ children = null }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/account?tab=login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children ? children : <Outlet />;
}