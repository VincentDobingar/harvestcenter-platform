// src/components/QuickLessonForm.jsx
import React, { useState } from "react";

/**
 * Petit formulaire réutilisable pour publier une leçon rapide (multipart).
 * onCreate({ title, content, file })
 */
export default function QuickLessonForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), content: content.trim(), file });
    setTitle("");
    setContent("");
    setFile(null);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la leçon"
        aria-label="Titre de la leçon"
        required
        className="field"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Contenu"
        aria-label="Contenu"
        className="field h-28 resize-y"
      />
      <label className="block cursor-pointer rounded-xl border border-dashed border-line px-4 py-3 text-sm text-mist hover:border-ink/30">
        <span className="font-medium text-ink">{file ? file.name : "Joindre un fichier"}</span>
        {!file && <span> (facultatif)</span>}
        <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <button type="submit" disabled={!title.trim()} className="btn-primary focus-ring w-full">
        Publier la leçon
      </button>
    </form>
  );
}
