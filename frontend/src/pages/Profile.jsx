// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { notifySuccess, notifyError } from "@/components/ToastProvider"; // si tu as helpers

export default function Profile() {
  const navigate = useNavigate();
  const { user, fetchMe, logout, token } = useAuth();
  const [form, setForm] = useState({ phone: "", city: "", languages: [], goals: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || user?.avatar || null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // GET /profiles/me returns { user, profile, inscription } (nouveau)
        // or historical direct profile object (ancien). Support both.
        const { data } = await api.get("/profiles/me");

        if (!mounted) return;

        // support new shape
        const profileFromNewShape = data && data.profile ? data.profile : null;
        const profile = profileFromNewShape || data || {};

        setForm({
          phone: profile?.phone ?? "",
          city: profile?.city ?? "",
          languages: Array.isArray(profile?.languages) ? profile.languages : (typeof profile?.languages === "string" ? profile.languages.split(",").map(s => s.trim()).filter(Boolean) : []),
          goals: profile?.goals ?? "",
          bio: profile?.bio ?? "",
        });

        // avatar preview: prefer image_url (profile), then avatar_url (user)
        const avatar = (profileFromNewShape ? (profileFromNewShape.image_url || profileFromNewShape.avatar || null) : (profile.image_url || profile.avatar || null))
                      || data?.user?.avatar_url
                      || user?.avatar_url
                      || user?.avatar
                      || null;

        setAvatarPreview(avatar);
      } catch (e) {
        // session expired -> force logout and redirect
        if (e?.response?.status === 401) {
          try { await logout(); } catch {}
          navigate("/account?tab=login", { replace: true });
          return;
        }

        // 404 on GET /profiles/me is acceptable (no profile yet) -> keep defaults
        if (e?.response?.status === 404) {
          console.info("Profile not found yet; user may need to create profile");
          return;
        }

        console.error("Failed to load profile:", e);
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function onSave(e) {
    e.preventDefault();

    // quick token check (if your useAuth exposes token)
    if (!token) {
      notifyError?.("Session expirée — veuillez vous reconnecter.");
      try { await logout(); } catch {}
      navigate("/account?tab=login", { replace: true });
      return;
    }

    setSaving(true);

    try {
      // 1) upload avatar si un fichier a été sélectionné
      if (file) {
        const fd = new FormData();
        // BACKEND multer attends le champ "image"
        fd.append("image", file);

        // IMPORTANT: ne pas définir Content-Type header; axios/ browser vont le faire avec boundary
        await api.post("/profiles/me/image", fd);
      }

      // 2) update du profil
      const payload = {
        ...form,
        // send languages as array or string depending on backend expectation
        languages: Array.isArray(form.languages) ? form.languages.filter(Boolean) : (typeof form.languages === "string" ? form.languages.split(",").map(s => s.trim()) : []),
      };

      const res = await api.put("/profiles/me", payload);

      // si backend renvoie 201 pour création, on peut afficher message différent
      if (res?.status === 201) {
        notifySuccess?.("Profil créé avec succès");
      } else {
        notifySuccess?.("Profil enregistré");
      }

      // 3) rafraîchir le profil dans le contexte et l'UI
      try { await fetchMe(); } catch (err) { /* ignore */ }

      setMsg("Profil enregistré");
    } catch (err) {
      console.error("Profile save error:", err);

      if (err?.response?.status === 401) {
        notifyError?.("Session expirée — veuillez vous reconnecter.");
        try { await logout(); } catch {}
        navigate("/account?tab=login", { replace: true });
        return;
      }

      // 404 ici signifierait route manquante côté serveur
      if (err?.response?.status === 404) {
        notifyError?.("Route introuvable (404) — vérifie que l'API expose PUT /api/profiles/me");
        setMsg("Route introuvable (404)");
      } else {
        const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
        setMsg(serverMsg || "Erreur lors de l'enregistrement");
        notifyError?.(serverMsg || err);
      }
    } finally {
      setSaving(false);
      setTimeout(()=>setMsg(""), 3000);
    }
  }

  function onFileChange(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setAvatarPreview(url);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <div className="rounded-2xl bg-white shadow p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No</div>}
          </div>
          <div>
            <label className="block text-sm">Changer la photo</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
            <div className="text-xs text-gray-500 mt-1">Format recommandé 400×400, max 2MB</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">Connecté en tant que <b>{user?.full_name}</b> ({user?.email})</div>
        {msg && <div className="mb-2 text-blue-700">{msg}</div>}
        <form onSubmit={onSave} className="grid sm:grid-cols-2 gap-4">
          <input className="rounded-xl border p-3" placeholder="Téléphone"
                 value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
          <input className="rounded-xl border p-3" placeholder="Ville"
                 value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} />
          <input className="rounded-xl border p-3 sm:col-span-2" placeholder="Langues (séparées par des virgules)"
                 value={(Array.isArray(form.languages) ? form.languages.join(", ") : form.languages || "")}
                 onChange={(e)=>setForm({...form, languages:e.target.value.split(",").map(s=>s.trim())})} />
          <input className="rounded-xl border p-3 sm:col-span-2" placeholder="Objectifs"
                 value={form.goals} onChange={(e)=>setForm({...form, goals:e.target.value})} />
          <textarea className="rounded-xl border p-3 sm:col-span-2" placeholder="Bio"
                 rows={4} value={form.bio} onChange={(e)=>setForm({...form, bio:e.target.value})} />
          <div className="sm:col-span-2">
            <button disabled={saving} className="px-5 py-3 rounded-xl bg-blue-600 text-white">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
