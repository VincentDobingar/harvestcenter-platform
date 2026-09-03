// src/pages/superadmin/NewsEditor.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "@/utils/api";

const initialForm = {
  title: "",
  content: "",
  excerpt: "",
  is_active: true,
};

export default function NewsEditor() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-GB" : "fr-FR";

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    try {
      const res = await api.get("/superadmin/news");
      setItems(res.data?.rows || []);
    } catch (e) {
      console.error("fetch news failed", e);
      toast.error(t("newsEditorPage.errors.load", { defaultValue: "Impossible de charger les news." }));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setImage(null);
    setEditingId(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      content: item.content || "",
      excerpt: item.excerpt || "",
      is_active: !!item.is_active,
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      return toast.error(
        t("newsEditorPage.errors.required", { defaultValue: "Le titre et le contenu sont obligatoires." })
      );
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("excerpt", form.excerpt || "");
      fd.append("is_active", form.is_active ? "true" : "false");

      // Si ton middleware upload attend un autre nom que "image",
      // remplace simplement "image" ici.
      if (image) {
        fd.append("image", image);
      }

      if (editingId) {
        await api.put(`/superadmin/news/${editingId}`, fd);
        toast.success("News mise à jour.");
      } else {
        await api.post("/superadmin/news", fd);
        toast.success("News créée.");
      }

      resetForm();
      await fetchNews();
    } catch (e) {
      console.error("save news failed", e);
      toast.error(e?.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(t("newsEditorPage.confirmDelete", { defaultValue: "Supprimer cette news ?" }))) {
      return;
    }

    try {
      await api.delete(`/superadmin/news/${id}`);
      toast.success(t("newsEditorPage.success.deleted", { defaultValue: "News supprimée." }));
      await fetchNews();
    } catch (e) {
      console.error("delete news failed", e);
      toast.error(t("newsEditorPage.errors.delete", { defaultValue: "Impossible de supprimer la news." }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {t("newsEditorPage.title", { defaultValue: "Gestion des news" })}
        </h2>
        <p className="text-gray-500">
          Créer, modifier et supprimer les actualités publiées sur le site.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder={t("newsEditorPage.fields.title", { defaultValue: "Titre" })}
          className="w-full border rounded-xl p-3"
        />

        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder={t("newsEditorPage.fields.content", { defaultValue: "Contenu" })}
          className="w-full border rounded-xl p-3 min-h-[180px]"
        />

        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          placeholder={t("newsEditorPage.fields.excerpt", { defaultValue: "Extrait (optionnel)" })}
          className="w-full border rounded-xl p-3"
          rows={3}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full border rounded-xl p-3"
        />

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <span>Publier immédiatement</span>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white disabled:opacity-50"
          >
            {submitting
              ? "Envoi..."
              : editingId
                ? "Mettre à jour"
                : t("newsEditorPage.create", { defaultValue: "Créer" })}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-3 rounded-xl border"
          >
            Réinitialiser
          </button>

          <button
            type="button"
            onClick={fetchNews}
            className="px-5 py-3 rounded-xl border"
          >
            {t("newsEditorPage.refresh", { defaultValue: "Rafraîchir" })}
          </button>
        </div>
      </form>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Liste des news</h3>

        {loading ? (
          <div>{t("common.loading", { defaultValue: "Chargement..." })}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">
            {t("newsEditorPage.noNews", { defaultValue: "Aucune news." })}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div
                key={n.id}
                className="bg-white p-4 rounded-xl border flex justify-between items-start gap-4"
              >
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {n.is_active
                      ? t("newsEditorPage.published", { defaultValue: "Publié" })
                      : t("newsEditorPage.draft", { defaultValue: "Brouillon" })}
                    {" — "}
                    {n.created_at ? new Date(n.created_at).toLocaleString(locale) : ""}
                  </div>
                  {n.excerpt ? (
                    <div className="text-sm text-gray-500 mt-2">{n.excerpt}</div>
                  ) : null}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(n)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(n.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg"
                  >
                    {t("newsEditorPage.delete", { defaultValue: "Supprimer" })}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}