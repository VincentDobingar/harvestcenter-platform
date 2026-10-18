// src/components/dash/index.jsx
// Briques communes des tableaux de bord : en-tête de page, chiffres clés,
// panneaux, états vides. Toutes les pages d'accueil des espaces les utilisent
// pour garder la même allure quel que soit le rôle.
import React from "react";
import { Link } from "react-router-dom";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2rem]">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] text-mist">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  default: "text-ink",
  brand: "text-brand",
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
};

/**
 * Chiffre clé. `primary` met la carte en avant (fond bleu nuit) : à réserver
 * au chiffre le plus important de la page.
 */
export function StatCard({ label, value, unit, hint, icon: Icon, tone = "default", to, primary = false }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm ${primary ? "text-white/75" : "text-mist"}`}>{label}</p>
        {Icon && (
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
              primary ? "bg-white/10 text-millet" : "bg-paper text-ink/70"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <p
        className={`mt-3 font-display text-[2rem] font-semibold leading-none tabular-nums ${
          primary ? "text-white" : TONES[tone] || TONES.default
        }`}
      >
        {value}
        {unit && (
          <span className={`ml-1.5 font-ui text-sm font-medium ${primary ? "text-white/70" : "text-mist"}`}>{unit}</span>
        )}
      </p>
      {hint && <p className={`mt-2 text-[13px] ${primary ? "text-white/65" : "text-mist"}`}>{hint}</p>}
    </>
  );

  const cls = `block rounded-2xl p-5 transition ${
    primary
      ? "bg-ink text-white"
      : "border border-line bg-white"
  } ${to ? "focus-ring hover:border-ink/25 hover:shadow-[0_6px_24px_-12px_rgba(14,42,71,0.3)]" : ""}`;

  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function StatGrid({ children, cols = 4 }) {
  const map = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 xl:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  };
  return <div className={`grid gap-4 ${map[cols] || map[4]}`}>{children}</div>;
}

export function Panel({ title, description, actions, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`rounded-2xl border border-line bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-[15.5px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-mist">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-paper/60 px-5 py-8 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-mist">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children, action }) {
  const map = {
    info: "border-brand/25 bg-brand/5",
    warn: "border-millet/50 bg-millet-soft",
    bad: "border-bad/25 bg-bad/5 text-bad",
  };
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border px-5 py-4 text-[14.5px] text-ink sm:flex-row sm:items-center sm:justify-between ${map[tone]}`}>
      <div>{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Champ de formulaire : libellé, contrôle, aide facultative. */
export function Field({ id, label, hint, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-mist">{hint}</p>}
    </div>
  );
}

const BADGE_TONES = {
  ok: "bg-ok/10 text-ok",
  warn: "bg-millet-soft text-warn",
  bad: "bg-bad/10 text-bad",
  info: "bg-brand/10 text-brand",
  muted: "bg-paper text-mist",
  ink: "bg-ink text-white",
};

export function Badge({ tone = "muted", children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONES[tone] || BADGE_TONES.muted} ${className}`}>
      {children}
    </span>
  );
}

/** Interrupteur accessible (case à cocher stylée). */
export function Switch({ id, checked, onChange, label, hint }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
        <span className="h-6 w-11 rounded-full bg-line transition peer-checked:bg-ok peer-focus-visible:ring-4 peer-focus-visible:ring-millet/40" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-mist">{hint}</span>}
      </span>
    </label>
  );
}

/** Onglets de filtre compacts (Tout / Publiés / Brouillons…). */
export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-xl bg-paper p-1 ring-1 ring-line">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`focus-ring rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
            value === o.value ? "bg-white text-ink shadow-sm" : "text-mist hover:text-ink"
          }`}
        >
          {o.label}
          {o.count != null && <span className="ml-1.5 tabular-nums text-mist">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <ul className="divide-y divide-line" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-12 w-12 animate-pulse rounded-lg bg-paper" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-paper" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-paper" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-line bg-white" />
      ))}
    </div>
  );
}
