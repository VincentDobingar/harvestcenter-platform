# Déploiement

Deux workflows GitHub Actions couvrent l'intégration et le déploiement :

- **`.github/workflows/ci.yml`** — tourne sur chaque push/PR vers `main` :
  installe, lint et build le frontend ; installe et vérifie la syntaxe de
  l'API. Pas encore de suite de tests (voir le plan de refonte, phase 1) —
  la ligne `node --check` est un placeholder à remplacer par `npm test`
  dès qu'une vraie suite existe.
- **`.github/workflows/deploy.yml`** — déclenché **manuellement** depuis
  l'onglet *Actions* de GitHub (`workflow_dispatch`), avec un choix
  `staging` ou `production`. Il build le frontend, synchronise le
  frontend (`frontend/dist/`) et l'API (`api/`) par `rsync` en SSH vers
  cPanel, réinstalle les dépendances de l'API côté serveur, puis force
  Passenger à redémarrer en touchant `api/tmp/restart.txt` — c'est le
  mécanisme standard de rechargement de cPanel Passenger, déjà en place
  dans ce dépôt (`api/.htaccess`, `api/start.sh`).

Rien de tout cela ne se déclenche tout seul : les deux fichiers sont créés
dans ce dépôt local et **n'ont pas encore été poussés sur GitHub**. Une
fois poussés, `deploy.yml` restera inerte tant que les secrets ci-dessous
n'existent pas.

## 1. Créer les deux environnements GitHub

Dans le repo GitHub (`VincentDobingar/harvestcenter-platform`) →
**Settings → Environments** → créer `staging` et `production`.

Pour `production`, activer *Required reviewers* et s'ajouter soi-même —
cela impose une validation manuelle avant que le job ne s'exécute, même
après avoir cliqué sur *Run workflow*.

Dans chaque environnement, ajouter ces secrets. Valeurs confirmées pour ce
compte (o2switch, utilisateur `sc2djem5820`, serveur `dexter.o2switch.net`) :

| Secret | `production` | `staging` |
|---|---|---|
| `SSH_HOST` | `dexter.o2switch.net` | `dexter.o2switch.net` |
| `SSH_PORT` | `22` | `22` |
| `SSH_USER` | `sc2djem5820` | `sc2djem5820` |
| `SSH_PRIVATE_KEY` | clé dédiée (étape 2) | idem, ou une clé séparée |
| `REMOTE_API_PATH` | `/home2/sc2djem5820/public_html/api` | `/home2/sc2djem5820/staging.api.harvestcentertd.org` |
| `REMOTE_FRONTEND_PATH` | `/home2/sc2djem5820/public_html` | `/home2/sc2djem5820/staging.harvestcentertd.org` |
| `FRONTEND_API_BASE_URL` | `https://api.harvestcentertd.org` | `https://staging.api.harvestcentertd.org` |
| `HEALTH_URL` | `https://api.harvestcentertd.org/health` | `https://staging.api.harvestcentertd.org/health` |

`FRONTEND_API_BASE_URL` pilote l'URL d'API que le frontend appelle une fois
buildé — voir la note dans `deploy.yml` : c'est une valeur figée **au
moment du build** (`VITE_API_BASE_URL`), pas lue depuis `config.json` au
runtime malgré ce que `main.jsx` laisse penser (`window.__RUNTIME_CONFIG__`
y est posé mais n'est lu nulle part ailleurs dans le code).

## 2. Générer une clé SSH dédiée au déploiement

Ne pas réutiliser une clé personnelle. Depuis un poste de confiance :

```
ssh-keygen -t ed25519 -f deploy_key -C "github-actions-deploy" -N ""
```

- La clé **publique** (`deploy_key.pub`) se dépose dans cPanel :
  *Security → SSH Access → Manage SSH Keys → Import Key*, puis
  *Authorize* la clé importée.
- La clé **privée** (`deploy_key`) devient la valeur du secret GitHub
  `SSH_PRIVATE_KEY`. Elle ne doit exister nulle part ailleurs qu'en local
  le temps de la copier, et dans GitHub.

## 3. Staging : ce qui reste à faire côté cPanel

Ce dépôt ne peut pas provisionner cPanel à distance — ces étapes sont
manuelles, une fois, dans l'interface cPanel :

1. Créer un sous-domaine (ex. `staging.harvestcentertd.org` et
   `staging-api.harvestcentertd.org`), avec sa propre racine de
   documents, séparée de la prod.
2. Créer une **base de données MySQL distincte** pour le staging — ne
   jamais pointer le staging vers la base de production (données
   d'étudiants, paiements réels).
3. Faire tourner les migrations (`npm run db:migrate` depuis
   `api/migrations/`) sur cette nouvelle base.
4. Créer une application Node/Passenger pour l'API de staging (cPanel →
   *Setup Node.js App*, dossier `staging.api.harvestcentertd.org`), avec
   son propre `.env` (voir `api/.env.example`) pointant vers la base de
   staging. Cette étape génère automatiquement le `.htaccess`
   Passenger-spécifique de cette app — ne pas le remplacer par celui du
   dépôt.
5. Ajouter à la main, sur ce `.htaccess` généré par cPanel, le même bloc
   de durcissement que celui appliqué en production (voir le commit
   `56f0eb9`, section `<FilesMatch>`) — sinon `.env`, les migrations
   `.sql`, etc. du staging seront aussi directement téléchargeables.
6. `deploy.yml` exclut volontairement `.htaccess` du rsync de l'API pour
   cette raison (config Passenger propre à chaque app) — mais renseigne
   automatiquement le `.htaccess` du **frontend** (proxy `/api` retargeté
   par environnement via `FRONTEND_API_BASE_URL`).
7. Renseigner les sept secrets de l'environnement GitHub `staging` (voir
   le tableau ci-dessus).
8. `api/app.js` liste en dur les origines CORS autorisées
   (`allowedOrigins`) — `staging.harvestcentertd.org` y a été ajouté.
   Si le nom du sous-domaine change, mettre cette liste à jour.

## 4. Premier déploiement

Une fois les secrets renseignés : *Actions → Deploy → Run workflow* →
choisir `staging`. Vérifier le résultat avant de tenter `production`.

## Ce que ce pipeline ne fait pas (encore)

- Pas de rollback automatique si le health check échoue après un
  déploiement déjà synchronisé — à ajouter si ça devient un problème réel.
- Pas de déclenchement automatique sur push : chaque déploiement est un
  choix explicite, ce qui est volontaire tant qu'aucune suite de tests
  ne couvre l'API (phase 1 du plan de refonte).
