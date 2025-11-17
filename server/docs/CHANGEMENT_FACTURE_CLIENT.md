# 🔄 Changement: Facture uploadée par le client

## Résumé

**Avant:** L'admin uploadait la facture après confirmation de la commande  
**Après:** Le client uploade la facture lors de la création de la commande

---

## Modifications effectuées

### 1. Route POST /api/commandes

**Fichier:** `routes/commandesRoutes.js`

```javascript
// Avant
router.post('/', optionalAuth, validateCommande, createCommande);

// Après
router.post('/', optionalAuth, uploadPDF.single('facture'), validateCommande, createCommande);
```

**Changement:** Ajout du middleware `uploadPDF.single('facture')` pour gérer l'upload du fichier PDF.

---

### 2. Controller createCommande

**Fichier:** `controllers/commandesController.js`

**Ajouts:**
```javascript
// Vérification que la facture est présente
if (!req.file) {
  res.status(400);
  throw new Error('La facture (PDF) est requise pour créer une commande');
}

// Enregistrement de l'URL Cloudinary
const commande = await Commande.create({
  // ... autres champs
  facture: req.file.path, // URL Cloudinary de la facture
  statut: 'en_attente'
}, { transaction });
```

**Impact:** La facture est maintenant **obligatoire** lors de la création d'une commande.

---

### 3. Suppression endpoint admin

**Fichiers modifiés:**
- `routes/adminRoutes.js` - Suppression de la route POST `/api/admin/commandes/:id/facture`
- `controllers/commandesController.js` - Suppression de la fonction `uploadFacture`

**Raison:** Plus nécessaire car le client uploade déjà la facture.

---

### 4. Documentation mise à jour

**Fichier:** `DOCUMENTATION_COMMANDES_COMPLETE.md`

**Changements:**
- Endpoint POST /api/commandes utilise maintenant `multipart/form-data`
- Facture est un champ **requis** (fichier PDF)
- Suppression de l'endpoint POST `/api/admin/commandes/:id/facture`
- Workflow mis à jour

---

## Nouveau workflow

```
1. CLIENT crée commande + upload facture (PDF)
   POST /api/commandes
   Content-Type: multipart/form-data
   Body: { ...données, facture: fichier.pdf }
   ↓
2. SERVEUR
   - Vérifie la présence de la facture
   - Upload sur Cloudinary
   - Crée la commande avec facture
   - Envoie email à l'admin (avec lien facture)
   ↓
3. ADMIN
   - Reçoit email
   - Télécharge et vérifie la facture
   - Appelle le client
   - Confirme la commande
   ↓
4. CLIENT reçoit email de confirmation (avec lien facture)
```

---

## Format de la requête client

### Ancien format (JSON)

```javascript
fetch('/api/commandes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nom_complet: "Jean Dupont",
    // ...
    articles: [...]
  })
});
```

### Nouveau format (FormData)

```javascript
const formData = new FormData();

// Champs texte
formData.append('nom_complet', 'Jean Dupont');
formData.append('email', 'jean.dupont@example.com');
formData.append('telephone', '0555123456');
formData.append('adresse_livraison', '123 Rue de la Liberté');
formData.append('ville', 'Alger');
formData.append('wilaya', 'Alger');
formData.append('methode_livraison', 'domicile');

// Articles (JSON stringifié)
formData.append('articles', JSON.stringify([
  { produit_id: 1, quantite: 2, taille: "M", couleur: "Bleu" }
]));

// Facture (REQUIS) - File object
formData.append('facture', fichierPDF);

fetch('/api/commandes', {
  method: 'POST',
  body: formData
  // Pas de Content-Type header (auto par le navigateur)
});
```

---

## Validation de la facture

**Format accepté:** PDF uniquement  
**Taille max:** 10 MB  
**Stockage:** Cloudinary (dossier `arseet_factures`)  
**Champ requis:** Oui (erreur 400 si absent)

---

## Impact sur le frontend

### Formulaire de commande

**HTML:**
```html
<form id="commandeForm" enctype="multipart/form-data">
  <!-- Champs existants -->
  <input type="text" name="nom_complet" required>
  <input type="email" name="email" required>
  <!-- ... -->
  
  <!-- NOUVEAU: Upload de facture -->
  <div class="form-group">
    <label for="facture">Facture (PDF) *</label>
    <input 
      type="file" 
      id="facture" 
      name="facture" 
      accept="application/pdf" 
      required
    >
    <small>Fichier PDF, max 10MB</small>
  </div>
  
  <button type="submit">Commander</button>
</form>
```

