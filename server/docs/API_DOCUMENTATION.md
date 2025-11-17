# 📚 Documentation API - Arseet E-commerce

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans le header:
```
Authorization: Bearer <votre_token_jwt>
```

---

## 📋 Endpoints

### 1. AUTHENTIFICATION (`/api/auth`)

#### Inscription
```http
POST /api/auth/inscription
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "mot_de_passe": "MotDePasse123",
  "telephone": "0555123456"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Inscription réussie. Un code de vérification à 8 chiffres a été envoyé à votre adresse email.",
  "data": {
    "user": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com",
      "est_admin": false,
      "email_verifie": false
    },
    "requiresEmailVerification": true
  }
}
```

**Note:** L'utilisateur doit vérifier son email avec le code à 8 chiffres avant de pouvoir se connecter. Un email avec le code est envoyé automatiquement. Le code expire après 15 minutes.

#### Vérification d'email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "code": "12345678"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Email vérifié avec succès ! Vous êtes maintenant connecté.",
  "data": {
    "user": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com",
      "email_verifie": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Renvoyer le code de vérification
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "jean.dupont@example.com"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Un nouveau code de vérification à 8 chiffres a été envoyé par email"
}
```

#### Mot de passe — Demander une réinitialisation
```http
POST /api/auth/password/forgot
Content-Type: application/json

{
  "email": "jean.dupont@example.com"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Si un compte existe pour cet email, un code de réinitialisation a été envoyé."
}
```

> Le message est volontairement générique pour éviter de révéler si l'adresse est enregistrée.

#### Mot de passe — Réinitialiser avec le code reçu
```http
POST /api/auth/password/reset
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "code": "12345678",
  "mot_de_passe": "NouveauMot2Passe"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Mot de passe mis à jour avec succès"
}
```

**Notes :**
- Le code envoyé par email expire après 60 minutes (configurable via l'environnement `RESET_PASSWORD_CODE_EXPIRATION_MINUTES`).
- Le formulaire frontend doit demander l'email, le code à 8 chiffres et le nouveau mot de passe.

#### Connexion
```http
POST /api/auth/connexion
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "mot_de_passe": "MotDePasse123"
}
```

**Note:** L'email doit être vérifié pour pouvoir se connecter. Si l'email n'est pas vérifié, une erreur 403 sera retournée.

#### Profil (GET)
```http
GET /api/auth/profil
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "0555123456",
    "adresse": "123 Rue Example",
    "ville": "Alger",
    "code_postal": "16000",
    "est_admin": false,
    "date_creation": "2025-01-15T10:00:00.000Z",
    "derniere_connexion": "2025-01-15T14:30:00.000Z",
    "est_abonne_newsletter": true
  }
}
```

**Note:** Le champ `est_abonne_newsletter` indique si l'utilisateur est actuellement abonné à la newsletter (basé sur son email).

#### Profil (PUT)
```http
PUT /api/auth/profil
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Nouveau Nom",
  "telephone": "0666777888"
}
```

---

### 2. PRODUITS (`/api/produits`)

#### Liste des produits
```http
GET /api/produits?page=1&limit=12&categorie=homme&nouveaute=true
```

**Paramètres query:**
- `page` (optionnel): Numéro de page (défaut: 1)
- `limit` (optionnel): Éléments par page (défaut: 12)
- `categorie` (optionnel): homme, femme, enfant, accessoires, autre
- `nouveaute` (optionnel): true pour filtrer les nouveautés
- `search` (optionnel): Recherche textuelle
- `prix_min` (optionnel): Prix minimum
- `prix_max` (optionnel): Prix maximum

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "produits": [
      {
        "id": 1,
        "nom": "T-Shirt Classique",
        "prix": 1500.00,
        "promotion": 20,
        "prix_final": 1200.00,
        "categorie": "homme",
        "image_avant": "https://cloudinary.com/front.jpg",
        "image_arriere": "https://cloudinary.com/back.jpg",
        "images": ["https://cloudinary.com/detail1.jpg", "https://cloudinary.com/detail2.jpg"],
        "couleurs": [...],
        "tailles": [...]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5,
      "limit": 12
    }
  }
}
```

