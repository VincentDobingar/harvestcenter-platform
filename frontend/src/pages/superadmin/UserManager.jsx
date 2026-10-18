// src/pages/superadmin/UserManager.jsx
// Comptes de la plateforme : rôle et statut de chaque utilisateur.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { RefreshCw, Search, Pencil, Trash2, UserPlus, Loader2, X, Users, ShieldCheck, GraduationCap } from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, Panel, EmptyState, Field, Badge, Switch, Segmented, ListSkeleton, StatCard, StatGrid } from "@/components/dash";

const ROLES = [
  { value: "student", label: "Étudiant", tone: "info" },
  { value: "teacher", label: "Formateur", tone: "warn" },
  { value: "admin", label: "Administration", tone: "ok" },
  { value: "superadmin", label: "Direction", tone: "ink" },
];
const roleOf = (v) => ROLES.find((r) => r.value === v) || { label: v || "—", tone: "muted" };

const EMPTY = { name: "", email: "", role: "student", is_active: true };

function initials(name, email) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || src[0].toUpperCase();
}

export default function UserManager() {
  const { user: me } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/users");
      setItems(res.data?.rows || []);
    } catch (err) {
      console.error(err);
      toast.error("Les comptes n’ont pas pu être chargés.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const counts = useMemo(() => {
    const c = { all: items.length };
    ROLES.forEach((r) => (c[r.value] = items.filter((u) => u.role === r.value).length));
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((u) => {
      if (roleFilter === "staff" && !["admin", "superadmin"].includes(u.role)) return false;
      if (!["all", "staff"].includes(roleFilter) && u.role !== roleFilter) return false;
      return !q || `${u.name} ${u.email}`.toLowerCase().includes(q);
    });
  }, [items, query, roleFilter]);

  function resetForm() {
    setEditing(null);
    setForm(EMPTY);
  }

  function handleEdit(u) {
    setEditing(u);
    setForm({ name: u.name || "", email: u.email || "", role: u.role || "student", is_active: !!u.is_active });
    if (window.innerWidth < 1280) document.getElementById("user-editor")?.scrollIntoView({ behavior: "smooth" });
  }

  const isSelf = editing && me && Number(editing.id) === Number(me.id);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editing) return;
    if (!form.email.trim()) {
      toast.error("L’email est obligatoire.");
      return;
    }
    if (isSelf && (form.role !== "superadmin" || !form.is_active)) {
      toast.error("Vous ne pouvez pas retirer vos propres droits de direction ni désactiver votre compte.");
      return;
    }
    try {
      setSubmitting(true);
      await api.put(`/superadmin/users/${editing.id}`, { ...form, email: form.email.trim() });
      toast.success("Compte mis à jour.");
      resetForm();
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Le compte n’a pas pu être mis à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(u) {
    if (me && Number(u.id) === Number(me.id)) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (!window.confirm(`Supprimer le compte de ${u.name || u.email} ? Cette action est définitive.`)) return;
    try {
      await api.delete(`/superadmin/users/${u.id}`);
      toast.success("Compte supprimé.");
      if (editing?.id === u.id) resetForm();
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Le compte n’a pas pu être supprimé.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        subtitle="Les comptes de la plateforme, leur rôle et leur accès."
        actions={
          <>
            <button type="button" onClick={fetchUsers} className="btn-ghost focus-ring">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
            </button>
            <Link to="/admin/utilisateurs/ajouter" className="btn-primary focus-ring !py-2.5 text-sm">
              <UserPlus className="h-4 w-4" /> Ajouter un compte
            </Link>
          </>
        }
      />

      <StatGrid cols={3}>
        <StatCard primary icon={Users} label="Comptes" value={loading ? "…" : counts.all} />
        <StatCard icon={GraduationCap} label="Étudiants et formateurs" value={loading ? "…" : counts.student + counts.teacher} hint={loading ? null : `${counts.teacher} formateurs`} />
        <StatCard icon={ShieldCheck} label="Équipe administrative" value={loading ? "…" : counts.admin + counts.superadmin} hint={loading ? null : `dont ${counts.superadmin} à la direction`} />
      </StatGrid>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel bodyClassName="!p-0">
          <div className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <Segmented
              label="Filtrer par rôle"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: "all", label: "Tous", count: counts.all },
                { value: "student", label: "Étudiants", count: counts.student },
                { value: "teacher", label: "Formateurs", count: counts.teacher },
                { value: "staff", label: "Équipe", count: counts.admin + counts.superadmin },
              ]}
            />
            <div className="relative lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom ou email"
                aria-label="Rechercher un compte"
                className="field !py-2 !pl-9 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <ListSkeleton />
          ) : visible.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucun compte">Modifiez la recherche ou le filtre.</EmptyState>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {visible.map((u) => {
                const r = roleOf(u.role);
                const active = editing?.id === u.id;
                const self = me && Number(u.id) === Number(me.id);
                return (
                  <li key={u.id} className={`flex items-center gap-4 px-5 py-3.5 ${active ? "bg-millet-soft/60" : "hover:bg-paper/70"}`}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">
                      {initials(u.name, u.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {u.name || "Sans nom"}
                        {self && <span className="ml-2 text-[13px] font-normal text-mist">(vous)</span>}
                      </p>
                      <p className="truncate text-[13px] text-mist">{u.email}</p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-2 sm:flex">
                      <Badge tone={r.tone}>{r.label}</Badge>
                      {!u.is_active && <Badge tone="bad">Désactivé</Badge>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(u)}
                        aria-label={`Modifier le compte de ${u.name || u.email}`}
                        className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-white hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!self && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          aria-label={`Supprimer le compte de ${u.name || u.email}`}
                          className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-bad/10 hover:text-bad"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div id="user-editor" className="xl:sticky xl:top-24">
          <Panel
            title={editing ? "Modifier le compte" : "Modifier un compte"}
            description={editing ? editing.email : "Choisissez un compte dans la liste pour changer son rôle ou son accès."}
            actions={
              editing && (
                <button type="button" onClick={resetForm} aria-label="Fermer" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-paper hover:text-ink">
                  <X className="h-4 w-4" />
                </button>
              )
            }
          >
            {!editing ? (
              <EmptyState title="Aucun compte sélectionné">Cliquez sur le crayon d’une ligne.</EmptyState>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field id="user-name" label="Nom complet">
                  <input id="user-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="field" autoComplete="off" />
                </Field>
                <Field id="user-email" label="Email">
                  <input id="user-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="field" autoComplete="off" />
                </Field>

                <fieldset>
                  <legend className="mb-1.5 block text-sm font-medium text-ink">Rôle</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map((r) => (
                      <label
                        key={r.value}
                        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          form.role === r.value ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/30"
                        } ${isSelf && r.value !== "superadmin" ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.value}
                          checked={form.role === r.value}
                          disabled={isSelf && r.value !== "superadmin"}
                          onChange={() => setForm((p) => ({ ...p, role: r.value }))}
                          className="sr-only"
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                  {form.role === "superadmin" && !isSelf && (
                    <p className="mt-2 text-xs text-warn">La direction a accès à tout, y compris la gestion des comptes.</p>
                  )}
                </fieldset>

                <div className="rounded-xl border border-line bg-paper/60 px-4 py-3">
                  <Switch
                    id="user-active"
                    checked={form.is_active}
                    onChange={(e) => !isSelf && setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    label="Compte actif"
                    hint={form.is_active ? "La personne peut se connecter." : "La connexion est bloquée."}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={submitting} className="btn-primary focus-ring flex-1">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-ghost focus-ring">
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
