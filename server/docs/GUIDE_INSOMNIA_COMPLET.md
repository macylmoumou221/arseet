# 📘 Guide Complet - Tester l'API avec Insomnia

## 🎯 Créer un Produit avec Images, Couleurs et Tailles

### Configuration de la Requête

**Méthode:** POST  
**URL:** `http://localhost:5000/api/produits`  
**Auth:** Bearer Token (Admin)

---

## 📝 Onglet Body - Multipart Form

### 1. Champs Texte Obligatoires

| Name | Type | Value | Note |
|------|------|-------|------|
| nom | Text | T-Shirt Premium | Nom du produit |
| prix | Text | 2500 | Prix en DZD |
| categorie | Text | homme | homme/femme/enfant/accessoires/autre |

### 2. Champs Texte Optionnels

| Name | Type | Value | Note |
|------|------|-------|------|
| description | Text | T-shirt en coton bio de qualité supérieure | Description détaillée |
| prix_promo | Text | 2000 | Prix promotionnel (optionnel) |
| promotion | Text | 15 | Pourcentage de réduction 0-100 |
| stock | Text | 100 | Quantité en stock |
| est_nouveau | Text | true | true/false |
| en_rupture | Text | false | true/false |

### 3. Images (Fichiers)

**Image Avant (Face avant):**
- **Name:** `image_avant`
- **Type:** File
- **Value:** Cliquez "Choose File" → Sélectionnez votre image de face avant

**Image Arrière (Face arrière):**
- **Name:** `image_arriere`
- **Type:** File
- **Value:** Cliquez "Choose File" → Sélectionnez votre image de face arrière

**Images Supplémentaires (max 10):**
- **Name:** `images` (même nom pour chaque fichier)
- **Type:** File
- **Value:** Cliquez "Choose File" → Sélectionnez la 1ère image

Cliquez **+ (Add)** pour ajouter d'autres images:
- **Name:** `images`
- **Type:** File
- **Value:** Sélectionnez la 2ème image

Répétez pour chaque image supplémentaire (max 10).

### 4. Couleurs (JSON en Text) ⭐

**IMPORTANT:** Type doit être **Text**, pas JSON !

- **Name:** `couleurs`
- **Type:** Text
- **Value:** 
```json
[{"couleur":"Bleu","code_hexa":"#0000FF","stock_couleur":50},{"couleur":"Rouge","code_hexa":"#FF0000","stock_couleur":30},{"couleur":"Noir","code_hexa":"#000000","stock_couleur":40}]
```

**Format détaillé (pour copier-coller):**
```json
[
  {
    "couleur": "Bleu",
    "code_hexa": "#0000FF",
    "stock_couleur": 50
  },
  {
    "couleur": "Rouge",
    "code_hexa": "#FF0000",
    "stock_couleur": 30
  },
  {
    "couleur": "Noir",
    "code_hexa": "#000000",
    "stock_couleur": 40
  }
]
```

⚠️ **Mais collez-le en une seule ligne dans Insomnia !**

### 5. Tailles (JSON en Text) ⭐

**IMPORTANT:** Type doit être **Text**, pas JSON !

- **Name:** `tailles`
- **Type:** Text
- **Value:**
```json
[{"taille":"S","stock_taille":20,"mesures":"Longueur: 65cm, Largeur: 45cm"},{"taille":"M","stock_taille":30,"mesures":"Longueur: 70cm, Largeur: 50cm"},{"taille":"L","stock_taille":25,"mesures":"Longueur: 75cm, Largeur: 55cm"}]
```

**Format détaillé (pour copier-coller):**
```json
[
  {
    "taille": "S",
    "stock_taille": 20,
    "mesures": "Longueur: 65cm, Largeur: 45cm"
  },
  {
    "taille": "M",
    "stock_taille": 30,
    "mesures": "Longueur: 70cm, Largeur: 50cm"
  },
  {
    "taille": "L",
    "stock_taille": 25,
    "mesures": "Longueur: 75cm, Largeur: 55cm"
  }
]
```

⚠️ **Mais collez-le en une seule ligne dans Insomnia !**

---

## 📸 Exemple Visuel de Configuration Insomnia

```
Body (Multipart Form)
┌────────────────────────────────────────────────────────────────┐
│ ✓ nom              [Text]   T-Shirt Premium                    │
│ ✓ description      [Text]   T-shirt en coton bio...            │
│ ✓ prix             [Text]   2500                               │
│ ✓ promotion        [Text]   15                                 │
│ ✓ categorie        [Text]   homme                              │
│ ✓ stock            [Text]   100                                │
│ ✓ est_nouveau      [Text]   true                               │
│ ✓ image_avant      [File]   📄 front.jpg                       │
│ ✓ image_arriere    [File]   📄 back.jpg                        │
│ ✓ images           [File]   📄 detail1.jpg                     │
│ ✓ images           [File]   📄 detail2.jpg                     │
│ ✓ couleurs         [Text]   [{"couleur":"Bleu",...}]           │
│ ✓ tailles          [Text]   [{"taille":"M",...}]               │
└────────────────────────────────────────────────────────────────┘
```

---

## ✅ Réponse Attendue

