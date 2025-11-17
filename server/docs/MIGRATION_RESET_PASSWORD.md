# Migration : Ajout du flux de réinitialisation de mot de passe

Les fonctionnalités de réinitialisation de mot de passe nécessitent deux colonnes supplémentaires dans la table `users` :

- `reset_password_code` (VARCHAR(128), nullable) — stockage du hash du code à 8 chiffres
- `reset_password_expiration` (DATETIME, nullable)

## SQL à exécuter

```sql
ALTER TABLE users
  ADD COLUMN reset_password_code VARCHAR(128) NULL AFTER code_verification_expiration,
  ADD COLUMN reset_password_expiration DATETIME NULL AFTER reset_password_code;

CREATE INDEX idx_users_reset_password_code
  ON users (reset_password_code);
```

> ⚠️ Pensez à sauvegarder votre base avant de lancer la migration.

## Retour arrière (optionnel)

```sql
ALTER TABLE users
  DROP COLUMN reset_password_expiration,
  DROP COLUMN reset_password_code;
```

## Après la migration

1. Redémarrez l'API pour qu'elle prenne en compte la variable d'environnement `RESET_PASSWORD_CODE_EXPIRATION_MINUTES`.
2. Mettez à jour votre fichier `.env` ou stockez les nouvelles variables dans votre gestionnaire de secrets.
3. Testez le flux en appelant `POST /api/auth/password/forgot` puis `POST /api/auth/password/reset`.
