// src/pages/Profile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { notifySuccess, notifyError } from "@/components/ToastProvider";

function getDisplayName(user) {
  if (!user) return "";
  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.name ||
    user.email ||
    ""
  );
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, fetchMe, logout, token } = useAuth();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    phone: "",
    city: "",
    languages: [],
    goals: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar_url || user?.avatar || user?.image_url || null
  );
  const [file, setFile] = useState(null);

  const displayName = useMemo(() => getDisplayName(user), [user]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data } = await api.get("/profiles/me");
        if (!mounted) return;

        const profileFromNewShape = data?.profile || null;
        const profile = profileFromNewShape || data || {};

        setForm({
          phone: profile?.phone ?? "",
          city: profile?.city ?? "",
          languages: Array.isArray(profile?.languages)
            ? profile.languages
            : typeof profile?.languages === "string"
            ? profile.languages
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          goals: profile?.goals ?? "",
          bio: profile?.bio ?? "",
        });

        const avatar =
          profileFromNewShape?.image_url ||
          profileFromNewShape?.avatar ||
          profile?.image_url ||
          profile?.avatar ||
          data?.user?.avatar_url ||
          user?.avatar_url ||
          user?.avatar ||
          user?.image_url ||
          null;

        setAvatarPreview(avatar);
      } catch (e) {
        if (e?.response?.status === 401) {
          try {
            await logout();
          } catch {}
          navigate("/account?tab=login", { replace: true });
          return;
        }

        if (e?.response?.status === 404) {
          return;
        }

        console.error("Failed to load profile:", e);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user?.id, user?.avatar_url, user?.avatar, user?.image_url, logout, navigate]);

  async function onSave(e) {
    e.preventDefault();

    if (!token) {
      notifyError(t("profilePage.errors.sessionExpired"));
      try {
        await logout();
      } catch {}
      navigate("/account?tab=login", { replace: true });
      return;
    }

    setSaving(true);

    try {
      if (file) {
        const fd = new FormData();
        fd.append("image", file);
        await api.post("/profiles/me/image", fd);
      }

      const payload = {
        ...form,
        languages: Array.isArray(form.languages)
          ? form.languages.filter(Boolean)
          : typeof form.languages === "string"
          ? form.languages.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await api.put("/profiles/me", payload);

      if (res?.status === 201) {
        notifySuccess(t("profilePage.success.created"));
      } else {
        notifySuccess(t("profilePage.success.saved"));
      }

      try {
        await fetchMe();
      } catch {}

      setMsg(t("profilePage.success.saved"));
    } catch (err) {
      console.error("Profile save error:", err);

      if (err?.response?.status === 401) {
        notifyError(t("profilePage.errors.sessionExpired"));
        try {
          await logout();
        } catch {}
        navigate("/account?tab=login", { replace: true });
        return;
      }

      if (err?.response?.status === 404) {
        notifyError(t("profilePage.errors.routeMissing"));
        setMsg(t("profilePage.errors.routeMissing"));
      } else {
        const serverMsg =
          err?.response?.data?.error || err?.response?.data?.message;
        setMsg(serverMsg || t("profilePage.errors.save"));
        notifyError(serverMsg || t("profilePage.errors.save"));
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
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
      <h1 className="text-2xl font-bold">{t("profilePage.title")}</h1>

      <div className="rounded-2xl bg-white shadow p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={t("profilePage.avatarAlt")}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-lg font-semibold">
                {getInitials(displayName)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="block text-sm mb-2">
              {t("profilePage.changePhoto")}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                {t("profilePage.changePhoto")}
              </button>

              {file?.name ? (
                <span className="text-sm text-gray-600">{file.name}</span>
              ) : null}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              {t("profilePage.photoHint")}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {t("profilePage.loggedInAs")} <b>{displayName}</b> ({user?.email})
        </div>

        {msg && <div className="mb-2 text-blue-700">{msg}</div>}

        <form onSubmit={onSave} className="grid sm:grid-cols-2 gap-4">
          <input
            className="rounded-xl border p-3"
            placeholder={t("profilePage.fields.phone")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            placeholder={t("profilePage.fields.city")}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <input
            className="rounded-xl border p-3 sm:col-span-2"
            placeholder={t("profilePage.fields.languages")}
            value={
              Array.isArray(form.languages)
                ? form.languages.join(", ")
                : form.languages || ""
            }
            onChange={(e) =>
              setForm({
                ...form,
                languages: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />

          <input
            className="rounded-xl border p-3 sm:col-span-2"
            placeholder={t("profilePage.fields.goals")}
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
          />

          <textarea
            className="rounded-xl border p-3 sm:col-span-2"
            placeholder={t("profilePage.fields.bio")}
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />

          <div className="sm:col-span-2">
            <button
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white"
            >
              {saving
                ? t("profilePage.fields.saving")
                : t("profilePage.fields.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}