#### Produit par ID
```http
GET /api/produits/:id
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "T-Shirt Classique",
    "description": "Description complète du produit",
    "prix": 1500.00,
    "prix_promo": null,
    "promotion": 20,
    "prix_final": 1200.00,
    "categorie": "homme",
    "stock": 50,
    "en_rupture": false,
    "est_nouveau": true,
    "image_avant": "https://cloudinary.com/front.jpg",
    "image_arriere": "https://cloudinary.com/back.jpg",
    "images": ["https://cloudinary.com/detail1.jpg", "https://cloudinary.com/detail2.jpg"],
    "couleurs": [
      {
        "couleur": "Bleu",
        "code_hexa": "#0000FF",
        "stock_couleur": 50
      }
    ],
    "tailles": [
      {
        "taille": "M",
        "stock_taille": 30
      }
    ],
    "date_creation": "2025-01-15T10:30:00.000Z"
  }
}
```

**Note:** Endpoint public, aucune authentification requise. Retourne tous les détails du produit incluant couleurs, tailles et images.

#### Créer un produit (Admin)
```http
POST /api/produits
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "nom": "Nouveau Produit",
  "description": "Description du produit",
  "prix": 2500.00,
  "promotion": 15,
  "categorie": "homme",
  "stock": 100,
  "est_nouveau": true,
  "image_avant": <fichier>,        // Image principale (face avant)
  "image_arriere": <fichier>,      // Image face arrière
  "images": [<fichier1>, <fichier2>], // Images supplémentaires (max 10)
  "couleurs": [
    {"couleur": "Bleu", "code_hexa": "#0000FF", "stock_couleur": 50},
    {"couleur": "Rouge", "code_hexa": "#FF0000", "stock_couleur": 50}
  ],
  "tailles": [
    {"taille": "M", "stock_taille": 30},
    {"taille": "L", "stock_taille": 40}
  ]
}
```

**Newsletter automatique:**
⚠️ Lorsqu'un nouveau produit est créé, une newsletter est automatiquement envoyée à tous les abonnés actifs. Cette opération est non-bloquante : même si l'envoi des emails échoue, le produit sera créé avec succès.

**Champs du produit:**
- `nom` (requis): Nom du produit
- `description` (optionnel): Description détaillée
- `prix` (requis): Prix en DZD (> 0)
- `prix_promo` (optionnel): Prix promotionnel
- `promotion` (optionnel): Pourcentage de réduction (0-100)
- `categorie` (requis): homme, femme, enfant, accessoires, autre
- `stock` (optionnel): Quantité en stock (défaut: 0)
- `en_rupture` (optionnel): Boolean (défaut: false)
- `est_nouveau` (optionnel): Boolean (défaut: false)

**Champs images:**
- `image_avant`: Image principale du produit (face avant) - 1 fichier
- `image_arriere`: Image arrière du produit (face arrière) - 1 fichier
- `images`: Tableau d'images supplémentaires (autres angles, détails) - max 10 fichiers
- Les trois champs sont optionnels mais recommandés pour une meilleure présentation

**Champs couleurs et tailles (JSON en string):**
- `couleurs`: String JSON - `[{"couleur":"Bleu","code_hexa":"#0000FF","stock_couleur":50}]`
- `tailles`: String JSON - `[{"taille":"M","stock_taille":30,"mesures":"Longueur: 70cm"}]`

**Important pour Insomnia/Postman:** 
Quand vous utilisez `multipart/form-data`, les champs `couleurs` et `tailles` doivent être envoyés en tant que **Text** (pas JSON) avec le contenu JSON stringifié.

