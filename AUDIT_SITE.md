# Audit technique — HarvestCenter Platform

Date : 2026-09-04
Périmètre : `api/` (backend Node/Express/MySQL) et `frontend/` (Vite/React)
Méthode : lecture de code (routes, controllers, middlewares, config), vérification croisée des imports, historique git, absence de tests automatisés disponibles.

Ce document remplace l'analyse précédente qui a été perdue. Chaque point est vérifiable directement dans le code aux emplacements indiqués.

---

## ✅ Mise à jour du 2026-09-04 — corrections appliquées

Les points #2, #3, #4 et #5 ci-dessous ont été corrigés et vérifiés (redémarrage de l'API + tests HTTP confirmant que les routes répondent correctement au lieu de rester bloquées ou de refuser à tort l'accès).

Les points #6, #7 et #8 ont également été corrigés et vérifiés (`loginLimiter` testé : 429 après 5 tentatives ; secrets rotés côté production par l'utilisateur).

**Bonus trouvé pendant la correction** : `api/routes/grades.routes.js` contenait une route `GET /grades` (donc `GET /api/grades/grades`) commentée "public/test", sans aucune authentification, qui exposait `SELECT * FROM grades LIMIT 10` à n'importe qui. Elle a été supprimée (code de test resté en prod).

Le point #1 (secrets de prod exposés dans `ScriptSSH.txt`) reste **à traiter côté production** — voir section correspondante, action non automatisable depuis ce dépôt local.

---

## 🔴 CRITIQUE

### 1. Identifiants de production exposés dans git
**Fichier** : `ScriptSSH.txt` (racine du repo, **tracké et poussé sur origin/main**)
Contient en clair : le mot de passe de la base de production (`DB_PASSWORD=Harvest@2026!`), l'utilisateur DB (`sc2djem5820_harvest_user`), le `JWT_SECRET` réel actuellement utilisé en prod (identique à celui dans `api/.env`), et le host SMTP.
**Impact** : quiconque a cloné ou peut cloner le repo (GitHub `VincentDobingar/harvestcenter-platform`) possède les accès complets à la base de production et peut forger des JWT valides pour n'importe quel utilisateur/rôle.
**Action immédiate recommandée** :
- Changer le mot de passe MySQL de production et le `JWT_SECRET`/`JWT_REFRESH_SECRET` dès que possible (cela invalidera les sessions actives, à prévoir).
- Supprimer `ScriptSSH.txt` du repo et de l'historique git (un simple `git rm` ne suffit pas, il reste dans l'historique — utiliser `git filter-repo` ou BFG, ou considérer les secrets comme définitivement compromis et les rotater).
- Vérifier la visibilité du repo GitHub (public/privé) et qui y a accès.

### 2. ✅ Corrigé — Plusieurs routes protégées ne répondent jamais (deadlock middleware)
**Cause** : `middlewares/auth.middleware.js` exporte `requireAuth` comme une **factory** (`requireAuth(...roles)` qui retourne le vrai middleware). Dans plusieurs fichiers de routes, elle est utilisée **sans être appelée**, donc Express exécute la factory elle-même comme middleware : elle construit une fonction et la jette, sans jamais appeler `next()` ni envoyer de réponse → la requête reste bloquée indéfiniment (timeout côté client).

Routes concernées :
- `api/routes/assignments.routes.js:7` → `GET /api/assignments`
- `api/routes/sync.routes.js:10` → `POST /api/sync`
- `api/routes/formations.routes.js:16` → `POST /api/formations/:id/enroll`
- `api/routes/formations.routes.js:17` → `GET /api/formations/:id/stats`
- `api/routes/stats.routes.js:35` → `GET /api/stats/overview`

**Fix** : soit appeler `requireAuth()` (sans rôle) ou `requireAuth("role")`, soit importer la version non-factory de `middlewares/requireAuth.js` selon le besoin.

### 3. ✅ Corrigé — Toutes les routes `/api/grades/*` sont cassées pour tout le monde sauf superadmin
**Fichier** : `api/routes/grades.routes.js:19-22`
Le code appelle `requireAuth(["teacher"])` (un **tableau** comme unique argument) au lieu de `requireAuth("teacher")` (arguments variadiques attendus par la factory). Résultat : `allowedRoles` devient `[["teacher"]]`, et `allowedRoles.includes(decoded.role)` ne trouvera jamais la chaîne `"teacher"` → 403 systématique pour tout rôle non-superadmin.
**Impact** : notation, consultation des notes, export PDF — toute la fonctionnalité "grades" est inutilisable en pratique.

