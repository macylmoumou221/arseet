# 🗺️ Guide des Wilayas - Système ENUM

## 📋 Vue d'ensemble

Le champ `wilaya` dans la table `commandes` utilise maintenant un **ENUM** avec les **58 wilayas d'Algérie** (incluant les 10 nouvelles wilayas ajoutées en 2019).

---

## 🇩🇿 Liste Complète des 58 Wilayas

### Wilayas 1-48 (Originales)

| Code | Wilaya | Capitale |
|------|--------|----------|
| 01 | Adrar | Adrar |
| 02 | Chlef | Chlef |
| 03 | Laghouat | Laghouat |
| 04 | Oum El Bouaghi | Oum El Bouaghi |
| 05 | Batna | Batna |
| 06 | Béjaïa | Béjaïa |
| 07 | Biskra | Biskra |
| 08 | Béchar | Béchar |
| 09 | Blida | Blida |
| 10 | Bouira | Bouira |
| 11 | Tamanrasset | Tamanrasset |
| 12 | Tébessa | Tébessa |
| 13 | Tlemcen | Tlemcen |
| 14 | Tiaret | Tiaret |
| 15 | Tizi Ouzou | Tizi Ouzou |
| 16 | **Alger** | Alger |
| 17 | Djelfa | Djelfa |
| 18 | Jijel | Jijel |
| 19 | Sétif | Sétif |
| 20 | Saïda | Saïda |
| 21 | Skikda | Skikda |
| 22 | Sidi Bel Abbès | Sidi Bel Abbès |
| 23 | Annaba | Annaba |
| 24 | Guelma | Guelma |
| 25 | Constantine | Constantine |
| 26 | Médéa | Médéa |
| 27 | Mostaganem | Mostaganem |
| 28 | M'Sila | M'Sila |
| 29 | Mascara | Mascara |
| 30 | Ouargla | Ouargla |
| 31 | **Oran** | Oran |
| 32 | El Bayadh | El Bayadh |
| 33 | Illizi | Illizi |
| 34 | Bordj Bou Arréridj | Bordj Bou Arréridj |
| 35 | Boumerdès | Boumerdès |
| 36 | El Tarf | El Tarf |
| 37 | Tindouf | Tindouf |
| 38 | Tissemsilt | Tissemsilt |
| 39 | El Oued | El Oued |
| 40 | Khenchela | Khenchela |
| 41 | Souk Ahras | Souk Ahras |
| 42 | Tipaza | Tipaza |
| 43 | Mila | Mila |
| 44 | Aïn Defla | Aïn Defla |
| 45 | Naâma | Naâma |
| 46 | Aïn Témouchent | Aïn Témouchent |
| 47 | Ghardaïa | Ghardaïa |
| 48 | Relizane | Relizane |

### 🆕 Wilayas 49-58 (Ajoutées en 2019)

| Code | Wilaya | Capitale |
|------|--------|----------|
| 49 | Timimoun | Timimoun |
| 50 | Bordj Badji Mokhtar | Bordj Badji Mokhtar |
| 51 | Ouled Djellal | Ouled Djellal |
| 52 | Béni Abbès | Béni Abbès |
| 53 | In Salah | In Salah |
| 54 | In Guezzam | In Guezzam |
| 55 | Touggourt | Touggourt |
| 56 | Djanet | Djanet |
| 57 | El M'Ghair | El M'Ghair |
| 58 | El Meniaa | El Meniaa |

---

## 🔄 Migration Base de Données

### Exécuter la migration

```bash
mysql -u root -p arseet_db < scripts/add_wilayas_enum.sql
```

### Script SQL

```sql
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
```

---

## 🌐 Nouveaux Endpoints API

### 1. Liste complète des wilayas

```http
GET /api/utils/wilayas
```

**Réponse:**
```json
{
  "success": true,
  "message": "Liste des wilayas récupérée avec succès",
  "data": {
    "total": 58,
    "wilayas": [
      {
        "code": "01",
        "nom": "Adrar",
        "capitale": "Adrar"
      },
      {
        "code": "16",
        "nom": "Alger",
        "capitale": "Alger"
      },
      ...
    ]
  }
}
```

### 2. Wilaya par code

```http
GET /api/utils/wilayas/16
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "code": "16",
    "nom": "Alger",
    "capitale": "Alger"
  }
}
```

### 3. Recherche par nom

```http
GET /api/utils/wilayas/search/Oran
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "code": "31",
    "nom": "Oran",
    "capitale": "Oran"
  }
}
```

---

## 💻 Utilisation dans le Code

### Importer les constantes

```javascript
const { 
  WILAYAS_ENUM, 
  WILAYAS_COMPLETE, 
  isValidWilaya,
  getWilayaByCode,
  getWilayaByNom 
} = require('../constants/wilayas');
```

### Valider une wilaya

```javascript
const wilaya = req.body.wilaya;

if (!isValidWilaya(wilaya)) {
  return res.status(400).json({
    success: false,
    message: 'Wilaya invalide'
  });
}
```

### Obtenir les informations

```javascript
// Par code
const wilayaInfo = getWilayaByCode('16'); // Alger

// Par nom
const wilayaInfo = getWilayaByNom('Oran');

console.log(wilayaInfo);
// { code: '31', nom: 'Oran', capitale: 'Oran' }
```

---

## 🧪 Tests avec Insomnia

### 1. Créer une commande avec wilaya

```http
POST http://localhost:5000/api/commandes
Content-Type: application/json

{
  "nom_complet": "Ahmed Benali",
  "email": "ahmed@example.com",
  "telephone": "0555123456",
  "adresse_livraison": "Rue de la République, Bâtiment A",
  "ville": "Alger Centre",
  "wilaya": "Alger",
  "methode_livraison": "domicile",
  "articles": [
    {
      "produit_id": 1,
      "quantite": 2,
      "prix_unitaire": 2500
    }
  ]
}
```

