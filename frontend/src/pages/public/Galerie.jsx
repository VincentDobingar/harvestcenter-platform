// 📁 src/pages/public/Galerie.jsx

import React, { useEffect, useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import api from "@/utils/api";

const FALLBACK_ALL = Array.from({ length: 24 }).map((_, i) => `/images/galerie/${(i % 12) + 1}.jpg`);

function Lightbox({ open, src, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} alt="Agrandir" className="max-w-full max-h-full rounded-lg shadow-2xl" />
    </div>
  );
}

export default function Galerie() {
  const [images, setImages] = useState(null);
  const [q, setQ] = useState("");
  const [light, setLight] = useState({ open: false, src: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // ➜ adapte l’endpoint si besoin (ex: /media/galerie)
        const { data } = await api.get("/media");
        if (mounted && Array.isArray(data) && data.length) {
          setImages(data.map((d) => (typeof d === "string" ? d : d.url)).filter(Boolean));
          return;
        }
      } catch (_) {}
      if (mounted) setImages(FALLBACK_ALL);
    })();
    return () => (mounted = false);
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
        title="Galerie"
        subtitle="Quelques moments de nos cours, ateliers et activités."
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (ex : anglais, atelier, hsk…) "
            className="w-full md:w-80 border rounded-xl px-4 py-2"
          />
          <span className="text-sm text-gray-500">{filtered.length} image(s)</span>
        </div>

        {!images && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {images && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((src, i) => (
              <button
                key={i}
                className="group relative overflow-hidden rounded-xl bg-gray-100 border border-brand/10"
                onClick={() => setLight({ open: true, src })}
              >
                <img
                  src={src}
                  alt={`Image ${i + 1}`}
                  loading="lazy"
                  className="w-full h-40 md:h-44 lg:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              </button>
            ))}
          </div>
        )}
      </Section>

      <Lightbox open={light.open} src={light.src} onClose={() => setLight({ open: false, src: null })} />
    </>
  );
}