### 4. ✅ Corrigé — Le superadmin n'a pas accès à une grande partie du panneau admin
**Fichiers** : `api/middlewares/requireRole.js` vs `api/middlewares/auth.middleware.js`
`auth.middleware.js` implémente explicitement "superadmin a tous les droits" (bypass), mais `requireRole.js` (utilisé par `admin.routes.js` et `superadmin.routes.js`) ne le fait pas — il vérifie une égalité stricte de rôle.
`admin.routes.js:11` fait `router.use(requireRole("admin"))`, donc un utilisateur `superadmin` reçoit 403 sur **toutes** les routes `/api/admin/*` : enseignants, classes, bourses, emplois du temps, étudiants, annonces, demandes d'inscription, stats, security-dashboard. Ces fonctionnalités n'existent nulle part sous `/api/superadmin/*`.
**Fix** : soit ajouter `"superadmin"` dans les appels `requireRole(...)`, soit faire porter le bypass superadmin dans `requireRole.js` lui-même.

### 5. ✅ Corrigé — `GET /api/stats/admin` et `GET /api/stats/` sont inutilisables
**Fichier** : `api/routes/stats.routes.js:13-32`, `api/middlewares/authJwt.js`
Trois problèmes cumulés :
- `authenticateToken` lit le token depuis le header `Authorization: Bearer`, alors que toute l'authentification de l'app (login, requireAuth, requireAuth.js) repose sur des **cookies httpOnly** (`access_token`). Le frontend n'envoie jamais ce header.
- `authorizeRoles` vérifie `req.user.roles` (tableau), alors que le payload JWT généré par `auth.controller.js` contient `role` (singulier, chaîne).
- Le rôle attendu est `"administrator"`, qui n'existe pas dans `normalizeRole()` (les rôles réels sont `student`, `teacher`, `admin`, `superadmin`).
Chacun de ces trois points suffit à bloquer l'accès ; les trois cumulés confirment que ces routes n'ont probablement jamais fonctionné avec le frontend actuel.

---

## 🟠 ÉLEVÉ

### 6. ✅ Corrigé — Pas de protection anti-bruteforce sur le login
**Fichier** : `api/middlewares/rateLimit.js` définit `loginLimiter` (via `express-rate-limit`) mais il n'est **importé nulle part**. `POST /api/auth/login` et `/register` (`api/routes/auth.routes.js`) n'ont aucune limite de tentatives.

### 7. ✅ Corrigé — Le handler d'erreur global fuite les messages d'erreur en production
**Fichier** : `api/app.js:113-121`
`res.status(500).json({ message: err.message, stack: ... })` — `stack` est bien masqué en prod, mais `message` est toujours renvoyé au client, y compris pour des erreurs SQL brutes (peut révéler noms de colonnes/tables, structure interne).

### 8. ✅ Corrigé (côté production) — `JWT_REFRESH_SECRET` est un secret faible/placeholder
**Fichier** : `api/.env` → `JWT_REFRESH_SECRET=anothersecret456`
Contrairement à `JWT_SECRET` (64 octets aléatoires générés proprement, cf. `ScriptSSH.txt`), le refresh secret est une chaîne devinable. À régénérer avec la même méthode (`crypto.randomBytes(64).toString('hex')`).

---

## 🟡 MOYEN / DETTE TECHNIQUE

