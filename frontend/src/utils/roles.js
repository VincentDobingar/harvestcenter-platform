// src/utils/roles.js

export function getRedirectForRole(role) {
  if (!role) return '/mon-compte';
  const r = role.toLowerCase();

  if (r === 'teacher' || r === 'formateur') return '/teacher';
  if (r === 'admin' || r === 'administrateur') return '/admin';
  if (r === 'student' || r === 'etudiant') return '/student';
  
  // fallback
  return '/mon-compte';
}
