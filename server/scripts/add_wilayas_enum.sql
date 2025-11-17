-- ================================================================================
-- MIGRATION: Ajout de l'ENUM pour les 58 wilayas d'Algérie
-- ================================================================================
-- Description: Convertir le champ wilaya de VARCHAR à ENUM avec les 58 wilayas
-- Date: 2025-11-07
-- Auteur: Backend Team
-- ================================================================================

-- Étape 1: Modifier la colonne wilaya dans la table commandes
ALTER TABLE commandes 
MODIFY COLUMN wilaya ENUM(
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M''Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M''Ghair', 'El Meniaa'
) NOT NULL;

-- ================================================================================
-- NOTES IMPORTANTES
-- ================================================================================
-- 1. Cette migration modifie le type de colonne wilaya de VARCHAR à ENUM
-- 2. Assurez-vous que les données existantes correspondent aux valeurs ENUM
-- 3. Les 10 nouvelles wilayas (49-58) ont été ajoutées en 2019
-- 4. Wilayas avec apostrophes: M'Sila, El M'Ghair (échappées avec '')
-- 5. Après cette migration, redémarrez le serveur Node.js
-- ================================================================================

-- Vérification: Afficher la structure de la table commandes
DESCRIBE commandes;

-- Vérification: Compter les commandes par wilaya
SELECT wilaya, COUNT(*) as nombre_commandes 
FROM commandes 
GROUP BY wilaya 
ORDER BY nombre_commandes DESC;

-- ================================================================================
-- ROLLBACK (si nécessaire)
-- ================================================================================
-- Pour revenir en arrière, exécuter:
-- ALTER TABLE commandes MODIFY COLUMN wilaya VARCHAR(100) NOT NULL;
-- ================================================================================

-- ================================================================================
-- FIN DE LA MIGRATION
-- ================================================================================
