-- ============================================
-- Script de Migration - Suppression des colonnes inutiles
-- Date: 2024
-- Description: Supprime les colonnes marque, matiere et poids de la table produits
-- ============================================

USE arseet_ecommerce;

-- Vérifier la structure actuelle de la table
DESCRIBE produits;

-- Supprimer les colonnes inutiles
ALTER TABLE produits
DROP COLUMN marque,
DROP COLUMN matiere,
DROP COLUMN poids;

-- Vérifier la nouvelle structure
DESCRIBE produits;

-- Afficher un message de confirmation
SELECT 'Migration terminée: colonnes marque, matiere et poids supprimées avec succès!' AS message;
