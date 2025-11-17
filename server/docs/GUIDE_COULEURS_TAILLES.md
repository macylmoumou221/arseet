# 🎨 Guide Complet - Gestion des Couleurs et Tailles

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Lors de la création d'un produit](#lors-de-la-création-dun-produit)
3. [Ajouter des couleurs après création](#ajouter-des-couleurs-après-création)
4. [Ajouter des tailles après création](#ajouter-des-tailles-après-création)
5. [Workflow complet](#workflow-complet)
6. [Exemples pratiques](#exemples-pratiques)

---

## Vue d'ensemble

### ⚠️ **IMPORTANT: Trois méthodes disponibles**

Il existe **TROIS façons** de gérer les couleurs et tailles:

### **Méthode 1: Lors de la création du produit**
✅ Vous pouvez ajouter couleurs et tailles **directement** lors de la création du produit via `POST /api/produits`

### **Méthode 2: Mise à jour complète (remplacement)**
✅ Vous pouvez **remplacer toutes** les couleurs et tailles d'un produit existant via `PUT /api/produits/:id`
- ⚠️ **ATTENTION**: Cela supprime et remplace toutes les couleurs/tailles existantes
- Utile pour une refonte complète du produit

### **Méthode 3: Ajout individuel après création**
✅ Vous créez/mettez à jour le produit, puis vous ajoutez des couleurs et tailles **une par une** via:
- `POST /api/produits/:id/couleurs` (pour ajouter une couleur sans toucher aux autres)
- `POST /api/produits/:id/tailles` (pour ajouter une taille sans toucher aux autres)
- Utile pour ajouter progressivement des variantes

---

## Lors de la création d'un produit

### Créer un produit AVEC couleurs et tailles

**Endpoint:** `POST /api/produits`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (FormData):**

| Champ | Type | Valeur |
|-------|------|--------|
| nom | Text | T-Shirt Premium |
| description | Text | Un t-shirt de qualité |
| prix | Text | 2500 |
| promotion | Text | 20 |
| categorie | Text | homme |
| stock | Text | 100 |
| est_nouveau | Text | true |
| image_avant | File | (image file) |
| **couleurs** | **Text** | `[{"couleur":"Bleu","code_hexa":"#0000FF","stock_couleur":50},{"couleur":"Rouge","code_hexa":"#FF0000","stock_couleur":30}]` |
| **tailles** | **Text** | `[{"taille":"M","stock_taille":40,"mesures":"Longueur: 70cm"},{"taille":"L","stock_taille":60}]` |

**⚠️ IMPORTANT:**
- Les champs `couleurs` et `tailles` doivent être de type **Text** (pas JSON!)
- Le contenu est un **JSON stringifié** (tableau d'objets)

**Exemple de valeur pour `couleurs`:**
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
  }
]
```

**Exemple de valeur pour `tailles`:**
```json
[
  {
    "taille": "M",
    "stock_taille": 40,
    "mesures": "Longueur: 70cm, Largeur: 50cm"
  },
  {
    "taille": "L",
    "stock_taille": 60,
    "mesures": "Longueur: 75cm, Largeur: 55cm"
  }
]
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Produit créé avec succès",
  "data": {
    "id": 5,
    "nom": "T-Shirt Premium",
    "prix": 2500,
    "promotion": 20,
    "prix_final": 2000,
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
      }
    ],
    "tailles": [
      {
        "id": 1,
        "taille": "M",
        "stock_taille": 40,
        "mesures": "Longueur: 70cm, Largeur: 50cm"
      },
      {
        "id": 2,
        "taille": "L",
        "stock_taille": 60,
        "mesures": "Longueur: 75cm, Largeur: 55cm"
      }
    ]
  }
}
```

---

## Mettre à jour couleurs et tailles d'un produit existant

### Remplacer TOUTES les couleurs et tailles (PUT)

**⚠️ ATTENTION:** Cette méthode **supprime et remplace** toutes les couleurs et tailles existantes du produit.

**Endpoint:** `PUT /api/produits/:id`

**Méthode:** PUT  
**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (FormData):**

| Champ | Type | Valeur |
|-------|------|--------|
| couleurs | Text | `[{"couleur":"Vert","code_hexa":"#00FF00","stock_couleur":25},{"couleur":"Jaune","code_hexa":"#FFFF00","stock_couleur":15}]` |
| tailles | Text | `[{"taille":"S","stock_taille":10},{"taille":"XL","stock_taille":20}]` |

**Exemple de requête:**
```bash
curl -X PUT http://localhost:5000/api/produits/5 \
  -H "Authorization: Bearer <admin_token>" \
  -F 'couleurs=[{"couleur":"Vert","code_hexa":"#00FF00","stock_couleur":25},{"couleur":"Jaune","code_hexa":"#FFFF00","stock_couleur":15}]' \
  -F 'tailles=[{"taille":"S","stock_taille":10},{"taille":"XL","stock_taille":20}]'
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Produit mis à jour avec succès",
  "data": {
    "id": 5,
    "nom": "T-Shirt Premium",
    "couleurs": [
      {
        "id": 10,
        "couleur": "Vert",
        "code_hexa": "#00FF00",
        "stock_couleur": 25
      },
      {
        "id": 11,
        "couleur": "Jaune",
        "code_hexa": "#FFFF00",
        "stock_couleur": 15
      }
    ],
    "tailles": [
      {
        "id": 8,
        "taille": "S",
        "stock_taille": 10
      },
      {
        "id": 9,
        "taille": "XL",
        "stock_taille": 20
      }
    ]
  }
}
```

**⚠️ IMPORTANT:**
- Les anciennes couleurs (IDs 1, 2, 3) ont été **supprimées**
- Les anciennes tailles (IDs 1, 2) ont été **supprimées**
- De nouvelles couleurs et tailles ont été créées avec de nouveaux IDs
- Si vous omettez `couleurs` ou `tailles`, ils restent inchangés

**Quand utiliser cette méthode:**
- ✅ Vous voulez refaire complètement les variantes d'un produit
- ✅ Vous avez une nouvelle liste complète de couleurs/tailles
- ❌ Vous voulez juste ajouter une couleur/taille → Utilisez POST (Méthode 3)

---

## Ajouter des couleurs après création

### Ajouter une couleur à un produit existant

**Endpoint:** `POST /api/produits/:id/couleurs`

**Méthode:** POST  
**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "couleur": "Noir",
  "code_hexa": "#000000",
  "stock_couleur": 45
}
```

