// src/pages/superadmin/MediaManager.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

/**
 * MediaManager uploader with folder + tags metadata and upload progress.
 * - Uses api.post('/api/superadmin/media', formData, { onUploadProgress })
 * - Shows list fetched from GET /api/superadmin/media
 */
export default function MediaManager() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [media, setMedia] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [filterFolder, setFilterFolder] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoadingList(true);
    try {
      const params = {};
      if (filterFolder) params.folder = filterFolder;
      if (filterTag) params.tag = filterTag;
      const res = await api.get("/api/superadmin/media", { params });
      const rows = res.data?.rows ?? [];
      setMedia(rows);
    } catch (err) {
      console.error("fetchList error", err);
      toast.error("Impossible de charger la liste des médias.");
    } finally {
      setLoadingList(false);
    }
  }

  function onFileChange(e) {
    setFile(e.target.files?.[0] ?? null);
  }

  function parseTags() {
    // user inputs comma separated tags
    return tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function upload() {
    if (!file) return toast.error("Choisir un fichier.");
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    if (folder) form.append("folder", folder);
    const tagsArr = parseTags();
    if (tagsArr.length) form.append("tags", JSON.stringify(tagsArr)); // backend accepts JSON array or CSV

    try {
      const res = await api.post("/api/superadmin/media", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) {
            const p = Math.round((ev.loaded * 100) / ev.total);
            setProgress(p);
          }
        },
      });

      const fileRec = res.data?.file;
      if (fileRec) {
        toast.success("Fichier uploadé.");
        // put new file on top of list
        setMedia((m) => [fileRec, ...m]);
        // reset form
        setFile(null);
        setFolder("");
        setTagsInput("");
        if (inputRef.current) inputRef.current.value = "";
      } else {
        toast.success("Upload terminé.");
        fetchList();
      }
    } catch (err) {
      console.error("upload error", err);
      const msg = err?.response?.data?.error || err?.message || "Erreur upload";
      toast.error(String(msg));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer ce fichier ?")) return;
    try {
      await api.delete(`/api/superadmin/media/${id}`);
      toast.success("Supprimé.");
      setMedia((m) => m.filter((it) => Number(it.id) !== Number(id)));
    } catch (err) {
      console.error("delete media error", err);
      toast.error("Impossible de supprimer.");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gestion des médias</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Fichier</label>
            <input ref={inputRef} type="file" onChange={onFileChange} />
            {file && <div className="text-sm mt-1">Sélectionné: {file.name} • {Math.round(file.size / 1024)} KB</div>}
          </div>

          <div>
            <label className="block text-sm mb-1">Dossier (folder)</label>
            <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="ex: images/banners" className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm mb-1">Tags (virgule séparés)</label>
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="ex: home, banner" className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={upload} disabled={uploading} className="px-3 py-2 bg-blue-600 text-white rounded">
            {uploading ? `Upload… ${progress}%` : "Uploader"}
          </button>
          <button onClick={() => { setFile(null); setFolder(""); setTagsInput(""); if (inputRef.current) inputRef.current.value = ""; }} className="px-3 py-2 border rounded">
            Réinitialiser
          </button>
          <button onClick={fetchList} className="px-3 py-2 border rounded">Rafraîchir la liste</button>
        </div>

        {uploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
              <div style={{ width: `${progress}%` }} className="h-3 bg-blue-600" />
            </div>
            <div className="text-xs text-gray-600 mt-1">{progress}%</div>
          </div>
        )}
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <input placeholder="Filtrer par dossier" value={filterFolder} onChange={(e) => setFilterFolder(e.target.value)} className="border rounded p-2" />
        <input placeholder="Filtrer par tag" value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="border rounded p-2" />
        <button onClick={fetchList} className="px-3 py-2 border rounded">Appliquer filtres</button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {loadingList ? (
          <div>Chargement…</div>
        ) : media.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun média.</div>
        ) : (
          <div className="space-y-3">
            {media.map((m) => (
              <div key={m.id || m.filename} className="flex items-center justify-between border-b py-2">
                <div>
                  <div className="font-medium">{m.originalname || m.filename}</div>
                  <div className="text-xs text-gray-500">
                    {m.folder ? <><strong>Dossier:</strong> {m.folder} • </> : null}
                    {Array.isArray(m.tags) && m.tags.length ? <><strong>Tags:</strong> {m.tags.join(", ")} • </> : null}
                    <span>{(m.size/1024).toFixed(1)} KB</span>
                  </div>
                  <div className="mt-1">
                    <a className="text-sm text-blue-600 underline" href={m.url} target="_blank" rel="noreferrer">Ouvrir</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard?.writeText(m.url).then(()=>toast.success("URL copiée"))} className="px-2 py-1 border rounded text-sm">Copier URL</button>
                  <button onClick={() => remove(m.id)} className="px-2 py-1 border rounded text-sm">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
