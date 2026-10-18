// src/pages/superadmin/OpportunityManager.jsx
// Opportunités (bourses, stages, emplois…) : liste puis éditeur bilingue.
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus, RefreshCw, Search, Pencil, Trash2, CalendarClock, Loader2, X, ExternalLink } from "lucide-react";
import api from "@/utils/api";
import { PageHeader, Panel, EmptyState, Field, Badge, Switch, Segmented, ListSkeleton } from "@/components/dash";

const TYPES = [
  { value: "scholarship", label: "Bourse" },
  { value: "fellowship", label: "Fellowship" },
  { value: "job", label: "Emploi" },
  { value: "internship", label: "Stage" },
  { value: "training", label: "Formation" },
  { value: "grant", label: "Subvention" },
  { value: "other", label: "Autre" },
];
const typeLabel = (v) => TYPES.find((t) => t.value === v)?.label || v || "Autre";

const EMPTY = {
  title_fr: "", title_en: "", type: "other",
  sponsor_fr: "", sponsor_en: "",
  location_fr: "", location_en: "",
  country_fr: "", country_en: "",
  deadline: "",
  summary_fr: "", summary_en: "",
  content_fr: "", content_en: "",
  apply_url: "", is_active: true,
};

const dateInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};
const pickFr = (it, k) => it?.[`${k}_fr`] || it?.[k] || "";
const pickEn = (it, k) => it?.[`${k}_en`] || "";

function deadlineInfo(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const days = Math.ceil((d.setHours(23, 59, 59) - Date.now()) / 86400000);
  const label = new Date(v).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  if (days < 0) return { label, tone: "muted", note: "clôturée" };
  if (days <= 14) return { label, tone: "warn", note: days === 0 ? "dernier jour" : `J-${days}` };
  return { label, tone: "info", note: null };
}

/** Paire de champs FR / EN côte à côte. */
function Bilingual({ name, label, form, onChange, textarea, rows = 3 }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {["fr", "en"].map((lng) => (
        <Field key={lng} id={`opp-${name}-${lng}`} label={`${label} (${lng.toUpperCase()})`}>
          <Tag
            id={`opp-${name}-${lng}`}
            name={`${name}_${lng}`}
            value={form[`${name}_${lng}`]}
            onChange={onChange}
            rows={textarea ? rows : undefined}
            className={`field ${textarea ? "resize-y" : ""}`}
          />
        </Field>
      ))}
    </div>
  );
}

