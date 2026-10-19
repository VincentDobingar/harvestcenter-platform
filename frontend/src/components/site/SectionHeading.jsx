// src/components/site/SectionHeading.jsx
// En-tête de section du site public : petit sur-titre or, titre display, action à droite.
import React from "react";

export default function SectionHeading({ eyebrow, title, intro, action, light = false, center = false, className = "" }) {
  return (
    <div
      className={`flex flex-col gap-5 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"} ${className}`}
    >
      <div className={center ? "max-w-3xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className={`flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] ${light ? "text-millet" : "text-brand"} ${center ? "justify-center" : ""}`}>
            <span aria-hidden="true" className="h-px w-8 bg-millet" />
            {eyebrow}
          </p>
        )}
        <h2 className={`mt-3 font-display text-[2rem] font-semibold leading-[1.1] md:text-[2.6rem] ${light ? "!text-white" : "!text-ink"}`}>
          {title}
        </h2>
        {intro && <p className={`mt-4 text-[17px] leading-8 ${light ? "text-white/75" : "text-mist"}`}>{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
