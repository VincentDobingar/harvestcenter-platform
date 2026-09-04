# Migrations

`0001_initial_schema.sql` est le schéma complet (36 tables), récupéré depuis la
base de production le 2026-09-03 puis rendu compatible MySQL 8 (les colonnes
`uuid` natives de MariaDB ont été converties en `char(36)`, MySQL 8 ne
supportant pas ce type).

## Appliquer les migrations

```bash
cd api
npm run db:migrate
```

Utilise les variables `DB_*` de `.env`. Chaque fichier n'est appliqué qu'une
seule fois (suivi dans la table `schema_migrations`), donc la commande est
sûre à relancer.

## Ajouter une nouvelle migration

Créer un nouveau fichier `000X_description.sql` (numéro suivant, toujours
croissant) dans ce dossier avec le `ALTER TABLE`/`CREATE TABLE` nécessaire,
puis lancer `npm run db:migrate`. Ne jamais modifier un fichier de migration
déjà appliqué en production — en créer un nouveau à la place.
