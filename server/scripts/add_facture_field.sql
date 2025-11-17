-- ============================================
-- Script de Migration - Ajout du champ facture
-- Date: 2024
-- Description: Ajoute le champ facture (URL PDF) à la table commandes
-- ============================================

USE arseet_ecommerce;

-- Vérifier la structure actuelle de la table
DESCRIBE commandes;

-- Ajouter le champ facture
ALTER TABLE commandes
ADD COLUMN facture VARCHAR(500) NULL COMMENT 'URL du fichier PDF de la facture' AFTER notes;

-- Vérifier la nouvelle structure
DESCRIBE commandes;

-- Afficher un message de confirmation
SELECT 'Migration terminée: champ facture ajouté avec succès!' AS message;
