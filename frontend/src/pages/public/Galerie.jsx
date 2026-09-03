// 📁 src/pages/public/Galerie.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Section from "@/components/ui/Section";
import api from "@/utils/api";
import { Search, X } from "lucide-react";

const FALLBACK_ALL = Array.from({ length: 24 }).map(
  (_, i) => `/images/galerie/${(i % 12) + 1}.jpg`
);

function Lightbox({ open, src, onClose, alt }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center"
      >
        <X className="w-5 h-5" />
      </button>

      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full rounded-3xl shadow-2xl border border-white/10"
      />
    </div>
  );
}

export default function Galerie() {
  const { t } = useTranslation();

  const [images, setImages] = useState(null);
  const [q, setQ] = useState("");
  const [light, setLight] = useState({ open: false, src: null, alt: "" });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get("/media");
        const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];

        if (mounted && rows.length) {
          setImages(
            rows
              .map((d) => (typeof d === "string" ? d : d.url))
              .filter(Boolean)
          );
          return;
        }
      } catch (_) {}

      if (mounted) setImages(FALLBACK_ALL);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!images) return [];
    if (!q.trim()) return images;
    const term = q.toLowerCase();
    return images.filter((u) => u.toLowerCase().includes(term));
  }, [images, q]);

  return (
    <>
      <Section
        id="galerie"
        title={t("galleryPage.title")}
        subtitle={t("galleryPage.subtitle")}
        className="bg-slate-50"
      >
        <div className="flex items-center justify-between gap-4 mb-6 flex-col md:flex-row">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("galleryPage.searchPlaceholder")}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <span className="text-sm text-slate-500">
            {filtered.length} {t("galleryPage.countLabel")}
          </span>
        </div>

        {!images && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {images && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((src, i) => (
              <button
                key={i}
                className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() =>
                  setLight({
                    open: true,
                    src,
                    alt: t("galleryPage.imageAlt", { index: i + 1 }),
                  })
                }
              >
                <img
                  src={src}
                  alt={t("galleryPage.imageAlt", { index: i + 1 })}
                  loading="lazy"
                  className="w-full h-44 md:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-80" />
              </button>
            ))}
          </div>
        )}
      </Section>

      <Lightbox
        open={light.open}
        src={light.src}
        alt={light.alt}
        onClose={() => setLight({ open: false, src: null, alt: "" })}
      />
    </>
  );
}