-- Migration: Ajout du statut 'confirmee' et modification de 'en_cours' en 'en_attente'
-- Date: 2025-01-XX
-- Description: Mise à jour du système de confirmation de commandes

-- 1. Modifier l'ENUM pour ajouter 'confirmee' et changer 'en_cours' en 'en_attente'
ALTER TABLE commandes 
MODIFY COLUMN statut ENUM('en_attente', 'confirmee', 'expediee', 'livree', 'annulee') 
NOT NULL 
DEFAULT 'en_attente'
COMMENT 'en_attente: nouvelle commande | confirmee: admin a confirmé | expediee: en cours de livraison | livree: reçue | annulee: annulée';

-- 2. Mettre à jour toutes les commandes existantes 'en_cours' → 'en_attente'
-- (Si vous avez déjà des commandes avec le statut 'en_cours')
-- UPDATE commandes SET statut = 'en_attente' WHERE statut = 'en_cours';

-- 3. Vérifier les changements
SELECT 
  statut, 
  COUNT(*) as nombre_commandes 
FROM commandes 
GROUP BY statut;

-- Note: Assurez-vous d'ajouter ADMIN_EMAIL dans votre fichier .env
-- ADMIN_EMAIL=admin@arseet.com
