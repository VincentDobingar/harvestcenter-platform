// src/pages/superadmin/OpportunityManager.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";

const initialForm = {
  title_fr: "",
  title_en: "",
  type: "other",

  sponsor_fr: "",
  sponsor_en: "",

  location_fr: "",
  location_en: "",

  country_fr: "",
  country_en: "",

  deadline: "",

  summary_fr: "",
  summary_en: "",

  content_fr: "",
  content_en: "",

  apply_url: "",
  is_active: true,
};

function formatDateForInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function pickFr(item, key) {
  return item?.[`${key}_fr`] || item?.[key] || "";
}

function pickEn(item, key) {
  return item?.[`${key}_en`] || "";
}

export default function OpportunityManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/opportunities");
      setItems(res.data?.rows || []);
    } catch (err) {
      console.error("fetch opportunities error:", err);
      toast.error("Impossible de charger les opportunités.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setImage(null);
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
      title_fr: pickFr(item, "title"),
      title_en: pickEn(item, "title"),

      type: item.type || "other",

      sponsor_fr: pickFr(item, "sponsor"),
      sponsor_en: pickEn(item, "sponsor"),

      location_fr: pickFr(item, "location"),
      location_en: pickEn(item, "location"),

      country_fr: pickFr(item, "country"),
      country_en: pickEn(item, "country"),

      deadline: formatDateForInput(item.deadline),

      summary_fr: pickFr(item, "summary"),
      summary_en: pickEn(item, "summary"),

      content_fr: pickFr(item, "content"),
      content_en: pickEn(item, "content"),

      apply_url: item.apply_url || "",
      is_active: !!item.is_active,
    });

    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateForm() {
    if (!form.title_fr.trim() && !form.title_en.trim()) {
      toast.error("Veuillez renseigner au moins le titre FR ou EN.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === "boolean") {
          fd.append(k, v ? "1" : "0");
        } else {
          fd.append(k, v ?? "");
        }
      });

      if (image) {
        fd.append("image", image);
      }

      if (editingId) {
        await api.put(`/superadmin/opportunities/${editingId}`, fd);
        toast.success("Opportunité mise à jour.");
      } else {
        await api.post("/superadmin/opportunities", fd);
        toast.success("Opportunité créée.");
      }

      resetForm();
      await fetchItems();
    } catch (err) {
      console.error("submit opportunity error:", err);
      toast.error(
        err?.response?.data?.message || "Erreur lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette opportunité ?")) return;

    try {
      await api.delete(`/superadmin/opportunities/${id}`);
      toast.success("Opportunité supprimée.");
      await fetchItems();
    } catch (err) {
      console.error("delete opportunity error:", err);
      toast.error(err?.response?.data?.message || "Impossible de supprimer.");
    }
  }

  function getDisplayTitle(item) {
    return item.title_fr || item.title_en || item.title || "Sans titre";
  }

  function getDisplayMeta(item) {
    return [
      item.type,
      item.sponsor_fr || item.sponsor_en || item.sponsor,
      item.country_fr || item.country_en || item.country,
    ]
      .filter(Boolean)
      .join(" • ");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des opportunités</h2>
        <p className="text-gray-500">
          Créer, modifier et supprimer les opportunités publiées sur la plateforme.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 rounded-2xl p-6 space-y-6"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Informations générales</h3>
          <p className="text-sm text-gray-500">
            Renseigner au minimum le titre en français ou en anglais.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="title_fr"
            value={form.title_fr}
            onChange={handleChange}
            placeholder="Titre (FR)"
            className="border rounded-xl p-3"
          />

          <input
            name="title_en"
            value={form.title_en}
            onChange={handleChange}
            placeholder="Title (EN)"
            className="border rounded-xl p-3"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border rounded-xl p-3"
          >
            <option value="scholarship">Scholarship</option>
            <option value="fellowship">Fellowship</option>
            <option value="job">Job</option>
            <option value="internship">Internship</option>
            <option value="training">Training</option>
            <option value="grant">Grant</option>
            <option value="other">Other</option>
          </select>

          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="border rounded-xl p-3"
          />
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="text-lg font-semibold">Organisation et localisation</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="sponsor_fr"
            value={form.sponsor_fr}
            onChange={handleChange}
            placeholder="Sponsor / Organisation (FR)"
            className="border rounded-xl p-3"
          />

          <input
            name="sponsor_en"
            value={form.sponsor_en}
            onChange={handleChange}
            placeholder="Sponsor / Organisation (EN)"
            className="border rounded-xl p-3"
          />

          <input
            name="location_fr"
            value={form.location_fr}
            onChange={handleChange}
            placeholder="Lieu (FR)"
            className="border rounded-xl p-3"
          />

          <input
            name="location_en"
            value={form.location_en}
            onChange={handleChange}
            placeholder="Location (EN)"
            className="border rounded-xl p-3"
          />

          <input
            name="country_fr"
            value={form.country_fr}
            onChange={handleChange}
            placeholder="Pays (FR)"
            className="border rounded-xl p-3"
          />

          <input
            name="country_en"
            value={form.country_en}
            onChange={handleChange}
            placeholder="Country (EN)"
            className="border rounded-xl p-3"
          />
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="text-lg font-semibold">Résumé</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <textarea
            name="summary_fr"
            value={form.summary_fr}
            onChange={handleChange}
            placeholder="Résumé (FR)"
            className="border rounded-xl p-3"
            rows={4}
          />

          <textarea
            name="summary_en"
            value={form.summary_en}
            onChange={handleChange}
            placeholder="Summary (EN)"
            className="border rounded-xl p-3"
            rows={4}
          />
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="text-lg font-semibold">Contenu détaillé</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <textarea
            name="content_fr"
            value={form.content_fr}
            onChange={handleChange}
            placeholder="Contenu détaillé (FR)"
            className="border rounded-xl p-3"
            rows={8}
          />

          <textarea
            name="content_en"
            value={form.content_en}
            onChange={handleChange}
            placeholder="Detailed content (EN)"
            className="border rounded-xl p-3"
            rows={8}
          />
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="text-lg font-semibold">Lien et image</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="apply_url"
            value={form.apply_url}
            onChange={handleChange}
            placeholder="Lien de candidature"
            className="border rounded-xl p-3 md:col-span-2"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="border rounded-xl p-3 md:col-span-2"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <span>Publier</span>
        </label>

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white disabled:opacity-50"
          >
            {submitting ? "Envoi..." : editingId ? "Mettre à jour" : "Créer"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-3 rounded-xl border"
          >
            Réinitialiser
          </button>
        </div>
      </form>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Liste des opportunités</h3>

        {loading ? (
          <div>Chargement...</div>
        ) : items.length === 0 ? (
          <div>Aucune opportunité.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="font-semibold">{getDisplayTitle(item)}</div>
                  <div className="text-sm text-gray-500">
                    {getDisplayMeta(item)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {item.is_active ? "Publié" : "Brouillon"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg"
                  >
                    Supprimer
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