### 9. ✅ Corrigé — Quatre implémentations différentes et incohérentes de l'authentification
`middlewares/auth.middleware.js`, `middlewares/requireAuth.js`, `middlewares/authJwt.js`, `middlewares/auth.js` (mort) coexistaient, avec des signatures différentes (factory vs middleware direct, cookie vs header Bearer, `role` vs `roles`). C'était la cause directe des bugs #2, #3, #5. Idem pour `role.js` (comparaison sensible à la casse) vs `requireRole.js` (normalisée).
**Fix appliqué** : toutes les routes utilisent désormais une seule implémentation (`auth.middleware.js` → `requireAuth(...roles)` + `requireRole.js` → `requireRole(...roles)`, toutes deux cookie-based et normalisées). Les fichiers concurrents ont été supprimés (voir #10).

### 10. ✅ Corrigé — Code mort jamais importé
Supprimés : `middlewares/auth.js`, `middlewares/requirePermission.js` (utilisait `db.query` sans même importer `db`), `middlewares/student.middleware.js`, `middlewares/requireAuth.js`, `middlewares/role.js`, `middlewares/authJwt.js`, `middlewares/auditLog.js` (redondant avec l'écriture directe dans `audit_logs` faite par `admin.controller.js`), `middlewares/sync.middleware.js` (redondant avec `offlineSync.middleware.js`, qui lui est utilisé), ainsi que `config/jwt.js` (seul consommateur : `authJwt.js`).

### 11. ✅ Corrigé — Dépendance `csurf` inutilisée
Retirée de `api/package.json` (`npm uninstall csurf`). Aucune protection CSRF active dans l'app malgré l'usage de cookies + `credentials: true` en CORS — à réévaluer séparément si une vraie protection CSRF est nécessaire (ce n'était de toute façon pas ce que `csurf` non-branché fournissait).

### 12. ✅ Corrigé — `health.routes.js` ouvre une connexion MySQL brute à chaque appel
**Fichier** : `api/routes/health.routes.js`
Utilise maintenant le pool partagé de `config/db.js` (`db.getConnection()` + `.ping()` + `.release()`) au lieu de créer et fermer une connexion `mysql2` à chaque requête. Message d'erreur également généralisé (cohérent avec le fix #7).

### 13. Système de permissions granulaire construit mais jamais branché
Les tables `role_permissions` et `permissions` existent dans le schéma (`schema.sql`), mais le seul code qui les utilisait (`requirePermission.js`) a été supprimé au point #10 car mort et cassé (bug d'import). Les tables restent en base, inutilisées. **Décision à prendre** : soit implémenter proprement ce système de permissions granulaires si le besoin est réel, soit retirer ces tables du schéma si l'idée est abandonnée. Aucune action de code n'a été prise ici faute de décision produit.

---

## 🟢 FAIBLE / NOTES

### 14. Pas de migrations versionnées
`api/config/script.sql` ne contient qu'une table (`opportunities`) sur les 36 réelles. Le schéma complet n'existe que dans la base de production ; il a fallu le dumper manuellement pendant cette session (`api/config/schema.sql`, converti en `schema_mysql8.sql` pour compatibilité MySQL 8 — MariaDB en prod supporte nativement le type `uuid`, pas MySQL 8). Ces deux fichiers sont désormais dans `.gitignore`.

### 15. Le frontend local pointe toujours vers l'API de production
`frontend/.env` → `VITE_API_BASE_URL=https://api.harvestcentertd.org`. Pas de fichier séparé pour pointer vers l'API locale (`http://localhost:5000`) pendant le développement.

### 16. Fichiers d'archive à la racine
`api.zip`, `api1.zip`, `Test_Img/` (non trackés par git, donc pas de risque de fuite, mais à nettoyer si obsolètes).

---

## Ce qui est déjà solide

- Toutes les requêtes SQL vérifiées dans `auth.controller.js`, `admin.controller.js`, `opportunities.controller.js` utilisent des requêtes paramétrées (`?`) — pas d'injection SQL trouvée.
- Mots de passe hashés avec `bcrypt` (coût 12).
- `helmet()` actif, CORS avec liste blanche stricte d'origines.
- Cookies d'auth en `httpOnly`, `secure` en prod.
- Le bug historique "admin.routes.js contenait du JSX frontend" (commit `86f5adb`) est bien résolu — le fichier actuel est un routeur Express propre.
- `ScriptSSH.txt` et `Test_Postman.json` ne contiennent pas d'autre fuite que celle listée au point #1 (le fichier Postman n'a que des identifiants de test factices).

---

## Priorisation suggérée

1. Rotation des secrets de prod (#1) — urgent, indépendant du reste.
2. Corriger les 5 routes qui "hang" (#2) + grades cassé (#3) + superadmin bloqué (#4) — ce sont des bugs fonctionnels simples à corriger (quelques lignes chacun) une fois identifiés.
3. Brancher `loginLimiter` (#6) et nettoyer le message d'erreur global (#7).
4. Décider de la stratégie d'unification des middlewares d'auth (#9) avant d'ajouter de nouvelles routes protégées, pour ne pas reproduire les mêmes bugs.
