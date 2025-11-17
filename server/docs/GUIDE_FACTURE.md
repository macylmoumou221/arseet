# 📄 Guide - Gestion des Factures PDF

## 🎯 Vue d'ensemble

Le système permet aux administrateurs d'uploader des factures PDF pour chaque commande. Les factures sont stockées sur Cloudinary et accessibles via URL.

---

## 📋 Nouvelle Fonctionnalité

### **Champ ajouté à la table `commandes`:**

```sql
facture VARCHAR(500) NULL COMMENT 'URL du fichier PDF de la facture'
```

---

## 🔧 Migration Base de Données

### **Exécuter ce script SQL:**

```sql
USE arseet_ecommerce;

ALTER TABLE commandes
ADD COLUMN facture VARCHAR(500) NULL COMMENT 'URL du fichier PDF de la facture' AFTER notes;

DESCRIBE commandes;
```

### **Via MySQL Workbench:**
1. Ouvrez MySQL Workbench
2. Connectez-vous à votre base de données
3. Exécutez le script `scripts/add_facture_field.sql`
4. Vérifiez que le champ a été ajouté

---

## 🚀 Utilisation de l'API

### **1. Uploader une Facture (Admin)**

```http
POST /api/admin/commandes/:id/facture
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form-data:
- facture: <fichier PDF>
```

**Exemple avec cURL:**
```bash
curl -X POST http://localhost:5000/api/admin/commandes/1/facture \
  -H "Authorization: Bearer <admin_token>" \
  -F "facture=@/path/to/facture_commande_001.pdf"
```

**Exemple avec Insomnia:**
1. Méthode: **POST**
2. URL: `http://localhost:5000/api/admin/commandes/1/facture`
3. Auth: **Bearer Token** → Collez votre token admin
4. Body: **Multipart Form**
5. Ajouter un champ:
   - Name: `facture`
   - Type: **File**
   - Value: Sélectionnez votre fichier PDF

**Réponse (200):**
```json
{
  "success": true,
  "message": "Facture uploadée avec succès",
  "data": {
    "id": 1,
    "facture": "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/arseet_factures/facture_001.pdf"
  }
}
```

---

### **2. Récupérer une Commande avec Facture**

```http
GET /api/commandes/:id?email=client@example.com
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom_complet": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "statut": "livree",
    "total": 5500.00,
    "facture": "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/arseet_factures/facture_001.pdf",
    "articles": [...]
  }
}
```

---

### **3. Liste des Commandes (Admin)**

```http
GET /api/admin/commandes?page=1&limit=20
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "commandes": [
      {
        "id": 1,
        "nom_complet": "Jean Dupont",
        "email": "jean@example.com",
        "statut": "livree",
        "total": 5500.00,
        "facture": "https://res.cloudinary.com/.../facture_001.pdf"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 📁 Structure Cloudinary

### **Dossiers:**
- `arseet_products/` - Images de produits
- `arseet_factures/` - Factures PDF (nouveau)

### **Configuration:**
- Format accepté: **PDF uniquement**
- Taille max: **10 MB**
- Type de ressource: **raw** (fichiers non-images)

---

## 🔒 Sécurité

### **Contrôles d'accès:**
- ✅ Upload de facture: **Admin uniquement**
- ✅ Consultation de facture: Client (avec email) ou Admin
- ✅ Fichier validé: PDF uniquement

### **Validation:**
```javascript
// Middleware Multer
fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez uniquement des fichiers PDF.'), false);
  }
}
```

---

## 🔄 Remplacement de Facture

Si une facture existe déjà:
1. L'ancienne facture est **automatiquement supprimée** de Cloudinary
2. La nouvelle facture est uploadée
3. L'URL dans la base de données est mise à jour

**Code:**
```javascript
// Supprimer l'ancienne facture si elle existe
if (commande.facture) {
  await deletePDF(commande.facture);
}

// Uploader la nouvelle
await commande.update({
  facture: req.file.path
});
```

---

## 🎨 Workflow Complet

```
┌─────────────────────────────────────────────────┐
│  1. Client passe commande                       │
│     ↓                                            │
│  2. Admin confirme la commande                  │
│     ↓                                            │
│  3. Admin génère la facture PDF (hors système)  │
│     ↓                                            │
│  4. Admin upload la facture via API:            │
│     POST /api/admin/commandes/:id/facture       │
│     ↓                                            │
│  5. Facture stockée sur Cloudinary              │
│     ↓                                            │
│  6. Client peut télécharger sa facture:         │
│     GET /api/commandes/:id                      │
│     → Lien vers le PDF                          │
└─────────────────────────────────────────────────┘
```

---

## 💡 Cas d'Usage

### **1. Workflow E-commerce Standard**

```javascript
// 1. Créer la commande
const commande = await createCommande({
  nom_complet: "Jean Dupont",
  email: "jean@example.com",
  articles: [...]
});