**JavaScript:**
```javascript
document.getElementById('commandeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  
  // Récupérer tous les champs
  formData.append('nom_complet', document.getElementById('nom_complet').value);
  formData.append('email', document.getElementById('email').value);
  // ... autres champs
  
  // Articles (depuis votre panier par exemple)
  formData.append('articles', JSON.stringify(panierArticles));
  
  // Facture (IMPORTANT)
  const factureFile = document.getElementById('facture').files[0];
  if (!factureFile) {
    alert('Veuillez sélectionner une facture PDF');
    return;
  }
  formData.append('facture', factureFile);
  
  try {
    const response = await fetch('http://localhost:5000/api/commandes', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Commande créée avec succès !');
      // Rediriger vers page de confirmation
    } else {
      alert('Erreur: ' + data.message);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
});
```

---

## Erreurs possibles

| Code | Message | Cause |
|------|---------|-------|
| 400 | "La facture (PDF) est requise pour créer une commande" | Aucun fichier uploadé |
| 400 | "Format non supporté. Utilisez uniquement des fichiers PDF." | Fichier n'est pas un PDF |
| 400 | File size exceeds limit | Fichier > 10MB |
| 400 | "Stock insuffisant pour..." | Stock produit insuffisant |
| 404 | "Produit avec ID X non trouvé" | Produit inexistant |

---

## Migration frontend requise

### Actions nécessaires:

1. ✅ **Ajouter input file** dans le formulaire de commande
   ```html
   <input type="file" accept="application/pdf" required>
   ```

2. ✅ **Changer Content-Type** de JSON à FormData
   ```javascript
   // Avant: JSON.stringify({ ... })
   // Après: new FormData()
   ```

3. ✅ **Stringifier les articles**
   ```javascript
   formData.append('articles', JSON.stringify(articles));
   ```

4. ✅ **Valider le fichier** avant envoi
   - Vérifier que le fichier existe
   - Vérifier le type (PDF)
   - Vérifier la taille (< 10MB)

5. ✅ **Gestion d'erreurs**
   - Afficher message si facture manquante
   - Afficher message si format invalide

---

## Test de l'API

### Avec cURL (Windows PowerShell)

```powershell
curl -X POST http://localhost:5000/api/commandes `
  -F "nom_complet=Jean Dupont" `
  -F "email=jean.dupont@example.com" `
  -F "telephone=0555123456" `
  -F "adresse_livraison=123 Rue de la Liberté" `
  -F "ville=Alger" `
  -F "wilaya=Alger" `
  -F "methode_livraison=domicile" `
  -F "articles=[{\"produit_id\":1,\"quantite\":2}]" `
  -F "facture=@C:\chemin\vers\facture.pdf"
```

### Avec Postman

1. Créer une requête POST vers `http://localhost:5000/api/commandes`
2. Onglet **Body** → Sélectionner **form-data**
3. Ajouter les clés:
   - `nom_complet` (Text) = Jean Dupont
   - `email` (Text) = jean.dupont@example.com
   - `telephone` (Text) = 0555123456
   - `adresse_livraison` (Text) = 123 Rue de la Liberté
   - `ville` (Text) = Alger
   - `wilaya` (Text) = Alger
   - `methode_livraison` (Text) = domicile
   - `articles` (Text) = `[{"produit_id":1,"quantite":2}]`
   - `facture` (File) = Sélectionner votre fichier PDF
4. Envoyer

---

## Vérification Cloudinary

Les factures sont uploadées dans le dossier `arseet_factures`:

```
https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v123456789/arseet_factures/abc123.pdf
```

**Type de ressource:** `raw` (car PDF, pas image)

---

## Rollback (si nécessaire)

Si vous devez revenir à l'ancien système:

1. Retirer `uploadPDF.single('facture')` de la route
2. Retirer la vérification `if (!req.file)` du controller
3. Retirer `facture: req.file.path` de la création
4. Réajouter l'endpoint POST `/api/admin/commandes/:id/facture`
5. Réajouter la fonction `uploadFacture` au controller

---

## Compatibilité

✅ **Compatible** avec:
- Anciennes commandes sans facture (champ `facture` peut être NULL)
- Système d'emails existant (lien facture inclus)
- Validation middleware existante

❌ **Incompatible** avec:
- Anciennes requêtes JSON sans facture (renvoie erreur 400)

---

## Documentation mise à jour

- ✅ `DOCUMENTATION_COMMANDES_COMPLETE.md` - Workflow et exemples mis à jour
- ✅ `CHANGEMENT_FACTURE_CLIENT.md` - Ce fichier
- 📝 À faire: Mettre à jour `API_DOCUMENTATION.md` si nécessaire

---

**Date de modification:** Novembre 2025  
**Version:** 2.1 - Facture client obligatoire
