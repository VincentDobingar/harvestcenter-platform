// src/pages/superadmin/MediaManager.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function MediaManager() {
  const { t } = useTranslation();

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

      const res = await api.get("/media", { params });
      setMedia(res.data?.rows || []);
    } catch (err) {
      console.error("fetch media error:", err);
      toast.error(t("mediaManagerPage.errors.load", { defaultValue: "Impossible de charger les médias." }));
    } finally {
      setLoadingList(false);
    }
  }

  function onFileChange(e) {
    setFile(e.target.files?.[0] || null);
  }

  function parseTags() {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function resetForm() {
    setFile(null);
    setFolder("");
    setTagsInput("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload() {
    if (!file) {
      return toast.error(
        t("mediaManagerPage.errors.chooseFile", { defaultValue: "Choisis un fichier." })
      );
    }

    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    if (folder) form.append("folder", folder);

    const tagsArr = parseTags();
    if (tagsArr.length) {
      form.append("tags", JSON.stringify(tagsArr));
    }

    try {
      const res = await api.post("/media", form, {
        onUploadProgress: (ev) => {
          if (ev.total) {
            const p = Math.round((ev.loaded * 100) / ev.total);
            setProgress(p);
          }
        },
      });

      const fileRec = res.data?.file;

      if (fileRec) {
        toast.success(t("mediaManagerPage.success.uploaded", { defaultValue: "Fichier uploadé." }));
        setMedia((prev) => [fileRec, ...prev]);
      } else {
        toast.success(t("mediaManagerPage.success.uploadFinished", { defaultValue: "Upload terminé." }));
        await fetchList();
      }

      resetForm();
    } catch (err) {
      console.error("upload media error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t("mediaManagerPage.errors.upload", { defaultValue: "Erreur d’upload." });
      toast.error(String(msg));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function remove(id) {
    if (!window.confirm(t("mediaManagerPage.confirmDelete", { defaultValue: "Supprimer ce média ?" }))) {
      return;
    }

    try {
      await api.delete(`/media/${id}`);
      toast.success(t("mediaManagerPage.success.deleted", { defaultValue: "Média supprimé." }));
      setMedia((prev) => prev.filter((it) => Number(it.id) !== Number(id)));
    } catch (err) {
      console.error("delete media error:", err);
      toast.error(t("mediaManagerPage.errors.delete", { defaultValue: "Impossible de supprimer le média." }));
    }
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("mediaManagerPage.success.urlCopied", { defaultValue: "URL copiée." }));
    } catch {
      toast.error(t("mediaManagerPage.errors.copyUrl", { defaultValue: "Impossible de copier l’URL." }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {t("mediaManagerPage.title", { defaultValue: "Gestion des médias" })}
        </h2>
        <p className="text-gray-500">
          Uploader, filtrer et supprimer les médias de la plateforme.
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">
              {t("mediaManagerPage.file", { defaultValue: "Fichier" })}
            </label>
            <input ref={inputRef} type="file" onChange={onFileChange} />
            {file ? (
              <div className="text-sm mt-2 text-gray-600">
                {t("mediaManagerPage.selected", { defaultValue: "Sélectionné" })}: {file.name} •{" "}
                {Math.round(file.size / 1024)} KB
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("mediaManagerPage.folder", { defaultValue: "Dossier" })}
            </label>
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="ex: images/banners"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("mediaManagerPage.tags", { defaultValue: "Tags" })}
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ex: home, banner"
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={upload}
            disabled={uploading}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white disabled:opacity-50"
          >
            {uploading
              ? `${t("mediaManagerPage.uploading", { defaultValue: "Upload..." })} ${progress}%`
              : t("mediaManagerPage.upload", { defaultValue: "Uploader" })}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-3 rounded-xl border"
          >
            {t("mediaManagerPage.reset", { defaultValue: "Réinitialiser" })}
          </button>

          <button
            type="button"
            onClick={fetchList}
            className="px-5 py-3 rounded-xl border"
          >
            {t("mediaManagerPage.refresh", { defaultValue: "Rafraîchir" })}
          </button>
        </div>

        {uploading ? (
          <div>
            <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
              <div
                className="h-3 bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">{progress}%</div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          placeholder={t("mediaManagerPage.filterFolder", { defaultValue: "Filtrer par dossier" })}
          value={filterFolder}
          onChange={(e) => setFilterFolder(e.target.value)}
          className="border rounded-xl p-3"
        />
        <input
          placeholder={t("mediaManagerPage.filterTag", { defaultValue: "Filtrer par tag" })}
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="border rounded-xl p-3"
        />
        <button
          type="button"
          onClick={fetchList}
          className="px-5 py-3 rounded-xl border"
        >
          {t("mediaManagerPage.applyFilters", { defaultValue: "Appliquer" })}
        </button>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        {loadingList ? (
          <div>{t("common.loading", { defaultValue: "Chargement..." })}</div>
        ) : media.length === 0 ? (
          <div className="text-sm text-gray-500">
            {t("mediaManagerPage.noMedia", { defaultValue: "Aucun média." })}
          </div>
        ) : (
          <div className="space-y-3">
            {media.map((m) => (
              <div
                key={m.id || m.filename}
                className="bg-white border rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-medium">{m.originalname || m.filename}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {m.folder ? (
                      <>
                        <strong>{t("mediaManagerPage.folderLabel", { defaultValue: "Dossier" })}</strong> {m.folder} •{" "}
                      </>
                    ) : null}
                    {Array.isArray(m.tags) && m.tags.length ? (
                      <>
                        <strong>{t("mediaManagerPage.tagsLabel", { defaultValue: "Tags" })}</strong> {m.tags.join(", ")} •{" "}
                      </>
                    ) : null}
                    <span>{((m.size || 0) / 1024).toFixed(1)} KB</span>
                  </div>

                  {m.url ? (
                    <div className="mt-2">
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        {t("mediaManagerPage.open", { defaultValue: "Ouvrir" })}
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2 shrink-0">
                  {m.url ? (
                    <button
                      type="button"
                      onClick={() => copyUrl(m.url)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {t("mediaManagerPage.copyUrl", { defaultValue: "Copier l’URL" })}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                  >
                    {t("mediaManagerPage.delete", { defaultValue: "Supprimer" })}
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