**Champs:**
- `couleur` (requis): Nom de la couleur
- `code_hexa` (requis): Code hexadécimal (#000000)
- `stock_couleur` (optionnel): Stock pour cette couleur (défaut: 0)

**Exemple de requête:**
```bash
curl -X POST http://localhost:5000/api/produits/5/couleurs \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "couleur": "Noir",
    "code_hexa": "#000000",
    "stock_couleur": 45
  }'
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Couleur ajoutée avec succès",
  "data": {
    "id": 3,
    "produit_id": 5,
    "couleur": "Noir",
    "code_hexa": "#000000",
    "stock_couleur": 45
  }
}
```

---

## Ajouter des tailles après création

### Ajouter une taille à un produit existant

**Endpoint:** `POST /api/produits/:id/tailles`

**Méthode:** POST  
**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "taille": "XL",
  "stock_taille": 35,
  "mesures": "Longueur: 80cm, Largeur: 60cm"
}
```

**Champs:**
- `taille` (requis): Taille (ex: S, M, L, XL, 38, 40, etc.)
- `stock_taille` (optionnel): Stock pour cette taille (défaut: 0)
- `mesures` (optionnel): Dimensions/mesures de cette taille

**Exemple de requête:**
```bash
curl -X POST http://localhost:5000/api/produits/5/tailles \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "taille": "XL",
    "stock_taille": 35,
    "mesures": "Longueur: 80cm, Largeur: 60cm"
  }'
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Taille ajoutée avec succès",
  "data": {
    "id": 3,
    "produit_id": 5,
    "taille": "XL",
    "stock_taille": 35,
    "mesures": "Longueur: 80cm, Largeur: 60cm"
  }
}
```

---

## Workflow complet

### Scénario: Créer un produit puis ajouter couleurs et tailles

#### **Étape 1: Créer le produit de base**

```http
POST /api/produits
Content-Type: multipart/form-data

