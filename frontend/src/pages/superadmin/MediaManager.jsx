// src/pages/superadmin/MediaManager.jsx
// Médiathèque : envoyer des fichiers, les retrouver et copier leur lien.
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { UploadCloud, RefreshCw, Search, Copy, Trash2, ExternalLink, FileText, Loader2, X } from "lucide-react";
import api from "@/utils/api";
import { PageHeader, Panel, EmptyState, Field } from "@/components/dash";

const isImage = (m) => /^image\//.test(m.mimetype || "") || /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(m.url || m.filename || "");

function formatSize(bytes) {
  const b = Number(bytes || 0);
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} Mo`;
  return `${Math.max(1, Math.round(b / 1024))} Ko`;
}

export default function MediaManager() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFolder, setFilterFolder] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  async function fetchList(params = {}) {
    setLoading(true);
    try {
      const res = await api.get("/media", { params });
      setMedia(res.data?.rows || []);
    } catch (err) {
      console.error("fetch media error:", err);
      toast.error("La médiathèque n’a pas pu être chargée.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  function applyFilters(e) {
    e?.preventDefault();
    const params = {};
    if (filterFolder.trim()) params.folder = filterFolder.trim();
    if (filterTag.trim()) params.tag = filterTag.trim();
    fetchList(params);
  }

  function clearFilters() {
    setFilterFolder("");
    setFilterTag("");
    fetchList();
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? media.filter((m) => `${m.originalname || ""} ${m.filename || ""}`.toLowerCase().includes(q)) : media;
  }, [media, query]);

  function resetForm() {
    setFile(null);
    setFolder("");
    setTagsInput("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload(e) {
    e.preventDefault();
    if (!file) {
      toast.error("Choisissez d’abord un fichier.");
      return;
    }
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    if (folder.trim()) form.append("folder", folder.trim());
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length) form.append("tags", JSON.stringify(tags));

    try {
      const res = await api.post("/media", form, {
        onUploadProgress: (ev) => ev.total && setProgress(Math.round((ev.loaded * 100) / ev.total)),
      });
      toast.success("Fichier ajouté à la médiathèque.");
      if (res.data?.file) setMedia((prev) => [res.data.file, ...prev]);
      else await fetchList();
      resetForm();
    } catch (err) {
      console.error("upload media error:", err);
      toast.error(String(err?.response?.data?.message || err?.response?.data?.error || "Le fichier n’a pas pu être envoyé."));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function remove(m) {
    if (!window.confirm(`Supprimer « ${m.originalname || m.filename} » ? Les pages qui l’utilisent n’afficheront plus ce fichier.`)) return;
    try {
      await api.delete(`/media/${m.id}`);
      toast.success("Fichier supprimé.");
      setMedia((prev) => prev.filter((it) => Number(it.id) !== Number(m.id)));
    } catch (err) {
      console.error("delete media error:", err);
      toast.error("Le fichier n’a pas pu être supprimé.");
    }
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié.");
    } catch {
      toast.error("Le lien n’a pas pu être copié.");
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Médiathèque"
        subtitle="Les photos et documents utilisés sur le site. Copiez le lien d’un fichier pour l’insérer ailleurs."
        actions={
          <button type="button" onClick={applyFilters} className="btn-ghost focus-ring">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </button>
        }
      />

      <Panel title="Ajouter un fichier">
        <form onSubmit={upload} className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <label
            htmlFor="media-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex min-h-[148px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-6 text-center transition ${
              dragOver ? "border-brand bg-brand/5" : "border-line bg-paper/60 hover:border-ink/30"
            }`}
          >
            <UploadCloud className="h-7 w-7 text-ink/70" />
            {file ? (
              <>
                <span className="max-w-full truncate font-medium text-ink">{file.name}</span>
                <span className="text-[13px] text-mist">{formatSize(file.size)}, cliquez pour changer</span>
              </>
            ) : (
              <>
                <span className="font-medium text-ink">Déposez un fichier ici ou cliquez pour le choisir</span>
                <span className="text-[13px] text-mist">Images, PDF ou documents</span>
              </>
            )}
            <input ref={inputRef} id="media-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" />
          </label>

          <div className="space-y-4">
            <Field id="media-folder" label="Dossier" hint="Facultatif, par exemple images/bannieres">
              <input id="media-folder" value={folder} onChange={(e) => setFolder(e.target.value)} className="field" />
            </Field>
            <Field id="media-tags" label="Mots-clés" hint="Séparés par des virgules, par exemple accueil, bannière">
              <input id="media-tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="field" />
            </Field>

            {uploading && (
              <div className="h-2 overflow-hidden rounded-full bg-paper" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-ok transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={uploading || !file} className="btn-primary focus-ring flex-1">
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? `Envoi… ${progress} %` : "Envoyer"}
              </button>
              {file && !uploading && (
                <button type="button" onClick={resetForm} className="btn-ghost focus-ring">
                  Annuler
                </button>
              )}
            </div>
          </div>
        </form>
      </Panel>

      <Panel bodyClassName="!p-0">
        <form onSubmit={applyFilters} className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center">
          <div className="relative lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un nom de fichier"
              aria-label="Rechercher un fichier"
              className="field !py-2 !pl-9 text-sm"
            />
          </div>
          <input value={filterFolder} onChange={(e) => setFilterFolder(e.target.value)} placeholder="Dossier" aria-label="Filtrer par dossier" className="field !py-2 text-sm lg:w-44" />
          <input value={filterTag} onChange={(e) => setFilterTag(e.target.value)} placeholder="Mot-clé" aria-label="Filtrer par mot-clé" className="field !py-2 text-sm lg:w-44" />
          <div className="flex gap-2">
            <button type="submit" className="btn-ghost focus-ring">Filtrer</button>
            {(filterFolder || filterTag) && (
              <button type="button" onClick={clearFilters} aria-label="Effacer les filtres" className="btn-ghost focus-ring !px-3">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <div className="p-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5" aria-busy="true" aria-label="Chargement">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-paper" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState title="Aucun fichier">{media.length ? "Modifiez la recherche ou les filtres." : "Ajoutez un premier fichier ci-dessus."}</EmptyState>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {visible.map((m) => (
                <li key={m.id || m.filename} className="group overflow-hidden rounded-xl border border-line bg-white">
                  <div className="relative aspect-[4/3] bg-paper">
                    {isImage(m) && m.url ? (
                      <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-mist">
                        <FileText className="h-8 w-8" />
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      {m.url && (
                        <>
                          <button type="button" onClick={() => copyUrl(m.url)} aria-label="Copier le lien" className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-ink hover:bg-white">
                            <Copy className="h-4 w-4" />
                          </button>
                          <a href={m.url} target="_blank" rel="noreferrer" aria-label="Ouvrir le fichier" className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-ink hover:bg-white">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </>
                      )}
                      <button type="button" onClick={() => remove(m)} aria-label="Supprimer le fichier" className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-bad hover:bg-white">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-ink" title={m.originalname || m.filename}>
                      {m.originalname || m.filename}
                    </p>
                    <p className="truncate text-xs text-mist">
                      {[m.folder, Array.isArray(m.tags) && m.tags.length ? m.tags.join(", ") : null, formatSize(m.size)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );
}
