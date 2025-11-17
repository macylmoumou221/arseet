# 🔧 Guide de Migration - Suppression des Colonnes Inutiles

## Date de Migration
**7 Novembre 2024**

## Objectif
Supprimer les colonnes inutiles de la table `produits`:
- `marque`
- `matiere`
- `poids`

## 📋 Étapes de Migration

### Option 1: Via MySQL Workbench (Recommandé)

1. **Ouvrir MySQL Workbench**
2. **Se connecter à votre base de données**
3. **Ouvrir l'onglet Query**
4. **Copier et exécuter le script suivant:**

```sql
-- Sélectionner la base de données
USE arseet_ecommerce;

-- Afficher la structure actuelle (optionnel)
DESCRIBE produits;

-- Supprimer les colonnes inutiles
ALTER TABLE produits
DROP COLUMN marque,
DROP COLUMN matiere,
DROP COLUMN poids;

-- Vérifier la nouvelle structure
DESCRIBE produits;
```

5. **Cliquer sur le bouton Execute (⚡) ou appuyer sur Ctrl+Shift+Enter**
6. **Vérifier que les colonnes ont bien été supprimées**

### Option 2: Via le terminal MySQL

```bash
# Se connecter à MySQL
mysql -u root -p

# Utiliser la base de données
USE arseet_ecommerce;

# Exécuter la migration
ALTER TABLE produits
DROP COLUMN marque,
DROP COLUMN matiere,
DROP COLUMN poids;

# Vérifier
DESCRIBE produits;

# Quitter
EXIT;
```

### Option 3: Via le script SQL fourni

```bash
# Dans le terminal, naviguer vers le dossier scripts
cd c:\Users\HP\OneDrive\Bureau\WORK\arseet\server\scripts

# Exécuter le script
mysql -u root -p arseet_ecommerce < remove_unused_columns.sql
```

## ✅ Vérification

Après la migration, la table `produits` devrait avoir cette structure:

```
+--------------------+--------------+------+-----+---------+----------------+
| Field              | Type         | Null | Key | Default | Extra          |
+--------------------+--------------+------+-----+---------+----------------+
| id                 | int          | NO   | PRI | NULL    | auto_increment |
| nom                | varchar(255) | NO   |     | NULL    |                |
| description        | text         | YES  |     | NULL    |                |
| prix               | decimal(10,2)| NO   |     | NULL    |                |
| prix_promo         | decimal(10,2)| YES  |     | NULL    |                |
| promotion          | int          | NO   |     | 0       |                |
| categorie          | varchar(100) | NO   | MUL | NULL    |                |
| image_avant        | varchar(500) | YES  |     | NULL    |                |
| image_arriere      | varchar(500) | YES  |     | NULL    |                |
| images             | json         | YES  |     | NULL    |                |
| stock              | int          | NO   |     | 0       |                |
| en_rupture         | tinyint(1)   | NO   | MUL | 0       |                |
| est_nouveau        | tinyint(1)   | NO   | MUL | 0       |                |
| date_creation      | datetime     | NO   |     | NOW()   |                |
| date_mise_a_jour   | datetime     | NO   |     | NOW()   |                |
+--------------------+--------------+------+-----+---------+----------------+
```

**Colonnes supprimées avec succès:**
- ✅ marque
- ✅ matiere
- ✅ poids

## ⚠️ Points Importants

1. **Backup**: Bien que ces colonnes soient inutiles, assurez-vous d'avoir une sauvegarde de votre base de données avant la migration
2. **Données existantes**: Si des produits avaient des valeurs dans ces colonnes, elles seront définitivement perdues
3. **Pas de retour en arrière**: Cette opération est irréversible

## 🔄 Rollback (En cas de problème)

Si vous devez restaurer ces colonnes (déconseillé):

```sql
ALTER TABLE produits
ADD COLUMN marque VARCHAR(100) NULL AFTER est_nouveau,
ADD COLUMN matiere VARCHAR(100) NULL AFTER marque,
ADD COLUMN poids DECIMAL(10,2) NULL AFTER matiere COMMENT 'Poids en grammes';
```

## 📝 Modifications du Code

Les fichiers suivants ont été mis à jour:

1. ✅ `models/produit.js` - Suppression des champs marque, matiere, poids
2. ✅ `controllers/produitsController.js` - Retrait des champs dans createProduit et updateProduit
3. ✅ `controllers/produitsController.js` - Retrait de marque dans la recherche
4. ✅ `API_DOCUMENTATION.md` - Documentation mise à jour
5. ✅ `ENDPOINTS_LIST.txt` - Liste des endpoints mise à jour

## 🚀 Après la Migration

1. **Redémarrer le serveur Node.js**:
   ```bash
   # Arrêter le serveur (Ctrl+C)
   # Redémarrer
   npm run dev
   ```

2. **Tester les endpoints**:
   - Créer un nouveau produit
   - Mettre à jour un produit existant
   - Récupérer la liste des produits

3. **Vérifier que tout fonctionne correctement**

## 📞 Support

En cas de problème, vérifiez:
- Que vous êtes connecté à la bonne base de données
- Que vous avez les permissions nécessaires
- Que le nom de la table est correct (`produits`)
- Les logs du serveur Node.js

---

**Migration créée le:** 7 Novembre 2024  
**Status:** ✅ Prêt à exécuter