```json
{
  "success": true,
  "message": "Produit créé avec succès",
  "data": {
    "id": 1,
    "nom": "T-Shirt Premium",
    "description": "T-shirt en coton bio de qualité supérieure",
    "prix": 2500.00,
    "promotion": 15,
    "categorie": "homme",
    "stock": 100,
    "image_avant": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/front.jpg",
    "image_arriere": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/back.jpg",
    "images": [
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detail1.jpg",
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detail2.jpg"
    ],
    "couleurs": [
      {
        "id": 1,
        "couleur": "Bleu",
        "code_hexa": "#0000FF",
        "stock_couleur": 50
      },
      {
        "id": 2,
        "couleur": "Rouge",
        "code_hexa": "#FF0000",
        "stock_couleur": 30
      },
      {
        "id": 3,
        "couleur": "Noir",
        "code_hexa": "#000000",
        "stock_couleur": 40
      }
    ],
    "tailles": [
      {
        "id": 1,
        "taille": "S",
        "stock_taille": 20,
        "mesures": "Longueur: 65cm, Largeur: 45cm"
      },
      {
        "id": 2,
        "taille": "M",
        "stock_taille": 30,
        "mesures": "Longueur: 70cm, Largeur: 50cm"
      },
      {
        "id": 3,
        "taille": "L",
        "stock_taille": 25,
        "mesures": "Longueur: 75cm, Largeur: 55cm"
      }
    ],
    "date_creation": "2024-11-07T10:30:00.000Z",
    "date_mise_a_jour": "2024-11-07T10:30:00.000Z"
  }
}
```

---

## ⚠️ Erreurs Courantes et Solutions

### Erreur 1: Couleurs/Tailles non ajoutées
**Problème:** Type JSON sélectionné au lieu de Text  
**Solution:** Utilisez Type **Text** et collez le JSON en une seule ligne

### Erreur 2: "Unexpected field"
**Problème:** Nom de champ incorrect  
**Solution:** Vérifiez les noms exacts: `image_avant`, `image_arriere`, `images`, `couleurs`, `tailles`

### Erreur 3: "Invalid JSON"
**Problème:** JSON mal formaté dans couleurs/tailles  
**Solution:** Validez votre JSON sur jsonlint.com avant de coller

### Erreur 4: Images multiples ne s'ajoutent pas
**Problème:** Nom différent pour chaque image  
**Solution:** Utilisez le même nom `images` pour toutes les images supplémentaires

---

## 🔄 Mettre à Jour un Produit (PUT)

**Méthode:** PUT  
**URL:** `http://localhost:5000/api/produits/1`  
**Auth:** Bearer Token (Admin)

**Même configuration que POST**, sauf que:
- Tous les champs sont optionnels
- Seuls les champs fournis seront mis à jour
- Les images non fournies ne seront pas supprimées (sauf si vous en uploadez de nouvelles)

---

## 🎨 Exemples de Couleurs Courantes

```json
[
  {"couleur":"Blanc","code_hexa":"#FFFFFF","stock_couleur":50},
  {"couleur":"Noir","code_hexa":"#000000","stock_couleur":40},
  {"couleur":"Gris","code_hexa":"#808080","stock_couleur":30},
  {"couleur":"Bleu Marine","code_hexa":"#000080","stock_couleur":25},
  {"couleur":"Rouge","code_hexa":"#FF0000","stock_couleur":20},
  {"couleur":"Vert","code_hexa":"#008000","stock_couleur":15},
  {"couleur":"Rose","code_hexa":"#FFC0CB","stock_couleur":10}
]
```

## 📏 Exemples de Tailles par Catégorie

### Vêtements Homme/Femme
```json
[
  {"taille":"XS","stock_taille":10,"mesures":"Tour de poitrine: 80-85cm"},
  {"taille":"S","stock_taille":20,"mesures":"Tour de poitrine: 85-90cm"},
  {"taille":"M","stock_taille":30,"mesures":"Tour de poitrine: 90-95cm"},
  {"taille":"L","stock_taille":25,"mesures":"Tour de poitrine: 95-100cm"},
  {"taille":"XL","stock_taille":15,"mesures":"Tour de poitrine: 100-105cm"},
  {"taille":"XXL","stock_taille":10,"mesures":"Tour de poitrine: 105-110cm"}
]
```

### Chaussures
```json
[
  {"taille":"38","stock_taille":10,"mesures":"24.5cm"},
  {"taille":"39","stock_taille":15,"mesures":"25cm"},
  {"taille":"40","stock_taille":20,"mesures":"25.5cm"},
  {"taille":"41","stock_taille":20,"mesures":"26cm"},
  {"taille":"42","stock_taille":15,"mesures":"26.5cm"},
  {"taille":"43","stock_taille":10,"mesures":"27cm"}
]
```

### Accessoires (Taille Unique)
```json
[
  {"taille":"Unique","stock_taille":50,"mesures":"Taille standard ajustable"}
]
```

---

## 🧪 Test Complet - Checklist

- [ ] Token admin configuré dans Auth
- [ ] Champ `nom` rempli (Text)
- [ ] Champ `prix` rempli (Text, nombre)
- [ ] Champ `categorie` rempli (Text: homme/femme/enfant/accessoires/autre)
- [ ] `image_avant` uploadée (File)
- [ ] `image_arriere` uploadée (File)
- [ ] `images` uploadées si nécessaire (File, même nom pour chaque)
- [ ] `couleurs` en format JSON string (Text, pas JSON)
- [ ] `tailles` en format JSON string (Text, pas JSON)
- [ ] Cliquer sur **Send**
- [ ] Vérifier la réponse 201 avec produit complet

---

## 💡 Astuce Pro

Pour éviter de retaper le JSON à chaque fois:
1. Créez un fichier `test-data.txt` avec vos JSON pré-formatés
2. Copiez-collez rapidement dans Insomnia
3. Utilisez Insomnia Environments pour stocker des valeurs réutilisables

---

**Guide créé le:** 7 Novembre 2024  
**Testé avec:** Insomnia 2023.x, Node.js 18.x
