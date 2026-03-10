// src/pages/admin/AdminMedia.jsx

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { ImagePlus, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { s3DirectUpload } from "@/utils/s3Upload";

export default function AdminMedia() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ title: "", alt_text: "", category: "", taken_at: "" });
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadAndCreate = async () => {
    if (!file) return toast.error("Choisis un fichier.");

    try {
      setSaving(true);

      // 1) Upload direct S3
      const { publicUrl } = await s3DirectUpload(file, { folder: meta.category || "media" });

      // 2) create media en base
      await api.post("/media", {
        url: publicUrl,
        title: meta.title || null,
        alt_text: meta.alt_text || null,
        category: meta.category || null,
        taken_at: meta.taken_at || null,
        // type auto par extension sinon "image"/"video" selon besoin
      });

      toast.success("Média enregistré ✅");
      setFile(null); setPreview("");
      setMeta({ title: "", alt_text: "", category: "", taken_at: "" });
      fetchMedia();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.error || e.message || "Échec upload/enregistrement.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoadingList(true);
      const { data } = await api.get("/media?limit=50");
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const remove = async (id) => {
  if (!confirm("Supprimer ce média ? Cette action est irréversible.")) return;
  try {
    await api.delete(`/media/${id}`);
    toast.success("Média supprimé");
    setItems((prev) => prev.filter((x) => x.id !== id));
  } catch (e) {
    console.error(e);
    const msg = e?.response?.data?.error || "Échec de suppression.";
    toast.error(msg);
  }
};

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F75BB]">📷 Gestion des médias</h1>

      {/* Zone d’upload */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white rounded-xl p-6 shadow border-2 border-dashed border-gray-200 flex flex-col items-center gap-3"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-48 h-48 object-cover rounded-lg" />
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <ImagePlus className="w-12 h-12" />
            <p>Glisser-déposer une image/vidéo ou</p>
          </div>
        )}

        <label className="cursor-pointer bg-[#1F75BB] text-white px-4 py-2 rounded hover:bg-[#1863a1] inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Sélectionner un fichier
          <input type="file" accept="image/*,video/mp4" className="hidden" onChange={pick} />
        </label>

        <div className="grid sm:grid-cols-2 gap-3 w-full mt-4">
          <input className="border rounded px-3 py-2" placeholder="Titre (optionnel)"
                 value={meta.title} onChange={(e) => setMeta(m => ({ ...m, title: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Texte alternatif (alt)"
                 value={meta.alt_text} onChange={(e) => setMeta(m => ({ ...m, alt_text: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Catégorie (ex: event/gallerie)"
                 value={meta.category} onChange={(e) => setMeta(m => ({ ...m, category: e.target.value }))} />
          <input className="border rounded px-3 py-2" type="date"
                 value={meta.taken_at} onChange={(e) => setMeta(m => ({ ...m, taken_at: e.target.value }))} />
        </div>

        <button
          onClick={uploadAndCreate}
          disabled={saving || !file}
          className="mt-3 bg-[#1F75BB] text-white px-5 py-2 rounded hover:bg-[#1863a1] disabled:opacity-60"
        >
          {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</span> : "Enregistrer le média"}
        </button>
      </div>

      {/* Liste des médias */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Récents</h2>
        {loadingList ? (
          <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin inline-block text-[#1F75BB]" /></div>
        ) : items.length === 0 ? (
          <p>Aucun média.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((m) => (
              <article key={m.id} className="border rounded-lg overflow-hidden">
                {m.type === "video" ? (
                  <video src={m.url} controls className="w-full aspect-video" />
                ) : (
                  <img src={m.url} alt={m.alt_text || m.title || ""} className="w-full aspect-video object-cover" />
                )}
                <div className="p-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium truncate">{m.title || "—"}</div>
                    <div className="text-xs text-gray-500">{m.category || "—"}</div>
                  </div>
                  <button
                    onClick={() => remove(m.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
