-- ============================================
-- SCRIPT SQL - BASE DE DONNÉES ARSEET E-COMMERCE
-- ============================================
-- Note: Ce script est pour MySQL/MariaDB
-- Si vous utilisez Oracle SQL Developer, ignorez les erreurs de syntaxe

-- Créer la base de données
CREATE DATABASE arseet_ecommerce;

USE arseet_ecommerce;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `prenom` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `mot_de_passe` VARCHAR(255) NOT NULL,
  `telephone` VARCHAR(20),
  `adresse` TEXT,
  `ville` VARCHAR(100),
  `code_postal` VARCHAR(10),
  `est_admin` BOOLEAN DEFAULT FALSE NOT NULL,
  `est_actif` BOOLEAN DEFAULT TRUE NOT NULL,
  `date_creation` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `derniere_connexion` DATETIME,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (`email`),
  INDEX idx_est_admin (`est_admin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: produits
-- ============================================
CREATE TABLE IF NOT EXISTS `produits` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `prix` DECIMAL(10, 2) NOT NULL CHECK (`prix` > 0),
  `prix_promo` DECIMAL(10, 2) CHECK (`prix_promo` > 0),
  `categorie` VARCHAR(100) NOT NULL,
  `image_avant` VARCHAR(500),
  `image_arriere` VARCHAR(500),
  `stock` INT DEFAULT 0 NOT NULL CHECK (`stock` >= 0),
  `en_rupture` BOOLEAN DEFAULT FALSE NOT NULL,
  `est_nouveau` BOOLEAN DEFAULT FALSE NOT NULL,
  `marque` VARCHAR(100),
  `matiere` VARCHAR(100),
  `poids` DECIMAL(10, 2) COMMENT 'Poids en grammes',
  `date_creation` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `date_mise_a_jour` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_categorie (`categorie`),
  INDEX idx_est_nouveau (`est_nouveau`),
  INDEX idx_en_rupture (`en_rupture`),
  INDEX idx_prix (`prix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: couleurs_produits
-- ============================================
CREATE TABLE IF NOT EXISTS `couleurs_produits` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `produit_id` INT NOT NULL,
  `couleur` VARCHAR(50) NOT NULL,
  `code_hexa` VARCHAR(7) COMMENT 'Format: #RRGGBB',
  `stock_couleur` INT DEFAULT 0 NOT NULL CHECK (`stock_couleur` >= 0),
  
  FOREIGN KEY (`produit_id`) REFERENCES `produits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_produit_couleur (`produit_id`, `couleur`),
  INDEX idx_produit_id (`produit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: tailles_produits
-- ============================================
CREATE TABLE IF NOT EXISTS `tailles_produits` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `produit_id` INT NOT NULL,
  `taille` VARCHAR(20) NOT NULL COMMENT 'Ex: XS, S, M, L, XL, 38, 40, etc.',
  `stock_taille` INT DEFAULT 0 NOT NULL CHECK (`stock_taille` >= 0),
  `mesures` JSON COMMENT 'Mesures en JSON',
  
  FOREIGN KEY (`produit_id`) REFERENCES `produits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_produit_taille (`produit_id`, `taille`),
  INDEX idx_produit_id (`produit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: commandes
-- ============================================
CREATE TABLE IF NOT EXISTS `commandes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT COMMENT 'NULL si commande sans compte',
  `nom_complet` VARCHAR(200) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `telephone` VARCHAR(20) NOT NULL,
  `adresse_livraison` TEXT NOT NULL,
  `ville` VARCHAR(100) NOT NULL,
  `code_postal` VARCHAR(10),
  `wilaya` VARCHAR(100) NOT NULL,
  `methode_livraison` ENUM('domicile', 'zr_express') DEFAULT 'domicile' NOT NULL,
  `frais_livraison` DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (`frais_livraison` >= 0),
  `sous_total` DECIMAL(10, 2) NOT NULL CHECK (`sous_total` > 0),
  `total` DECIMAL(10, 2) NOT NULL CHECK (`total` > 0),
  `statut` ENUM('en_cours', 'expediee', 'livree', 'annulee') DEFAULT 'en_cours' NOT NULL,
  `numero_suivi` VARCHAR(100) COMMENT 'Numéro de suivi du transporteur',
  `notes` TEXT,
  `date_creation` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `date_mise_a_jour` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_livraison` DATETIME,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_user_id (`user_id`),
  INDEX idx_statut (`statut`),
  INDEX idx_email (`email`),
  INDEX idx_date_creation (`date_creation`),
  INDEX idx_numero_suivi (`numero_suivi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: articles_commande
-- ============================================
CREATE TABLE IF NOT EXISTS `articles_commande` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `commande_id` INT NOT NULL,
  `produit_id` INT NOT NULL,
  `nom_produit` VARCHAR(255) NOT NULL COMMENT 'Nom au moment de la commande',
  `prix_unitaire` DECIMAL(10, 2) NOT NULL CHECK (`prix_unitaire` > 0),
  `quantite` INT NOT NULL CHECK (`quantite` >= 1),
  `taille` VARCHAR(20),
  `couleur` VARCHAR(50),
  `sous_total` DECIMAL(10, 2) NOT NULL CHECK (`sous_total` > 0),
  
  FOREIGN KEY (`commande_id`) REFERENCES `commandes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`produit_id`) REFERENCES `produits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_commande_id (`commande_id`),
  INDEX idx_produit_id (`produit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: newsletter
-- ============================================
CREATE TABLE IF NOT EXISTS `newsletter` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `est_actif` BOOLEAN DEFAULT TRUE NOT NULL,
  `date_inscription` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `date_desinscription` DATETIME,
  `source` VARCHAR(50) COMMENT 'homepage, checkout, popup, etc.',
  `preferences` JSON,
  
  UNIQUE KEY unique_email (`email`),
  INDEX idx_est_actif (`est_actif`),
  INDEX idx_date_inscription (`date_inscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================

-- Créer un utilisateur admin par défaut
-- Mot de passe: Admin123 (haché avec bcrypt)
INSERT INTO `users` (`nom`, `prenom`, `email`, `mot_de_passe`, `telephone`, `est_admin`, `est_actif`)
VALUES (
  'Admin',
  'Arseet',
  'admin@arseet.com',
  '$2a$10$XH3zqBfNZQKb9k0XM3WZPujqN8CvPJZ7Q8FPnJqPzMWVP5K0JqLXa',
  '0555123456',
  TRUE,
  TRUE
) ON DUPLICATE KEY UPDATE email=email;

-- Produits exemples
INSERT INTO `produits` (`nom`, `description`, `prix`, `categorie`, `stock`, `est_nouveau`)
VALUES
  ('T-Shirt Classique Homme', 'T-shirt 100% coton, coupe régulière', 1500.00, 'homme', 50, TRUE),
  ('Robe d\'été Femme', 'Robe légère et élégante pour l\'été', 4500.00, 'femme', 30, TRUE),
  ('Pantalon Jean Homme', 'Jean slim fit, haute qualité', 3500.00, 'homme', 40, FALSE),
  ('Sac à main', 'Sac à main en cuir véritable', 6000.00, 'accessoires', 20, TRUE)
ON DUPLICATE KEY UPDATE nom=nom;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
