// src/pages/superadmin/UserManager.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";

const initialForm = {
  name: "",
  email: "",
  role: "student",
  is_active: true,
};

export default function UserManager() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/users");
      setItems(res.data?.rows || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      is_active: !!user.is_active,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!editingId) {
      toast.error("Sélectionne un utilisateur à modifier.");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/superadmin/users/${editingId}`, form);
      toast.success("Utilisateur mis à jour.");
      resetForm();
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    try {
      await api.delete(`/superadmin/users/${id}`);
      toast.success("Utilisateur supprimé.");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer.");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nom"
            className="border rounded-xl p-3"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border rounded-xl p-3"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border rounded-xl p-3"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>

          <label className="flex items-center gap-3 border rounded-xl p-3">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            <span>Compte actif</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white disabled:opacity-50"
          >
            {submitting ? "Envoi..." : "Mettre à jour"}
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

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>

        {loading ? (
          <div>Chargement...</div>
        ) : items.length === 0 ? (
          <div>Aucun utilisateur.</div>
        ) : (
          <div className="space-y-4">
            {items.map((user) => (
              <div
                key={user.id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {user.role} • {user.is_active ? "Actif" : "Inactif"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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