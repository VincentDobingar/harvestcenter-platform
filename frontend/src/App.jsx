// 📁 src/App.jsx
import { BrowserRouter, useRoutes } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { publicRoutes } from "@/routes/PublicRoutes";
import { adminRoutes } from "@/routes/AdminRoutes";
import { dashboardRoutes } from "@/routes/DashboardRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";

function normalizeRoutes(items) {
  return items.filter(Boolean).flatMap((r) => (Array.isArray(r) ? r : [r]));
}

function AppRoutes() {
  const routes = normalizeRoutes([
    publicRoutes,
    dashboardRoutes,
    adminRoutes,
  ]);

  return useRoutes(routes);
}

function AppLanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";
    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr";
  }, [i18n.resolvedLanguage]);

  return null;
}

function AppFallback() {
  const { t } = useTranslation();
  return <div className="p-6 text-center">{t("common.loading")}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppLanguageSync />
          <Suspense fallback={<AppFallback />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}