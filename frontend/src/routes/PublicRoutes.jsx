// routes/PublicRoutes.jsx
// Site public (avec la barre de navigation du site) + page de connexion
// unique. Les espaces connectés sont dans DashboardRoutes / AdminRoutes.
import React from "react";
import MainLayout from "@/layouts/MainLayout";

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

export const publicRoutes = [
  // Connexion / création de compte : une seule page pour tous les rôles,
  // en plein écran (sans la barre du site).
  { path: "/account", element: <Account /> },
  { path: "/login", element: <Account /> },
  { path: "/register", element: <Account /> },

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
      { path: "unauthorized", element: <Unauthorized /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