export default function OpportunityManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  async function fetchItems() {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/opportunities");
      setItems(res.data?.rows || []);
    } catch (err) {
      console.error("fetch opportunities error:", err);
      toast.error("Les opportunités n’ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      published: items.filter((i) => i.is_active).length,
      draft: items.filter((i) => !i.is_active).length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (status === "published" && !i.is_active) return false;
      if (status === "draft" && i.is_active) return false;
      const hay = `${i.title_fr || ""} ${i.title_en || ""} ${i.title || ""} ${i.sponsor_fr || ""} ${i.sponsor || ""}`.toLowerCase();
      return !q || hay.includes(q);
    });
  }, [items, query, status]);

  function openForm() {
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function resetForm() {
    setForm(EMPTY);
    setEditing(null);
    setImage(null);
    setShowForm(false);
  }

  function startNew() {
    setForm(EMPTY);
    setEditing(null);
    setImage(null);
    openForm();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleEdit(item) {
    setEditing(item);
    setForm({
      title_fr: pickFr(item, "title"), title_en: pickEn(item, "title"),
      type: item.type || "other",
      sponsor_fr: pickFr(item, "sponsor"), sponsor_en: pickEn(item, "sponsor"),
      location_fr: pickFr(item, "location"), location_en: pickEn(item, "location"),
      country_fr: pickFr(item, "country"), country_en: pickEn(item, "country"),
      deadline: dateInput(item.deadline),
      summary_fr: pickFr(item, "summary"), summary_en: pickEn(item, "summary"),
      content_fr: pickFr(item, "content"), content_en: pickEn(item, "content"),
      apply_url: item.apply_url || "",
      is_active: !!item.is_active,
    });
    setImage(null);
    openForm();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title_fr.trim() && !form.title_en.trim()) {
      toast.error("Renseignez au moins le titre en français ou en anglais.");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === "boolean" ? (v ? "1" : "0") : v ?? ""));
    if (image) fd.append("image", image);

    try {
      setSubmitting(true);
      if (editing) {
        await api.put(`/superadmin/opportunities/${editing.id}`, fd);
        toast.success("Opportunité mise à jour.");
      } else {
        await api.post("/superadmin/opportunities", fd);
        toast.success(form.is_active ? "Opportunité publiée." : "Brouillon enregistré.");
      }
      resetForm();
      await fetchItems();
    } catch (err) {
      console.error("submit opportunity error:", err);
      toast.error(err?.response?.data?.message || "L’opportunité n’a pas pu être enregistrée.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const title = item.title_fr || item.title_en || item.title || "cette opportunité";
    if (!window.confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) return;
    try {
      await api.delete(`/superadmin/opportunities/${item.id}`);
      toast.success("Opportunité supprimée.");
      if (editing?.id === item.id) resetForm();
      await fetchItems();
    } catch (err) {
      console.error("delete opportunity error:", err);
      toast.error(err?.response?.data?.message || "L’opportunité n’a pas pu être supprimée.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunités"
        subtitle="Bourses, stages, emplois et formations proposés aux visiteurs du site."
        actions={
          <>
            <button type="button" onClick={fetchItems} className="btn-ghost focus-ring">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
            </button>
            <button type="button" onClick={startNew} className="btn-primary focus-ring !py-2.5 text-sm">
              <Plus className="h-4 w-4" /> Nouvelle opportunité
            </button>
          </>
        }
      />

      <Panel bodyClassName="!p-0">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            label="Filtrer par statut"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "Toutes", count: counts.all },
              { value: "published", label: "Publiées", count: counts.published },
              { value: "draft", label: "Brouillons", count: counts.draft },
            ]}
          />
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Titre ou organisme"
              aria-label="Rechercher une opportunité"
              className="field !py-2 !pl-9 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : visible.length === 0 ? (
          <div className="p-5">
            <EmptyState title={items.length ? "Aucun résultat" : "Aucune opportunité"}>
              {items.length ? "Modifiez la recherche ou le filtre." : "Ajoutez une bourse, un stage ou une offre d’emploi."}
            </EmptyState>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((item) => {
              const dl = deadlineInfo(item.deadline);
              const sponsor = item.sponsor_fr || item.sponsor_en || item.sponsor;
              const country = item.country_fr || item.country_en || item.country;
              return (
                <li key={item.id} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center ${editing?.id === item.id ? "bg-millet-soft/60" : "hover:bg-paper/70"}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="ink">{typeLabel(item.type)}</Badge>
                      {!item.is_active && <Badge>Brouillon</Badge>}
                    </div>
                    <p className="mt-1.5 truncate font-medium text-ink">{item.title_fr || item.title_en || item.title || "Sans titre"}</p>
                    <p className="truncate text-[13px] text-mist">{[sponsor, country].filter(Boolean).join(" · ") || "Organisme non renseigné"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {dl && (
                      <span className="inline-flex items-center gap-1.5 text-[13px] tabular-nums text-mist">
                        <CalendarClock className="h-4 w-4" />
                        {dl.label}
                        {dl.note && <Badge tone={dl.tone}>{dl.note}</Badge>}
                      </span>
                    )}
                    {item.apply_url && (
                      <a href={item.apply_url} target="_blank" rel="noreferrer" aria-label="Ouvrir le lien de candidature" className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-white hover:text-ink">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button type="button" onClick={() => handleEdit(item)} aria-label="Modifier" className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-white hover:text-ink">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(item)} aria-label="Supprimer" className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-bad/10 hover:text-bad">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {showForm && (
        <div ref={formRef} className="scroll-mt-24">
          <Panel
            title={editing ? "Modifier l’opportunité" : "Nouvelle opportunité"}
            description="Le titre en français ou en anglais suffit pour enregistrer. Les champs anglais s’affichent aux visiteurs qui lisent le site en anglais."
            actions={
              <button type="button" onClick={resetForm} aria-label="Fermer l’éditeur" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-paper hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-mist">L’essentiel</h3>
                <Bilingual name="title" label="Titre" form={form} onChange={handleChange} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field id="opp-type" label="Type">
                    <select id="opp-type" name="type" value={form.type} onChange={handleChange} className="field">
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id="opp-deadline" label="Date limite">
                    <input id="opp-deadline" type="date" name="deadline" value={form.deadline} onChange={handleChange} className="field" />
                  </Field>
                  <Field id="opp-url" label="Lien de candidature">
                    <input id="opp-url" type="url" name="apply_url" value={form.apply_url} onChange={handleChange} placeholder="https://" className="field" />
                  </Field>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-mist">Organisme et lieu</h3>
                <Bilingual name="sponsor" label="Organisme" form={form} onChange={handleChange} />
                <Bilingual name="location" label="Lieu" form={form} onChange={handleChange} />
                <Bilingual name="country" label="Pays" form={form} onChange={handleChange} />
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-mist">Description</h3>
                <Bilingual name="summary" label="Résumé" form={form} onChange={handleChange} textarea rows={3} />
                <Bilingual name="content" label="Détails" form={form} onChange={handleChange} textarea rows={8} />
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <Field id="opp-image" label="Image" hint={editing ? "Choisissez un fichier pour remplacer l’image actuelle." : "Facultative."}>
                  <input
                    id="opp-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-mist file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line"
                  />
                </Field>
                <div className="self-end rounded-xl border border-line bg-paper/60 px-4 py-3">
                  <Switch
                    id="opp-active"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    label="Visible sur le site"
                    hint={form.is_active ? "Publiée dès l’enregistrement." : "Enregistrée comme brouillon."}
                  />
                </div>
              </section>

              <div className="flex flex-wrap gap-2 border-t border-line pt-5">
                <button type="submit" disabled={submitting} className="btn-primary focus-ring">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Enregistrement…" : editing ? "Enregistrer les modifications" : form.is_active ? "Publier" : "Enregistrer le brouillon"}
                </button>
                <button type="button" onClick={resetForm} className="btn-ghost focus-ring">
                  Annuler
                </button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
