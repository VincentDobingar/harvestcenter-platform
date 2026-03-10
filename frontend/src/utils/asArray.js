// src/utils/asArray.js
export function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  // handle common API shapes
  if (v.rows && Array.isArray(v.rows)) return v.rows;
  if (v.items && Array.isArray(v.items)) return v.items;
  return [];
}
