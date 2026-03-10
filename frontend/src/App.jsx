// 📁 src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { publicRoutes } from "@/routes/PublicRoutes";
import { adminRoutes } from "@/routes/AdminRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { Suspense } from "react";

function normalizeRoutes(items) {
  return items.filter(Boolean).flatMap((r) => (Array.isArray(r) ? r : [r]));
}

function AppRoutes() {
  const routes = normalizeRoutes([publicRoutes, adminRoutes]);
  return useRoutes(routes);
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