// 2. Générer la facture PDF (avec une librairie comme pdfkit)
const facturePDF = await genererFacturePDF(commande);

// 3. Uploader la facture
const formData = new FormData();
formData.append('facture', facturePDF);

await fetch(`/api/admin/commandes/${commande.id}/facture`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: formData
});
```

### **2. Envoyer la Facture par Email**

```javascript
// Dans sendOrderConfirmation (config/sendgrid.js)
const factureUrl = commande.facture;

// Ajouter le lien dans l'email
const emailContent = `
  Votre commande a été confirmée !
  
  Téléchargez votre facture : ${factureUrl}
`;
```

---

## 🛠️ Génération Automatique de Facture (Optionnel)

### **Avec PDFKit (Node.js):**

```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function genererFacture(commande) {
  const doc = new PDFDocument();
  const filePath = `/tmp/facture_${commande.id}.pdf`;
  
  doc.pipe(fs.createWriteStream(filePath));
  
  // En-tête
  doc.fontSize(20).text('FACTURE', { align: 'center' });
  doc.fontSize(12).text(`N° ${commande.id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  
  // Informations client
  doc.text(`\nClient: ${commande.nom_complet}`);
  doc.text(`Email: ${commande.email}`);
  doc.text(`Téléphone: ${commande.telephone}`);
  
  // Articles
  doc.text('\nARTICLES:', { underline: true });
  commande.articles.forEach(article => {
    doc.text(`${article.nom} x${article.quantite} - ${article.prix_unitaire} DA`);
  });
  
  // Totaux
  doc.text(`\nSous-total: ${commande.sous_total} DA`);
  doc.text(`Frais de livraison: ${commande.frais_livraison} DA`);
  doc.fontSize(14).text(`TOTAL: ${commande.total} DA`, { bold: true });
  
  doc.end();
  
  return filePath;
}
```

---

## 📊 Statistiques

### **Suivi des factures:**

```javascript
// Nombre de commandes avec facture
const commandesAvecFacture = await Commande.count({
  where: {
    facture: { [Op.not]: null }
  }
});

// Commandes sans facture
const commandesSansFacture = await Commande.findAll({
  where: {
    facture: null,
    statut: ['confirmee', 'expediee', 'livree']
  }
});
```

---

## ⚠️ Erreurs Courantes

### **1. "Format non supporté"**
**Cause:** Fichier uploadé n'est pas un PDF  
**Solution:** Utilisez uniquement des fichiers `.pdf`

### **2. "File too large"**
**Cause:** Fichier > 10 MB  
**Solution:** Compressez le PDF ou réduisez la taille

### **3. "Commande non trouvée"**
**Cause:** ID de commande invalide  
**Solution:** Vérifiez l'ID de la commande

### **4. "Unauthorized"**
**Cause:** Pas de token admin  
**Solution:** Connectez-vous en tant qu'admin

---

## 🔍 Tests

### **Test 1: Upload de facture**
```bash
# Créer une commande test
curl -X POST http://localhost:5000/api/commandes \
  -H "Content-Type: application/json" \
  -d '{"nom_complet":"Test User", ...}'

# Uploader la facture
curl -X POST http://localhost:5000/api/admin/commandes/1/facture \
  -H "Authorization: Bearer <admin_token>" \
  -F "facture=@test_facture.pdf"

# Vérifier
curl http://localhost:5000/api/commandes/1?email=test@example.com
```

### **Test 2: Remplacement de facture**
```bash
# Uploader une nouvelle facture (remplace l'ancienne)
curl -X POST http://localhost:5000/api/admin/commandes/1/facture \
  -H "Authorization: Bearer <admin_token>" \
  -F "facture=@nouvelle_facture.pdf"
```

---

## 📝 Checklist de Déploiement

- [ ] Migration SQL exécutée (champ `facture` ajouté)
- [ ] Serveur redémarré
- [ ] Cloudinary configuré pour accepter les PDF
- [ ] Test d'upload de facture réussi
- [ ] Vérification de la suppression de l'ancienne facture
- [ ] Documentation mise à jour

---

**Créé le:** 7 Novembre 2024  
**Version:** 1.0.0