### 2. Wilaya invalide (erreur attendue)

```http
POST http://localhost:5000/api/commandes
Content-Type: application/json

{
  ...
  "wilaya": "Paris"  // ❌ Invalide
}
```

**Réponse:**
```json
{
  "success": false,
  "message": "Wilaya invalide. Valeurs acceptées: Adrar, Chlef, Laghouat, ..."
}
```

### 3. Récupérer toutes les wilayas

```http
GET http://localhost:5000/api/utils/wilayas
```

---

## 📱 Frontend - Exemple de Dropdown

### React/Next.js

```jsx
import { useEffect, useState } from 'react';

function WilayaSelect() {
  const [wilayas, setWilayas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/utils/wilayas')
      .then(res => res.json())
      .then(data => setWilayas(data.data.wilayas));
  }, []);

  return (
    <select name="wilaya" required>
      <option value="">Choisir une wilaya</option>
      {wilayas.map(w => (
        <option key={w.code} value={w.nom}>
          {w.code} - {w.nom}
        </option>
      ))}
    </select>
  );
}
```

### HTML Pur

```html
<select id="wilaya" name="wilaya" required>
  <option value="">Sélectionner une wilaya</option>
  <option value="Adrar">01 - Adrar</option>
  <option value="Chlef">02 - Chlef</option>
  <option value="Laghouat">03 - Laghouat</option>
  <!-- ... -->
  <option value="Alger">16 - Alger</option>
  <!-- ... -->
  <option value="Oran">31 - Oran</option>
  <!-- ... -->
</select>
```

---

## ⚠️ Cas Spéciaux

### Wilayas avec apostrophes

Deux wilayas contiennent des apostrophes:

- **M'Sila** (code 28)
- **El M'Ghair** (code 57)

**Important:** Utiliser le nom exact avec l'apostrophe:
```json
{
  "wilaya": "M'Sila"  // ✅ Correct
}
```

❌ **Ne pas faire:**
```json
{
  "wilaya": "MSila"   // ❌ Invalide
  "wilaya": "M`Sila"  // ❌ Invalide
  "wilaya": "M Sila"  // ❌ Invalide
}
```

---

## 🔧 Validation Sequelize

Le modèle Commande valide automatiquement:

```javascript
wilaya: {
  type: DataTypes.ENUM(
    'Adrar', 'Chlef', 'Laghouat', ...
  ),
  allowNull: false,
  validate: {
    notEmpty: {
      msg: 'La wilaya est requise'
    }
  }
}
```

---

## 📊 Statistiques par Wilaya

### Requête SQL

```sql
-- Nombre de commandes par wilaya
SELECT wilaya, COUNT(*) as nombre_commandes 
FROM commandes 
GROUP BY wilaya 
ORDER BY nombre_commandes DESC;

-- Top 10 wilayas
SELECT wilaya, COUNT(*) as total, SUM(total) as chiffre_affaires
FROM commandes 
WHERE statut != 'annulee'
GROUP BY wilaya 
ORDER BY total DESC 
LIMIT 10;
```

---

## 🚀 Avantages de l'ENUM

✅ **Validation automatique** : Impossible d'insérer une wilaya invalide
✅ **Performance** : ENUM stocké comme INTEGER (plus rapide)
✅ **Intégrité des données** : Garantit la cohérence
✅ **Typo-proof** : Élimine les fautes de frappe
✅ **Dropdown facile** : Liste prédéfinie pour le frontend
✅ **Indexation** : Requêtes plus rapides

---

## 📝 Checklist de Migration

- [ ] Backup de la base de données
- [ ] Vérifier les données existantes dans `wilaya`
- [ ] Corriger les wilayas invalides si nécessaire
- [ ] Exécuter le script SQL de migration
- [ ] Vérifier la structure de la table
- [ ] Redémarrer le serveur Node.js
- [ ] Tester la création de commande
- [ ] Tester l'endpoint `/api/utils/wilayas`
- [ ] Mettre à jour le frontend avec le dropdown
- [ ] Tester avec toutes les wilayas (spécialement M'Sila et El M'Ghair)

---

## 🐛 Troubleshooting

### Erreur: "Data truncated for column 'wilaya'"

**Cause:** Des données existantes ne correspondent pas aux valeurs ENUM

**Solution:**
```sql
-- Vérifier les wilayas non conformes
SELECT DISTINCT wilaya FROM commandes;

-- Corriger manuellement si nécessaire
UPDATE commandes SET wilaya = 'Alger' WHERE wilaya = 'alger';
UPDATE commandes SET wilaya = 'Oran' WHERE wilaya = 'ORAN';
```

### Erreur: "Invalid value for ENUM"

**Cause:** Tentative d'insertion d'une wilaya non listée

**Solution:** Vérifier que le nom est exactement comme dans l'ENUM (sensible à la casse)

---

## 📚 Fichiers Modifiés

✅ `models/commande.js` - ENUM wilaya
✅ `constants/wilayas.js` - Liste complète + fonctions utilitaires
✅ `routes/utilsRoutes.js` - Endpoints pour wilayas
✅ `server.js` - Import de utilsRoutes
✅ `scripts/add_wilayas_enum.sql` - Migration SQL
✅ `ENDPOINTS_LIST.txt` - Documentation endpoints

---

**Date:** 2025-11-07  
**Total Wilayas:** 58 (48 originales + 10 nouvelles en 2019)  
**Status:** ✅ Prêt pour déploiement
