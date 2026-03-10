// src/utils/normalize.js
/**
 * Helper utilities to normalize API responses that may come in
 * different shapes (array, { rows: [...] }, { items: [...] }, etc.)
 *
 * rowsFromResponse(resData) -> always returns an array (possibly empty)
 */

export function rowsFromResponse(resData) {
  if (!resData) return [];

  // If it's already an array, return it
  if (Array.isArray(resData)) return resData;

  // Common container property names
  const maybeArrays = ["rows", "items", "data", "courses", "students", "results"];
  for (const key of maybeArrays) {
    if (Array.isArray(resData[key])) return resData[key];
  }

  // If resData has a 'ok' wrapper with rows
  if (resData?.ok && Array.isArray(resData.rows)) return resData.rows;

  // If server returns something like { payload: [...] }
  for (const v of Object.values(resData)) {
    if (Array.isArray(v)) return v;
  }

  // Nothing usable found
  // Useful log for debugging in dev
  if (typeof window !== "undefined") {
    // avoid noisy logs in production by checking NODE_ENV
    if (process.env.NODE_ENV !== "production") {
      console.warn("rowsFromResponse: response not an array, returning []. Response:", resData);
    }
  }

  return [];
}