**Exemple:**
- Name: `couleurs`
- Type: **Text**
- Value: `[{"couleur":"Bleu","code_hexa":"#0000FF","stock_couleur":50},{"couleur":"Rouge","code_hexa":"#FF0000","stock_couleur":50}]`

#### Mettre à jour un produit (Admin)
```http
PUT /api/produits/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "nom": "Nouveau Produit",
  "description": "Description du produit",
  "prix": 2500.00,
  "promotion": 15,
  "categorie": "homme",
  "stock": 100,
  "est_nouveau": true,
  "image_avant": <fichier>,        // Image principale (face avant)
  "image_arriere": <fichier>,      // Image face arrière
  "images": [<fichier1>, <fichier2>], // Images supplémentaires (max 10)
  "couleurs": [
    {"couleur": "Bleu", "code_hexa": "#0000FF", "stock_couleur": 50},
    {"couleur": "Rouge", "code_hexa": "#FF0000", "stock_couleur": 50}
  ],
  "tailles": [
    {"taille": "M", "stock_taille": 30},
    {"taille": "L", "stock_taille": 40}
  ]
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Produit mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "T-Shirt Premium",
    "prix": 2000.00,
    "promotion": 25,
    "prix_final": 1500.00,
    "stock": 150,
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
        "stock_couleur": 50
      }
    ],
    "tailles": [
      {
        "id": 1,
        "taille": "M",
        "stock_taille": 30
      },
      {
        "id": 2,
        "taille": "L",
        "stock_taille": 40
      }
    ]
  }
}
```

**Notes importantes:**
- **Mise à jour partielle autorisée**: Envoyez uniquement les champs que vous souhaitez modifier
- **Images**: Les nouvelles images remplacent les anciennes (les anciennes sont automatiquement supprimées de Cloudinary)
- **Prix final**: Recalculé automatiquement si vous modifiez `prix` ou `promotion`
- **Couleurs/Tailles**: Remplacent **complètement** les anciennes valeurs (pas de fusion - les anciennes sont supprimées)
- **Format couleurs/tailles**: Même format que pour la création - JSON stringifié en Text pour multipart/form-data

**Exemple de mise à jour simple (sans images):**
```javascript
// FormData
const formData = new FormData();
formData.append('nom', 'T-Shirt Updated');
formData.append('prix', '2000');
formData.append('promotion', '25');
formData.append('stock', '150');

fetch('http://localhost:5000/api/produits/1', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: formData
});
```

**Exemple avec mise à jour d'images:**
```javascript
const formData = new FormData();
formData.append('nom', 'Nouveau nom');
formData.append('image_avant', imageFileInput.files[0]);
formData.append('images', detailImage1.files[0]);
formData.append('images', detailImage2.files[0]);
```

**Exemple avec couleurs/tailles (remplacement complet):**
```javascript
const formData = new FormData();

// Mise à jour des couleurs - REMPLACE toutes les couleurs existantes
const couleurs = JSON.stringify([
  {"couleur": "Rouge", "code_hexa": "#FF0000", "stock_couleur": 40},
  {"couleur": "Noir", "code_hexa": "#000000", "stock_couleur": 30}
]);
formData.append('couleurs', couleurs);

// Mise à jour des tailles - REMPLACE toutes les tailles existantes
const tailles = JSON.stringify([
  {"taille": "S", "stock_taille": 20, "mesures": "Longueur: 68cm"},
  {"taille": "M", "stock_taille": 30, "mesures": "Longueur: 70cm"},
  {"taille": "L", "stock_taille": 25, "mesures": "Longueur: 72cm"}
]);
formData.append('tailles', tailles);

fetch('http://localhost:5000/api/produits/1', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: formData
});
```

