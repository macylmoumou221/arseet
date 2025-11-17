-- ================================================================================
-- MIGRATION: Mise à jour du système de vérification d'email
-- ================================================================================
-- Description: Remplace le système de token par un code à 8 chiffres
-- Date: 2025-11-07
-- Auteur: Backend Team
-- ================================================================================

-- Étape 1: Supprimer les anciennes colonnes de token
ALTER TABLE users DROP COLUMN token_verification;
ALTER TABLE users DROP COLUMN token_verification_expiration;

-- Étape 2: Ajouter les nouvelles colonnes pour le code de vérification
ALTER TABLE users ADD COLUMN code_verification VARCHAR(8) NULL AFTER email_verifie;
ALTER TABLE users ADD COLUMN code_verification_expiration DATETIME NULL AFTER code_verification;

-- Étape 3: Optionnel - Réinitialiser la vérification des comptes non vérifiés
-- Décommentez cette ligne si vous voulez que tous les utilisateurs non vérifiés reçoivent un nouveau code
-- UPDATE users SET email_verifie = false WHERE email_verifie = false;

-- ================================================================================
-- NOTES IMPORTANTES
-- ================================================================================
-- 1. Cette migration supprime les anciens tokens de vérification
-- 2. Les utilisateurs avec des tokens non utilisés devront demander un nouveau code
-- 3. Le nouveau code expire après 15 minutes (au lieu de 24 heures)
-- 4. Le code doit contenir exactement 8 chiffres numériques
-- 5. Après cette migration, redémarrez le serveur Node.js
-- ================================================================================

-- Vérification: Afficher la structure de la table users
DESCRIBE users;

-- Vérification: Compter les utilisateurs non vérifiés
SELECT COUNT(*) as non_verifies FROM users WHERE email_verifie = false;

-- ================================================================================
-- FIN DE LA MIGRATION
-- ================================================================================
