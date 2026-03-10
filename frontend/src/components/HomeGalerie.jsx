// 📁 src/components/HomeGalerie.jsx

import React, { useEffect, useState } from "react";
import Section from "@/components/ui/Section";
import { Link } from "react-router-dom";
import api from "@/utils/api";

// ➜ Repli statique si l'API n'est pas disponible
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

function Tile({ src, alt }) {
  const [err, setErr] = useState(false);
  return (
    <div className="relative group overflow-hidden rounded-xl bg-gray-100 border border-brand/10">
      <img
        src={err ? "/images/galerie/placeholder.jpg" : src}
        alt={alt}
        loading="lazy"
        onError={() => setErr(true)}
        className="w-full h-44 md:h-48 lg:h-40 xl:h-44 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition" />
    </div>
  );
}

export default function HomeGalerie({ limit = 8 }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // ➜ adapte l’endpoint si besoin (ex: /media/galerie?limit=8)
        const { data } = await api.get(`/media?limit=${limit}`);
        if (mounted && Array.isArray(data) && data.length) {
          // on accepte {url,title} ou string
          setItems(
            data
              .map((d) => (typeof d === "string" ? d : d.url))
              .filter(Boolean)
              .slice(0, limit)
          );
          return;
        }
      } catch (_) {
        // ignore
      }
      if (mounted) setItems(FALLBACK.slice(0, limit));
    })();
    return () => (mounted = false);
  }, [limit]);

  return (
    <Section
      id="home-galerie"
      title="En images"
      subtitle="La vie au Harvest Center : cours, ateliers et événements."
      centered
    >
      {/* Skeleton simple pendant le chargement */}
      {!items && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-44 md:h-48 lg:h-40 xl:h-44 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      )}

      {items && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((src, i) => (
              <Tile key={i} src={src} alt={`Galerie ${i + 1}`} />
            ))}
          </div>

          <div className="text-center mt-6">
            <Link to="/galerie" className="btn-outline-brand">
              Voir toute la galerie
            </Link>
          </div>
        </>
      )}
    </Section>
  );
}
