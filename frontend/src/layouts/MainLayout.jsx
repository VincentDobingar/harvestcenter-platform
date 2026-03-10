// 📁 src/layouts/MainLayout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function MainLayout() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header/Topbar en overlay */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-colors",
          onHome && !scrolled ? "bg-transparent" : "bg-white/90 backdrop-blur",
          "shadow-sm",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo-harvest.jpg" alt="Harvest Center" className="h-9" />
              <span className="text-xl font-bold text-brand hidden sm:inline">Harvest Center</span>
            </Link>
            <Navbar />
          </div>
        </div>
      </header>
        {/* Le contenu commence sous la navbar */}
        <main className="flex-1">
          <div className="h-16" /> {/* spacer pour la navbar fixe */}
          <Outlet />
        </main>
      <Footer />
    </div>
  );
}