**⚠️ IMPORTANT:**
- Si vous envoyez `couleurs`, **toutes** les anciennes couleurs sont supprimées et remplacées
- Si vous envoyez `tailles`, **toutes** les anciennes tailles sont supprimées et remplacées
- Si vous **ne** envoyez **pas** `couleurs` ou `tailles`, elles restent inchangées
- Pour ajouter une seule couleur/taille sans tout remplacer, utilisez les endpoints dédiés:
  - `POST /api/produits/:id/couleurs` - Ajouter une couleur
  - `POST /api/produits/:id/tailles` - Ajouter une taille

#### Supprimer un produit (Admin)
```http
DELETE /api/produits/:id
Authorization: Bearer <admin_token>
```

#### Marquer en rupture (Admin)
```http
PATCH /api/produits/:id/rupture
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "en_rupture": true
}
```

#### Définir une promotion (Admin)
```http
PATCH /api/produits/:id/promotion
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "promotion": 25
}
```

**Note:** La promotion est un pourcentage (0-100). Le prix final est automatiquement calculé.

---

### 3. COMMANDES (`/api/commandes`)

#### Créer une commande
```http
POST /api/commandes
Content-Type: application/json

{
  "nom_complet": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "telephone": "0555123456",
  "adresse_livraison": "123 Rue Example",
  "ville": "Alger",
  "wilaya": "Alger",
  "code_postal": "16000",
  "methode_livraison": "domicile",
  "articles": [
    {
      "produit_id": 1,
      "quantite": 2,
      "taille": "M",
      "couleur": "Bleu"
    },
    {
      "produit_id": 3,
      "quantite": 1
    }
  ],
  "notes": "Livraison le matin si possible"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Commande créée avec succès. En attente de confirmation.",
  "data": {
    "id": 1,
    "nom_complet": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "sous_total": 5000.00,
    "frais_livraison": 500.00,
    "total": 5500.00,
    "statut": "en_attente",
    "articles": [...]
  }
}
```

**Workflow de la commande:**

1. **Client passe commande** → Statut: `en_attente`
   - Un email est automatiquement envoyé à l'admin avec tous les détails
   - Aucun email n'est envoyé au client à cette étape

2. **Admin appelle le client** pour confirmer les détails

3. **Admin confirme la commande** via `POST /api/admin/commandes/:id/confirmer` → Statut: `confirmee`
   - Email de confirmation envoyé au client avec la facture (si uploadée)

4. **Admin expédie** via `PATCH /api/admin/commandes/:id/statut` → Statut: `expediee`
   - Email d'expédition envoyé au client

5. **Livraison** → Statut: `livree`

> `methode_livraison` accepte `domicile` (livraison à domicile) ou `zr_express` (livraison via ZrExpress).

#### Récupérer une commande
```http
GET /api/commandes/:id?email=jean.dupont@example.com
```

#### Mes commandes (utilisateur connecté)
```http
GET /api/commandes
Authorization: Bearer <token>
```

#### Annuler une commande (utilisateur connecté)
```http
PATCH /api/commandes/:id/statut
Authorization: Bearer <token>
Content-Type: application/json

{
  "statut": "annulee"
}
```

> L'utilisateur doit être le propriétaire de la commande. Seul le statut `annulee` est accepté et uniquement si la commande n'est pas déjà expédiée ou livrée.

---

### 4. NEWSLETTER (`/api/newsletter`)

#### Inscription
```http
POST /api/newsletter
Content-Type: application/json

{
  "email": "contact@example.com",
  "source": "homepage"
}
```

#### Désinscription
```http
DELETE /api/newsletter/contact@example.com
```

**Note:** Les emails de newsletter incluent automatiquement un lien de désinscription avec l'adresse email pré-remplie (ex: `/newsletter/unsubscribe?email=contact@example.com`) pour faciliter la désinscription en un clic.

---

### 5. ADMIN (`/api/admin`)

Toutes les routes admin nécessitent `Authorization: Bearer <admin_token>`

