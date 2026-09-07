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

Dans chaque environnement, ajouter ces secrets (valeurs différentes pour
staging et production) :

| Secret | Exemple |
|---|---|
| `SSH_HOST` | l'hôte SSH du compte cPanel |
| `SSH_PORT` | souvent `21098` sur cPanel, à vérifier dans *Security → SSH Access* |
| `SSH_USER` | l'utilisateur cPanel (`sc2djem5820` d'après les fichiers déjà présents) |
| `SSH_PRIVATE_KEY` | clé privée dédiée au déploiement (voir étape 2) |
| `REMOTE_API_PATH` | ex. `/home2/sc2djem5820/public_html/api` (staging : un chemin séparé) |
| `REMOTE_FRONTEND_PATH` | ex. `/home2/sc2djem5820/public_html` (staging : un chemin séparé) |
| `HEALTH_URL` | ex. `https://api.harvestcentertd.org/health` |

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
4. Créer une application Node/Passenger pour l'API de staging (comme
   l'app `api` existante), avec son propre `.env` (voir
   `api/.env.example`) pointant vers la base de staging.
5. Renseigner `REMOTE_API_PATH` / `REMOTE_FRONTEND_PATH` /
   `HEALTH_URL` de l'environnement GitHub `staging` avec ces nouveaux
   chemins.

## 4. Premier déploiement

Une fois les secrets renseignés : *Actions → Deploy → Run workflow* →
choisir `staging`. Vérifier le résultat avant de tenter `production`.

## Ce que ce pipeline ne fait pas (encore)

- Pas de rollback automatique si le health check échoue après un
  déploiement déjà synchronisé — à ajouter si ça devient un problème réel.
- Pas de déclenchement automatique sur push : chaque déploiement est un
  choix explicite, ce qui est volontaire tant qu'aucune suite de tests
  ne couvre l'API (phase 1 du plan de refonte).
