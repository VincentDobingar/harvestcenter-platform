// src/pages/superadmin/NewsEditor.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function NewsEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    try {
      const res = await api.get("/api/superadmin/news");
      setItems(res.data ?? []);
    } catch (e) {
      console.warn("fetchNews failed", e);
      toast.error("Impossible de charger les actualités.");
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!title || !content) return toast.error("Titre et contenu requis.");
    try {
      await api.post("/api/superadmin/news", { title, content });
      toast.success("Actualité créée.");
      setTitle(""); setContent("");
      fetchNews();
    } catch (e) {
      console.error("create news failed", e);
      toast.error("Erreur lors de la création.");
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette actualité ?")) return;
    try {
      await api.delete(`/api/superadmin/news/${id}`);
      toast.success("Supprimé.");
      fetchNews();
    } catch (e) {
      console.error("delete failed", e);
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gestion des actualités</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="w-full border rounded p-2 mb-2" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu" className="w-full border rounded p-2 mb-2" />
        <div className="flex gap-2">
          <button onClick={create} className="px-3 py-2 bg-blue-600 text-white rounded">Créer</button>
          <button onClick={fetchNews} className="px-3 py-2 border rounded">Rafraîchir</button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">Aucune actualité.</div>
        ) : (
          items.map((n) => (
            <div key={n.id} className="bg-white p-3 rounded shadow flex justify-between items-start">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.published ? "Publié" : "Brouillon"} — {new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => remove(n.id)} className="px-2 py-1 border rounded text-sm">Supprimer</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
