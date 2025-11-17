-- ============================================
-- Script: Suppression des utilisateurs non-admins
-- Date: 2025-11-07
-- Description: Supprime tous les utilisateurs où est_admin = 0 (false)
-- ============================================

-- Sélectionner la base de données
USE arseet_db;

-- Afficher le nombre d'utilisateurs non-admins avant suppression
SELECT 
    COUNT(*) as total_non_admins,
    'Utilisateurs non-admins à supprimer' as description
FROM users 
WHERE est_admin = 0;

-- Afficher les utilisateurs non-admins qui seront supprimés (pour vérification)
SELECT 
    id,
    nom,
    prenom,
    email,
    est_admin,
    date_creation
FROM users 
WHERE est_admin = 0
ORDER BY date_creation DESC;

-- ATTENTION: Décommenter la ligne suivante pour effectuer la suppression
-- DELETE FROM users WHERE est_admin = 0;

-- Afficher le nombre d'utilisateurs restants (admins uniquement)
-- SELECT 
--     COUNT(*) as total_admins,
--     'Utilisateurs admins restants' as description
-- FROM users 
-- WHERE est_admin = 1;

-- Afficher tous les admins restants
-- SELECT 
--     id,
--     nom,
--     prenom,
--     email,
--     est_admin,
--     date_creation
-- FROM users 
-- WHERE est_admin = 1
-- ORDER BY date_creation DESC;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Vérifiez d'abord les utilisateurs qui seront supprimés
-- 2. Décommentez la ligne DELETE pour effectuer la suppression
-- 3. Exécutez le script: mysql -u root -p arseet_db < scripts/delete_non_admin_users.sql
-- ============================================
