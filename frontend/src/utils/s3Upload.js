import api from "./api";

/**
 * Upload direct à S3 via PUT pré-signé.
 * @param {File} file
 * @param {Object} opts { folder?: string }
 * @returns {Promise<{ publicUrl: string, key: string }>}
 */
export async function s3DirectUpload(file, opts = {}) {
  const mime = file.type || "application/octet-stream";

  // 1) Demande une URL pré-signée
  const { data: sig } = await api.get("/uploads/s3/sign", {
    params: {
      mime,
      filename: file.name,
      folder: opts.folder || "media"
    }
  });

  // 2) PUT direct vers S3
  const putRes = await fetch(sig.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mime },
    body: file
  });

  if (!putRes.ok) {
    const msg = await putRes.text().catch(() => "");
    throw new Error(`Upload S3 échoué: ${putRes.status} ${msg}`);
  }

  return { publicUrl: sig.publicUrl, key: sig.key };
}
