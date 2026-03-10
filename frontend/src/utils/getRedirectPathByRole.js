// src/utils/getRedirectPathByRole.js
// Utilitaires pour obtenir les chemins (espace / profil) selon le rôle.
// Renvoie des chemins absolus ; tolérant sur les alias de rôle.
//
// Usage:
// import { getRedirectPathByRole, getProfilePathByRole } from "@/utils/getRedirectPathByRole";
// const path = getRedirectPathByRole(user);

const normalize = (v) => String(v || "").toLowerCase().trim();

const PATHS_BY_ROLE = {
  student: { spacePath: "/etudiant/dashboard", profilePath: "/etudiant/profile" },
  etudiant: { spacePath: "/etudiant/dashboard", profilePath: "/etudiant/profile" },

  teacher: { spacePath: "/formateur/dashboard", profilePath: "/formateur/profile" },
  trainer: { spacePath: "/formateur/dashboard", profilePath: "/formateur/profile" },
  formateur: { spacePath: "/formateur/dashboard", profilePath: "/formateur/profile" },
  teacher: { spacePath: "/formateur/dashboard", profilePath: "/formateur/profile" },

  admin: { spacePath: "/admin/dashboard", profilePath: "/admin/profile" },
  administrateur: { spacePath: "/admin/dashboard", profilePath: "/admin/profile" },
  administrator: { spacePath: "/admin/dashboard", profilePath: "/admin/profile" },
  superadmin: { spacePath: "/admin/dashboard", profilePath: "/admin/profile" },
  secretaire: { spacePath: "/admin/dashboard", profilePath: "/admin/profile" },
};

// fallback when not logged in: point to account page with login tab
const FALLBACK_PATH = "/account?tab=login";

/**
 * Retourne l'objet paths { spacePath, profilePath } pour un role donné (string or user obj).
 * Si rôle inconnu -> fallback.
 */
export function getPathsByRole(userOrRole) {
  if (!userOrRole) return { spacePath: FALLBACK_PATH, profilePath: FALLBACK_PATH };

  const role =
    typeof userOrRole === "string"
      ? normalize(userOrRole)
      : normalize(userOrRole.role || userOrRole?.role_name || userOrRole?.role?.name || "");

  if (!role) return { spacePath: FALLBACK_PATH, profilePath: FALLBACK_PATH };

  // check map for direct key or try to find by inclusion
  if (PATHS_BY_ROLE[role]) return PATHS_BY_ROLE[role];

  // tolerant matching: find first mapping where the key is included in role string
  const foundKey = Object.keys(PATHS_BY_ROLE).find((k) => role.includes(k));
  if (foundKey) return PATHS_BY_ROLE[foundKey];

  return { spacePath: FALLBACK_PATH, profilePath: FALLBACK_PATH };
}

/**
 * Retourne la route "Mon espace" pour cet user/role
 */
export function getRedirectPathByRole(userOrRole) {
  const { spacePath } = getPathsByRole(userOrRole);
  return spacePath || FALLBACK_PATH;
}

/**
 * Retourne la route "Mon profil" pour cet user/role
 */
export function getProfilePathByRole(userOrRole) {
  const { profilePath } = getPathsByRole(userOrRole);
  return profilePath || FALLBACK_PATH;
}

export default getRedirectPathByRole;