nom: "Veste d'hiver"
prix: "8500"
categorie: "homme"
stock: "0"
image_avant: (fichier image)
```

**Réponse → ID du produit: 10**

---

#### **Étape 2: Ajouter les couleurs**

**Couleur 1 - Noir:**
```http
POST /api/produits/10/couleurs
Content-Type: application/json

{
  "couleur": "Noir",
  "code_hexa": "#000000",
  "stock_couleur": 20
}
```

**Couleur 2 - Gris:**
```http
POST /api/produits/10/couleurs
Content-Type: application/json

{
  "couleur": "Gris",
  "code_hexa": "#808080",
  "stock_couleur": 15
}
```

**Couleur 3 - Bleu Marine:**
```http
POST /api/produits/10/couleurs
Content-Type: application/json

{
  "couleur": "Bleu Marine",
  "code_hexa": "#001F3F",
  "stock_couleur": 25
}
```

---

#### **Étape 3: Ajouter les tailles**

**Taille M:**
```http
POST /api/produits/10/tailles
Content-Type: application/json

{
  "taille": "M",
  "stock_taille": 20,
  "mesures": "Longueur: 70cm, Largeur: 55cm, Manches: 65cm"
}
```

**Taille L:**
```http
POST /api/produits/10/tailles
Content-Type: application/json

{
  "taille": "L",
  "stock_taille": 25,
  "mesures": "Longueur: 75cm, Largeur: 60cm, Manches: 68cm"
}
```

**Taille XL:**
```http
POST /api/produits/10/tailles
Content-Type: application/json

{
  "taille": "XL",
  "stock_taille": 15,
  "mesures": "Longueur: 80cm, Largeur: 65cm, Manches: 71cm"
}
```

---

#### **Étape 4: Vérifier le produit complet**

```http
GET /api/produits/10
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "nom": "Veste d'hiver",
    "prix": 8500,
    "couleurs": [
      {
        "id": 1,
        "couleur": "Noir",
        "code_hexa": "#000000",
        "stock_couleur": 20
      },
      {
        "id": 2,
        "couleur": "Gris",
        "code_hexa": "#808080",
        "stock_couleur": 15
      },
      {
        "id": 3,
        "couleur": "Bleu Marine",
        "code_hexa": "#001F3F",
        "stock_couleur": 25
      }
    ],
    "tailles": [
      {
        "id": 1,
        "taille": "M",
        "stock_taille": 20,
        "mesures": "Longueur: 70cm, Largeur: 55cm, Manches: 65cm"
      },
      {
        "id": 2,
        "taille": "L",
        "stock_taille": 25,
        "mesures": "Longueur: 75cm, Largeur: 60cm, Manches: 68cm"
      },
      {
        "id": 3,
        "taille": "XL",
        "stock_taille": 15,
        "mesures": "Longueur: 80cm, Largeur: 65cm, Manches: 71cm"
      }
    ]
  }
}
```

---

## Exemples pratiques

### Exemple 1: T-Shirt avec plusieurs couleurs et tailles

#### Méthode A: Tout en une fois lors de la création

**Insomnia/Postman - POST /api/produits**

| Field | Type | Value |
|-------|------|-------|
| nom | Text | T-Shirt Classique |
| prix | Text | 1500 |
| categorie | Text | homme |
| couleurs | Text | `[{"couleur":"Blanc","code_hexa":"#FFFFFF","stock_couleur":30},{"couleur":"Noir","code_hexa":"#000000","stock_couleur":25},{"couleur":"Gris","code_hexa":"#808080","stock_couleur":20}]` |
| tailles | Text | `[{"taille":"S","stock_taille":15},{"taille":"M","stock_taille":30},{"taille":"L","stock_taille":25},{"taille":"XL","stock_taille":5}]` |

#### Méthode B: Étape par étape

1. **Créer le produit:**
```json
POST /api/produits
{
  "nom": "T-Shirt Classique",
  "prix": 1500,
  "categorie": "homme"
}
```

2. **Ajouter 3 couleurs** (3 requêtes):
```json
POST /api/produits/1/couleurs
{"couleur":"Blanc","code_hexa":"#FFFFFF","stock_couleur":30}

