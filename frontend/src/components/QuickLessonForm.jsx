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
    if (!title.trim()) return alert("Titre requis");
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
        placeholder="Titre"
        className="w-full p-2 border rounded"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Contenu"
        className="w-full p-2 border rounded h-24"
      />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
          Publier
        </button>
      </div>
    </form>
  );
}
