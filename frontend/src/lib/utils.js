// src/lib/utils.js - ZERO dépendances
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}