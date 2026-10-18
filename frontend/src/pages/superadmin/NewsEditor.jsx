// src/pages/superadmin/NewsEditor.jsx
// Actualités du site : liste à gauche, éditeur à droite.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus, RefreshCw, Search, Pencil, Trash2, ExternalLink, ImageOff, Loader2, X } from "lucide-react";
import api, { BASE_URL } from "@/utils/api";
import { PageHeader, Panel, EmptyState, Field, Badge, Switch, Segmented, ListSkeleton } from "@/components/dash";

const EMPTY = { title: "", content: "", excerpt: "", is_active: true };

function imageSrc(url) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("/images/")) return url;
  if (url.startsWith("/uploads/")) return `${BASE_URL.replace(/\/api$/, "")}${url}`;
  return url;
}

function formatDate(v) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function NewsEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const titleRef = useRef(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/superadmin/news");
      setItems(res.data?.rows || []);
    } catch (e) {
      console.error("fetch news failed", e);
      toast.error("Les actualités n’ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const counts = useMemo(
    () => ({
      all: items.length,
      published: items.filter((n) => n.is_active).length,
      draft: items.filter((n) => !n.is_active).length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      if (status === "published" && !n.is_active) return false;
      if (status === "draft" && n.is_active) return false;
      return !q || `${n.title} ${n.excerpt || ""}`.toLowerCase().includes(q);
    });
  }, [items, query, status]);

  const preview = useMemo(() => {
    if (image) return URL.createObjectURL(image);
    return editing ? imageSrc(editing.image_url) : null;
  }, [image, editing]);

  useEffect(() => () => image && preview && URL.revokeObjectURL(preview), [image, preview]);

  function resetForm() {
    setForm(EMPTY);
    setImage(null);
    setEditing(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startNew() {
    resetForm();
    setTimeout(() => titleRef.current?.focus(), 0);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleEdit(item) {
    setEditing(item);
    setForm({
      title: item.title || "",
      content: item.content || "",
      excerpt: item.excerpt || "",
      is_active: !!item.is_active,
    });
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
    if (window.innerWidth < 1280) document.getElementById("news-editor")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => titleRef.current?.focus({ preventScroll: true }), 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Le titre et le texte sont obligatoires.");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("content", form.content);
    fd.append("excerpt", form.excerpt || "");
    fd.append("is_active", form.is_active ? "true" : "false");
    if (image) fd.append("image", image);

    try {
      setSubmitting(true);
      if (editing) {
        await api.put(`/superadmin/news/${editing.id}`, fd);
        toast.success("Actualité mise à jour.");
      } else {
        await api.post("/superadmin/news", fd);
        toast.success(form.is_active ? "Actualité publiée." : "Brouillon enregistré.");
      }
      resetForm();
      await fetchNews();
    } catch (err) {
      console.error("save news failed", err);
      toast.error(err?.response?.data?.message || "L’actualité n’a pas pu être enregistrée.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Supprimer « ${item.title} » ? Cette action est définitive.`)) return;
    try {
      await api.delete(`/superadmin/news/${item.id}`);
      toast.success("Actualité supprimée.");
      if (editing?.id === item.id) resetForm();
      await fetchNews();
    } catch (err) {
      console.error("delete news failed", err);
      toast.error("L’actualité n’a pas pu être supprimée.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actualités"
        subtitle="Les articles affichés sur la page d’accueil et dans la rubrique Actualités du site."
        actions={
          <>
            <button type="button" onClick={fetchNews} className="btn-ghost focus-ring">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
            </button>
            <button type="button" onClick={startNew} className="btn-primary focus-ring !py-2.5 text-sm">
              <Plus className="h-4 w-4" /> Nouvelle actualité
            </button>
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
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
                placeholder="Rechercher un titre"
                aria-label="Rechercher une actualité"
                className="field !py-2 !pl-9 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <ListSkeleton />
          ) : visible.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title={items.length ? "Aucun résultat" : "Aucune actualité"}
                action={
                  !items.length && (
                    <button type="button" onClick={startNew} className="btn-primary focus-ring !py-2.5 text-sm">
                      <Plus className="h-4 w-4" /> Écrire la première
                    </button>
                  )
                }
              >
                {items.length ? "Modifiez la recherche ou le filtre." : "Les actualités publiées ici apparaissent sur le site."}
              </EmptyState>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {visible.map((n) => {
                const src = imageSrc(n.image_url);
                const active = editing?.id === n.id;
                return (
                  <li key={n.id} className={`flex items-center gap-4 px-5 py-3.5 ${active ? "bg-millet-soft/60" : "hover:bg-paper/70"}`}>
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-paper ring-1 ring-line">
                      {src ? (
                        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-mist">
                          <ImageOff className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{n.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-mist">
                        <Badge tone={n.is_active ? "ok" : "muted"}>{n.is_active ? "Publiée" : "Brouillon"}</Badge>
                        <span className="tabular-nums">{formatDate(n.created_at)}</span>
                        {n.source_url && (
                          <a
                            href={n.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-brand hover:text-brand-800"
                          >
                            Facebook <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(n)}
                        aria-label={`Modifier « ${n.title} »`}
                        className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-white hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(n)}
                        aria-label={`Supprimer « ${n.title} »`}
                        className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-bad/10 hover:text-bad"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div id="news-editor" className="xl:sticky xl:top-24">
          <Panel
            title={editing ? "Modifier l’actualité" : "Nouvelle actualité"}
            description={editing ? `Publiée le ${formatDate(editing.created_at)}` : "Remplissez le titre et le texte, l’image est facultative."}
            actions={
              editing && (
                <button type="button" onClick={resetForm} aria-label="Annuler la modification" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-paper hover:text-ink">
                  <X className="h-4 w-4" />
                </button>
              )
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field id="news-title" label="Titre">
                <input ref={titleRef} id="news-title" name="title" value={form.title} onChange={handleChange} className="field" />
              </Field>

              <Field id="news-content" label="Texte">
                <textarea id="news-content" name="content" value={form.content} onChange={handleChange} rows={9} className="field resize-y" />
              </Field>

              <Field id="news-excerpt" label="Résumé" hint="Affiché sur les cartes de la page d’accueil. Laissé vide, le début du texte est utilisé.">
                <textarea id="news-excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} className="field resize-y" />
              </Field>

              <Field id="news-image" label="Image">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-paper ring-1 ring-line">
                    {preview ? (
                      <img src={preview} alt="Aperçu de l’image" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-mist">
                        <ImageOff className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 text-sm">
                    <input
                      ref={fileRef}
                      id="news-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-mist file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line"
                    />
                    <p className="mt-1 text-xs text-mist">{editing ? "Choisissez un fichier pour remplacer l’image actuelle." : "JPG ou PNG, format paysage de préférence."}</p>
                  </div>
                </div>
              </Field>

              <div className="rounded-xl border border-line bg-paper/60 px-4 py-3">
                <Switch
                  id="news-active"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  label="Visible sur le site"
                  hint={form.is_active ? "Les visiteurs la voient dès l’enregistrement." : "Enregistrée comme brouillon, invisible sur le site."}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary focus-ring flex-1">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Enregistrement…" : editing ? "Enregistrer les modifications" : form.is_active ? "Publier" : "Enregistrer le brouillon"}
                </button>
                {editing && (
                  <button type="button" onClick={resetForm} className="btn-ghost focus-ring">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