#### Dashboard
```http
GET /api/admin/dashboard
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "statistiques": {
      "totalUtilisateurs": 150,
      "totalCommandes": 350,
      "totalProduits": 75,
      "totalAbonnesNewsletter": 500,
      "revenusMois": 125000.00
    },
    "commandesParStatut": [...],
    "topProduits": [...],
    "dernieresCommandes": [...],
    "produits": [
      {
        "id": 1,
        "nom": "T-Shirt Classique",
        "description": "Description du produit",
        "prix": 1500.00,
        "prix_promo": null,
        "promotion": 20,
        "prix_final": 1200.00,
        "categorie": "homme",
        "stock": 50,
        "en_rupture": false,
        "est_nouveau": true,
        "image_avant": "https://cloudinary.com/front.jpg",
        "image_arriere": "https://cloudinary.com/back.jpg",
        "images": ["https://cloudinary.com/detail1.jpg"],
        "date_creation": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Note:** Le champ `produits` retourne **tous** les produits (y compris ceux en rupture de stock) pour permettre la gestion complète dans le dashboard admin.

#### Gestion utilisateurs
```http
GET /api/admin/users?page=1&limit=20&search=dupont
PATCH /api/admin/users/:id/toggle-admin
PATCH /api/admin/users/:id/toggle-actif
DELETE /api/admin/users/:id
```

#### Gestion commandes
```http
GET /api/admin/commandes?page=1&statut=en_attente

POST /api/admin/commandes/:id/confirmer
Authorization: Bearer <admin_token>

PATCH /api/admin/commandes/:id/statut
Content-Type: application/json

{
  "statut": "expediee",
  "numero_suivi": "YAL123456789"
}

POST /api/admin/commandes/:id/facture
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

Form-data:
- facture: <fichier PDF>

