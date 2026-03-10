// src/AppRoutes.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import { publicRoutes } from "@/routes/PublicRoutes";
import { adminRoutes } from "@/routes/AdminRoutes";

function Router() {
  // combine les deux définitions d'objets route (conformes à useRoutes)
  const element = useRoutes([publicRoutes, adminRoutes]);
  return element;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  );
}
