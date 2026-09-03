// src/components/HomeGalerie.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Section from "@/components/ui/Section";
import { Link } from "react-router-dom";
import api from "@/utils/api";
import { Image as ImageIcon } from "lucide-react";

const FALLBACK = [
  "/images/galerie/1.jpg",
  "/images/galerie/2.jpg",
  "/images/galerie/3.jpg",
  "/images/galerie/4.jpg",
  "/images/galerie/5.jpg",
  "/images/galerie/6.jpg",
  "/images/galerie/7.jpg",
  "/images/galerie/8.jpg",
];

function Tile({ src, alt, large = false }) {
  const [err, setErr] = useState(false);

  return (
    <div
      className={`relative group overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 ${
        large ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <img
        src={err ? "/images/galerie/placeholder.jpg" : src}
        alt={alt}
        loading="lazy"
        onError={() => setErr(true)}
        className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          large ? "h-80 md:h-full" : "h-48"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-4 left-4 w-10 h-10 rounded-2xl bg-white/90 flex items-center justify-center shadow">
        <ImageIcon className="w-5 h-5 text-slate-700" />
      </div>
    </div>
  );
}

export default function HomeGalerie({ limit = 8 }) {
  const { t } = useTranslation();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get(`/media?limit=${limit}`);
        const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];

        if (mounted && rows.length) {
          setItems(
            rows
              .map((d) => (typeof d === "string" ? d : d.url))
              .filter(Boolean)
              .slice(0, limit)
          );
          return;
        }
      } catch (_) {}

      if (mounted) setItems(FALLBACK.slice(0, limit));
    })();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return (
    <Section
      id="home-galerie"
      title={t("home.gallery.title")}
      subtitle={t("home.gallery.subtitle")}
      centered
    >
      {!items && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {items && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">
            {items.map((src, i) => (
              <Tile
                key={i}
                src={src}
                alt={t("home.gallery.imageAlt", { index: i + 1 })}
                large={i === 0}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/galerie"
              className="inline-flex items-center rounded-2xl border border-blue-200 bg-white px-6 py-3 text-blue-700 font-semibold hover:bg-blue-50 transition"
            >
              {t("home.gallery.viewAll")}
            </Link>
          </div>
        </>
      )}
    </Section>
  );
}