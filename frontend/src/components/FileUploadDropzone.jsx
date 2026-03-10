// 📁 src/components/FileUploadDropzone.jsx
import { useState, useRef } from "react";

export default function FileUploadDropzone({
  accept = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"],
  maxMB = 20,
  onFile,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  function validate(file) {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const okExt = accept.map((a) => a.toLowerCase());
    if (!okExt.includes(ext)) return `Type non autorisé (${ext}). Formats: ${okExt.join(", ")}`;
    const mb = file.size / (1024 * 1024);
    if (mb > maxMB) return `Fichier trop volumineux (${mb.toFixed(1)} MB). Max ${maxMB} MB`;
    return "";
  }

  function pick() {
    inputRef.current?.click();
  }

  function onInputChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const v = validate(f);
    if (v) { setError(v); return; }
    setError(""); setFileName(f.name);
    onFile?.(f);
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const v = validate(f);
    if (v) { setError(v); return; }
    setError(""); setFileName(f.name);
    onFile?.(f);
  }

  return (
    <div>
      <div
        onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
        onDragLeave={()=> setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer ${dragOver ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
        onClick={pick}
      >
        <div className="font-medium">Déposez votre fichier ici</div>
        <div className="text-xs text-gray-600">ou cliquez pour sélectionner (formats: {accept.join(", ")}, max {maxMB} MB)</div>
        {fileName && <div className="mt-2 text-sm">Fichier sélectionné : <b>{fileName}</b></div>}
        <input ref={inputRef} type="file" hidden accept={accept.join(",")} onChange={onInputChange} />
      </div>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
}