DELETE /api/admin/commandes/:id
```

**Workflow de gestion des commandes:**

1. **Nouvelle commande** (`en_attente`)
   - L'admin reçoit un email avec les détails complets
   - Visible dans le dashboard avec filtre `?statut=en_attente`

2. **Confirmer la commande** → `POST /api/admin/commandes/:id/confirmer`
   ```json
   // Pas de body requis
   ```
   **Réponse (200):**
   ```json
   {
     "success": true,
     "message": "Commande confirmée avec succès. Email envoyé au client.",
     "data": {
       "id": 1,
       "statut": "confirmee",
       ...
     }
   }
   ```
   - Change le statut `en_attente` → `confirmee`
   - Envoie un email au client avec la facture (si uploadée)

3. **Uploader la facture** (optionnel avant ou après confirmation)
   ```bash
   curl -X POST http://localhost:5000/api/admin/commandes/1/facture \
     -H "Authorization: Bearer <token>" \
     -F "facture=@facture.pdf"
   ```

4. **Marquer comme expédiée**
   ```json
   PATCH /api/admin/commandes/:id/statut
   {
     "statut": "expediee",
     "numero_suivi": "YAL123456789"
   }
   ```
   - Envoie un email d'expédition au client (sans lien de suivi)

5. **Marquer comme livrée**
   ```json
   {
     "statut": "livree"
   }
   ```

**Upload de facture:**
- Format: PDF uniquement
- Taille max: 10MB
- Le fichier est stocké sur Cloudinary
- L'ancienne facture est automatiquement supprimée si elle existe

**Gestion des statuts:**
- Statuts acceptés: `en_attente`, `confirmee`, `expediee`, `livree`, `annulee`
- Transitions recommandées: `en_attente` → `confirmee` → `expediee` → `livree`
- Une commande annulée (`annulee`) est automatiquement remise en stock
- Les commandes annulées peuvent être supprimées via `DELETE /api/admin/commandes/:id`

**Emails automatiques:**
- ✅ Nouvelle commande → Email à l'admin
- ✅ Confirmation → Email au client (avec facture si disponible)
- ✅ Expédition → Email au client
- ❌ Pas de lien de suivi dans les emails

#### Newsletter
```http
GET /api/admin/newsletter?actif=true&page=1
PATCH /api/admin/newsletter/:id/toggle
DELETE /api/admin/newsletter/:id
```

**GET /api/admin/newsletter** - Liste des abonnés
- Paramètres query:
  - `page` (optionnel): Numéro de page (défaut: 1)
  - `limit` (optionnel): Éléments par page (défaut: 50)
  - `actif` (optionnel): true/false pour filtrer par statut

**Réponse:**
```json
{
  "success": true,
  "data": {
    "abonnes": [
      {
        "id": 1,
        "email": "subscriber@example.com",
        "est_actif": true,
        "date_inscription": "2025-01-15T10:00:00.000Z",
        "date_desinscription": null,
        "source": "homepage"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 3,
      "limit": 50
    },
    "stats": {
      "total_actifs": 120,
      "total_inactifs": 30
    }
  }
}
```

**PATCH /api/admin/newsletter/:id/toggle** - Activer/désactiver un abonné
- Alterne le statut `est_actif` de l'abonné
- Si désactivé, ajoute `date_desinscription`
- Si réactivé, supprime `date_desinscription`

**DELETE /api/admin/newsletter/:id** - Supprimer définitivement un abonné
- Supprime complètement l'abonné de la base de données
- Action irréversible

---

## 🔒 Validations

### Mot de passe
- Minimum 8 caractères

### Téléphone
- Format algérien: `0XXXXXXXXX` (10 chiffres commençant par 0)

### Email
- Format email valide
- Unique dans la base

### Produits
- Prix > 0
- Stock >= 0
- Images: JPG, JPEG, PNG (max 10MB chacune, max 10 images par produit)
- Catégories: homme, femme, enfant, accessoires, autre
- Promotion: 0-100 (pourcentage de réduction)

### Commandes
- Quantité >= 1
- Méthodes de livraison: domicile, zr_express
- Statuts: en_attente, confirmee, expediee, livree, annulee
- Workflow: en_attente (email admin) → confirmee (email client) → expediee (email client) → livree

---

## 🛡️ Sécurité

### Rate Limiting
- 100 requêtes par 15 minutes par IP (configurable via .env)

### Headers de sécurité
- Helmet.js activé
- CORS configuré

### Authentification
- JWT avec expiration 30 jours
- Bcrypt pour hash des mots de passe (salt rounds: 10)

---

## 📦 Codes de réponse HTTP

- `200` OK - Succès
- `201` Created - Ressource créée
- `400` Bad Request - Erreur de validation
- `401` Unauthorized - Non authentifié
- `403` Forbidden - Accès refusé
- `404` Not Found - Ressource non trouvée
- `409` Conflict - Conflit (email déjà utilisé, etc.)
- `429` Too Many Requests - Rate limit dépassé
- `500` Internal Server Error - Erreur serveur

---

## 🧪 Test avec cURL

### Inscription
```bash
curl -X POST http://localhost:5000/api/auth/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "email": "test@example.com",
    "mot_de_passe": "Password123",
    "telephone": "0555123456"
  }'
```

### Créer un produit (avec images)
```bash
curl -X POST http://localhost:5000/api/produits \
  -H "Authorization: Bearer <admin_token>" \
  -F "nom=T-Shirt Test" \
  -F "prix=1500" \
  -F "promotion=20" \
  -F "categorie=homme" \
  -F "stock=100" \
  -F "image_avant=@/path/to/front.jpg" \
  -F "image_arriere=@/path/to/back.jpg" \
  -F "images=@/path/to/detail1.jpg" \
  -F "images=@/path/to/detail2.jpg"
```

### Définir une promotion
```bash
curl -X PATCH http://localhost:5000/api/produits/1/promotion \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"promotion": 25}'
```

---

## 📞 Support

Pour toute question: admin@arseet.com
