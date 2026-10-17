// api/scripts/generate-jwt-secrets.js
// Génère deux secrets JWT aléatoires (64 octets chacun, encodés en hex = 128 caractères).
// Usage : node scripts/generate-jwt-secrets.js   (ou : npm run secrets:jwt)
// Copier les deux lignes affichées dans le .env du serveur, puis redémarrer l'API.
// ⚠️ Changer ces secrets déconnecte tous les utilisateurs (ils devront se reconnecter).
// Ne jamais commiter les valeurs générées.
import crypto from "node:crypto";

const gen = () => crypto.randomBytes(64).toString("hex");

console.log(`JWT_SECRET=${gen()}`);
console.log(`JWT_REFRESH_SECRET=${gen()}`);