POST /api/produits/1/couleurs
{"couleur":"Noir","code_hexa":"#000000","stock_couleur":25}

POST /api/produits/1/couleurs
{"couleur":"Gris","code_hexa":"#808080","stock_couleur":20}
```

3. **Ajouter 4 tailles** (4 requêtes):
```json
POST /api/produits/1/tailles
{"taille":"S","stock_taille":15}

POST /api/produits/1/tailles
{"taille":"M","stock_taille":30}

POST /api/produits/1/tailles
{"taille":"L","stock_taille":25}

POST /api/produits/1/tailles
{"taille":"XL","stock_taille":5}
```

---

### Exemple 2: Chaussures avec tailles numériques

```json
POST /api/produits/15/tailles
{
  "taille": "39",
  "stock_taille": 10,
  "mesures": "25cm"
}

POST /api/produits/15/tailles
{
  "taille": "40",
  "stock_taille": 15,
  "mesures": "25.5cm"
}

POST /api/produits/15/tailles
{
  "taille": "41",
  "stock_taille": 20,
  "mesures": "26cm"
}

POST /api/produits/15/tailles
{
  "taille": "42",
  "stock_taille": 15,
  "mesures": "26.5cm"
}

POST /api/produits/15/tailles
{
  "taille": "43",
  "stock_taille": 10,
  "mesures": "27cm"
}
```

---

## ⚠️ Points importants

### ✅ À faire:
- Utiliser la **Méthode 1** (tout en une fois) pour un workflow rapide
- Utiliser la **Méthode 2** (étape par étape) pour plus de contrôle
- Toujours vérifier le produit après ajout avec `GET /api/produits/:id`

### ❌ À éviter:
- **NE PAS** essayer de mettre à jour couleurs/tailles via `PUT /api/produits/:id`
- **NE PAS** oublier que `couleurs` et `tailles` doivent être de type **Text** en FormData
- **NE PAS** envoyer du JSON non-stringifié pour couleurs/tailles

### 🔑 Format des couleurs:
```json
{
  "couleur": "string (nom de la couleur)",
  "code_hexa": "string (#RRGGBB)",
  "stock_couleur": "number (optionnel, défaut: 0)"
}
```

### 🔑 Format des tailles:
```json
{
  "taille": "string (S, M, L, 38, 40, etc.)",
  "stock_taille": "number (optionnel, défaut: 0)",
  "mesures": "string (optionnel, dimensions)"
}
```

---

## 🎯 Résumé

| Action | Endpoint | Méthode | Effet sur couleurs/tailles | Quand l'utiliser |
|--------|----------|---------|---------------------------|------------------|
| Créer produit avec couleurs/tailles | `/api/produits` | POST | Crée les couleurs/tailles initiales | Création initiale complète |
| **Remplacer toutes couleurs/tailles** | `/api/produits/:id` | **PUT** | **SUPPRIME et REMPLACE** toutes les couleurs/tailles | Refonte complète des variantes |
| Ajouter une couleur | `/api/produits/:id/couleurs` | POST | Ajoute 1 couleur (garde les autres) | Ajout progressif de variantes |
| Ajouter une taille | `/api/produits/:id/tailles` | POST | Ajoute 1 taille (garde les autres) | Ajout progressif de variantes |
| Mettre à jour le produit | `/api/produits/:id` | PUT | Pas d'effet si omis | Mise à jour nom/prix/images/etc. |

**Recommandation:** 
- 🎨 **Méthode 1 (POST)**: Pour créer un nouveau produit complet
- 🔄 **Méthode 2 (PUT)**: Pour remplacer complètement les variantes d'un produit existant
- ➕ **Méthode 3 (POST individuel)**: Pour ajouter des variantes sans toucher aux existantes

**⚠️ ATTENTION avec PUT:**
- Si vous incluez `couleurs` dans PUT → **Toutes** les anciennes couleurs sont supprimées et remplacées
- Si vous incluez `tailles` dans PUT → **Toutes** les anciennes tailles sont supprimées et remplacées
- Si vous **n'incluez pas** `couleurs`/`tailles` → Elles restent inchangées
