# 📦 Documentation API - Gestion des Commandes

## Workflow
```
Client crée commande + facture → Admin reçoit email → Admin confirme → Client reçoit email → Expédition → Livraison
     (en_attente + PDF)              ↓              (confirmee)           ↓           (expediee)    (livree)
                                     ↓                                    ↓
                              Appelle client                      Email de confirmation
```

## Statuts
- `en_attente` - Nouvelle commande avec facture (email → admin)
- `confirmee` - Validée par admin (email → client)
- `expediee` - Expédiée (email → client)
- `livree` - Livrée
- `annulee` - Annulée (stock restauré)

---

# Endpoints Client

## 1. POST /api/commandes - Créer une commande

**Autorisation:** Public (optionnel si connecté)

**Content-Type:** `multipart/form-data`

**Body (FormData):**

```json
{
  "nom_complet": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "telephone": "0555123456",
  "adresse_livraison": "123 Rue de la Liberté, Bâtiment A, Appartement 5",
  "ville": "Alger",
  "code_postal": "16000",
  "wilaya": "Alger",
  "methode_livraison": "domicile",
  "articles": [
    {
      "produit_id": 1,
      "quantite": 2,
      "taille": "M",
      "couleur": "Bleu"
    },
    {
      "produit_id": 5,
      "quantite": 1,
      "taille": "L",
      "couleur": "Noir"
    }
  ],
  "notes": "Livraison le matin si possible"
}
```

**Champs requis:** `nom_complet`, `email`, `telephone`, `adresse_livraison`, `ville`, `wilaya`, `methode_livraison`, `articles`

**Méthodes livraison:**
- `domicile` - 600 DZD (+250 DZD si wilaya éloignée)
- `zr_express` - 950 DZD (+250 DZD si wilaya éloignée)

**Exemple JavaScript:**

```javascript
const creerCommande = async (commandeData, fichierFacture) => {
  const formData = new FormData();
  
  // Ajouter tous les champs
  formData.append('nom_complet', commandeData.nom_complet);
  formData.append('email', commandeData.email);
  formData.append('telephone', commandeData.telephone);
  formData.append('adresse_livraison', commandeData.adresse_livraison);
  formData.append('ville', commandeData.ville);
  formData.append('wilaya', commandeData.wilaya);
  formData.append('methode_livraison', commandeData.methode_livraison);
  
  if (commandeData.code_postal) {
    formData.append('code_postal', commandeData.code_postal);
  }
  
  if (commandeData.notes) {
    formData.append('notes', commandeData.notes);
  }
  
  // Articles en JSON
  formData.append('articles', JSON.stringify(commandeData.articles));
  
  // Facture PDF (REQUIS)
  formData.append('facture', fichierFacture);
  
  const response = await fetch('http://localhost:5000/api/commandes', {
    method: 'POST',
    body: formData
    // Pas de Content-Type header - le navigateur le définit automatiquement
  });
  
  return await response.json();
};

// Utilisation
const fileInput = document.getElementById('facture');
const fichierPDF = fileInput.files[0];

const commande = await creerCommande({
  nom_complet: "Jean Dupont",
  email: "jean.dupont@example.com",
  telephone: "0555123456",
  adresse_livraison: "123 Rue de la Liberté",
  ville: "Alger",
  wilaya: "Alger",
  methode_livraison: "domicile",
  articles: [
    { produit_id: 1, quantite: 2, taille: "M", couleur: "Bleu" }
  ]
}, fichierPDF);
```

**Réponse (201):**

```json
{
  "success": true,
  "message": "Commande créée avec succès. En attente de confirmation.",
  "data": {
    "id": 1,
    "user_id": null,
    "nom_complet": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "telephone": "0555123456",
    "adresse_livraison": "123 Rue de la Liberté, Bâtiment A, Appartement 5",
    "ville": "Alger",
    "code_postal": "16000",
    "wilaya": "Alger",
    "methode_livraison": "domicile",
    "frais_livraison": 600.00,
    "sous_total": 4500.00,
    "total": 5100.00,
    "statut": "en_attente",
    "numero_suivi": null,
    "notes": "Livraison le matin si possible, appeler avant de venir",
    "facture": null,
    "date_creation": "2025-01-15T10:30:00.000Z",
    "date_mise_a_jour": "2025-01-15T10:30:00.000Z",
    "date_livraison": null,
    "articles": [
      {
        "id": 1,
        "commande_id": 1,
        "produit_id": 1,
        "nom_produit": "T-Shirt Premium",
        "quantite": 2,
        "prix_unitaire": 1500.00,
        "sous_total": 3000.00,
        "taille": "M",
        "couleur": "Bleu",
        "produit": {
          "id": 1,
          "nom": "T-Shirt Premium",
          "image_avant": "https://cloudinary.com/..."
        }
      },
      {
        "id": 2,
        "commande_id": 1,
        "produit_id": 5,
        "nom_produit": "Pantalon Casual",
        "quantite": 1,
        "prix_unitaire": 1500.00,
        "sous_total": 1500.00,
        "taille": "L",
        "couleur": "Noir",
        "produit": {
          "id": 5,
          "nom": "Pantalon Casual",
          "image_avant": "https://cloudinary.com/..."
        }
      }
    "total": 5100.00,
    "statut": "en_attente",
    "facture": "https://res.cloudinary.com/.../facture_xyz.pdf",
    "articles": [...]
  }
}
```

**Action:** Stock décrémenté, facture uploadée sur Cloudinary, email envoyé à l'admin, statut = `en_attente`

**Erreurs possibles:**
- `400` - Facture manquante ou format invalide (doit être PDF)
- `400` - Stock insuffisant
- `404` - Produit non trouvé

---

## 2. GET /api/commandes/:id - Consulter une commande

**Autorisation:** Public avec `?email=...` OU Privé (propriétaire) OU Admin

**Réponse (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom_complet": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "telephone": "0555123456",
    "adresse_livraison": "123 Rue de la Liberté",
    "ville": "Alger",
    "wilaya": "Alger",
    "methode_livraison": "domicile",
    "frais_livraison": 600.00,
    "sous_total": 4500.00,
    "total": 5100.00,
    "statut": "confirmee",
    "numero_suivi": null,
    "facture": "https://cloudinary.com/facture_001.pdf",
    "date_creation": "2025-01-15T10:30:00.000Z",
    "articles": [...]
  }
}
```

---

## 3. GET /api/commandes - Mes commandes (utilisateur connecté)

**Autorisation:** Privé (Bearer token requis)

**Description:** Retourne UNIQUEMENT les commandes de l'utilisateur connecté

**Query params (optionnels):**
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre de résultats par page (défaut: 10)

**Exemple requête:**
```bash
GET /api/commandes?page=1&limit=10
Authorization: Bearer <votre_token>
```

**Réponse (200):**

```json
{
  "success": true,
  "data": {
    "commandes": [
      {
        "id": 1,
        "user_id": 5,
        "nom_complet": "Jean Dupont",
        "email": "jean.dupont@example.com",
        "telephone": "0555123456",
        "adresse_livraison": "123 Rue de la Liberté",
        "ville": "Alger",
        "wilaya": "Alger",
        "methode_livraison": "domicile",
        "frais_livraison": 600.00,
        "sous_total": 4500.00,
        "total": 5100.00,
        "statut": "confirmee",
        "numero_suivi": null,
        "facture": "https://cloudinary.com/facture_001.pdf",
        "notes": "Livraison le matin",
        "date_creation": "2025-01-15T10:30:00.000Z",
        "date_mise_a_jour": "2025-01-15T14:20:00.000Z",
        "date_livraison": null,
        "articles": [
          {
            "id": 1,
            "commande_id": 1,
            "produit_id": 1,
            "nom_produit": "T-Shirt Premium",
            "quantite": 2,
            "prix_unitaire": 1500.00,
            "sous_total": 3000.00,
            "taille": "M",
            "couleur": "Bleu",
            "produit": {
              "id": 1,
              "nom": "T-Shirt Premium",
              "image_avant": "https://cloudinary.com/..."
            }
          }
        ]
      },
      {
        "id": 2,
        "user_id": 5,
        "nom_complet": "Jean Dupont",
        "total": 3200.00,
        "statut": "expediee",
        "date_creation": "2025-01-14T15:20:00.000Z",
        "articles": [...]
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pages": 1,
      "limit": 10
    }
  }
}
```

**Exemple JavaScript:**

```javascript
const mesCommandes = async (token, page = 1, limit = 10) => {
  const response = await fetch(
    `http://localhost:5000/api/commandes?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message);
  }
  
  return data.data;
};

// Utilisation
const token = localStorage.getItem('authToken');
const { commandes, pagination } = await mesCommandes(token, 1, 10);

console.log(`Vous avez ${pagination.total} commande(s)`);
commandes.forEach(cmd => {
  console.log(`#${cmd.id} - ${cmd.statut} - ${cmd.total} DZD`);
});
```

**Interface de suivi (exemple):**

```javascript
// Composant React/Vue pour afficher mes commandes
const MesCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    const fetchCommandes = async () => {
      const token = localStorage.getItem('authToken');
      const data = await mesCommandes(token, page, 10);
      setCommandes(data.commandes);
    };
    
    fetchCommandes();
  }, [page]);
  
  const getStatutBadge = (statut) => {
    const badges = {
      'en_attente': { label: '⏳ En attente', color: 'orange' },
      'confirmee': { label: '✅ Confirmée', color: 'green' },
      'expediee': { label: '🚚 Expédiée', color: 'blue' },
      'livree': { label: '📦 Livrée', color: 'green' },
      'annulee': { label: '❌ Annulée', color: 'red' }
    };
    return badges[statut] || { label: statut, color: 'gray' };
  };
  
  return (
    <div className="mes-commandes">
      <h2>Mes Commandes</h2>
      {commandes.map(cmd => (
        <div key={cmd.id} className="commande-card">
          <div className="commande-header">
            <span className="numero">Commande #{cmd.id}</span>
            <span className={`badge ${getStatutBadge(cmd.statut).color}`}>
              {getStatutBadge(cmd.statut).label}
            </span>
          </div>
          
          <div className="commande-details">
            <p>Date: {new Date(cmd.date_creation).toLocaleDateString()}</p>
            <p>Total: {cmd.total} DZD</p>
            <p>Articles: {cmd.articles.length}</p>
            
            {cmd.facture && (
              <a href={cmd.facture} target="_blank" rel="noopener">
                📄 Télécharger facture
              </a>
            )}
          </div>
          
          <div className="commande-actions">
            <button onClick={() => voirDetails(cmd.id)}>
              Voir détails
            </button>
            
            {cmd.statut === 'en_attente' && (
              <button onClick={() => annulerCommande(cmd.id)} className="danger">
                Annuler
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

**Points importants:**
- ✅ Retourne **uniquement** les commandes de l'utilisateur connecté (filtre automatique par `user_id`)
- ✅ Triées par date de création (plus récentes en premier)
- ✅ Pagination incluse
- ✅ Inclut tous les détails (articles, produits, facture)
- ✅ Statuts en temps réel pour le suivi

---

## 4. PATCH /api/commandes/:id/statut - Annuler ma commande

**Autorisation:** Privé (Bearer token, propriétaire uniquement)

**Description:** Permet à un utilisateur d'annuler sa propre commande

**Conditions:**
- ✅ Vous devez être le propriétaire (user_id correspond)
- ✅ La commande ne doit pas être déjà `expediee` ou `livree`
- ✅ Seul le statut `annulee` est autorisé

**Body:**

```json
{
  "statut": "annulee"
}
```

**Réponse (200):**

```json
{
  "success": true,
  "message": "Commande annulée avec succès. Le stock a été restauré.",
  "data": {
    "id": 1,
    "statut": "annulee",
    "date_mise_a_jour": "2025-01-16T09:30:00.000Z",
    ...
  }
}
```

**Actions automatiques:**
- ✅ Changement du statut vers `annulee`
- ✅ **Restauration automatique du stock** pour tous les articles
- ✅ Email de notification envoyé

**Erreurs possibles:**

```json
// 400 - Commande déjà expédiée
{
  "success": false,
  "message": "Cette commande ne peut plus être annulée."
}

// 400 - Statut invalide
{
  "success": false,
  "message": "Seul le statut 'annulee' est autorisé pour les utilisateurs"
}

// 403 - Pas le propriétaire
{
  "success": false,
  "message": "Vous ne pouvez mettre à jour que vos propres commandes"
}
```

**Exemple JavaScript:**

```javascript
const annulerMaCommande = async (commandeId, token) => {
  const response = await fetch(
    `http://localhost:5000/api/commandes/${commandeId}/statut`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ statut: 'annulee' })
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message);
  }
  
  return data.data;
};

// Utilisation avec confirmation
const annulerAvecConfirmation = async (commandeId) => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    try {
      const token = localStorage.getItem('authToken');
      await annulerMaCommande(commandeId, token);
      alert('Commande annulée avec succès !');
      // Recharger la liste des commandes
      window.location.reload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  }
};
```

---

# Suivi de commande pour utilisateurs connectés

## Vue d'ensemble

Les utilisateurs connectés peuvent :
- ✅ Voir toutes leurs commandes
- ✅ Suivre le statut en temps réel
- ✅ Télécharger leurs factures
- ✅ Annuler les commandes non expédiées
- ✅ Consulter l'historique complet

## Workflow complet utilisateur

```
1. CRÉER une commande
   POST /api/commandes + facture PDF
   ↓
2. CONSULTER la confirmation
   GET /api/commandes/:id
   ↓
3. SUIVRE l'évolution
   GET /api/commandes (liste toutes mes commandes)
   ↓
4. (Optionnel) ANNULER
   PATCH /api/commandes/:id/statut
```

## Exemple d'implémentation complète

### 1. Page "Mes Commandes"

```javascript
// Récupérer et afficher toutes les commandes
const afficherMesCommandes = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/commandes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    const { commandes, pagination } = data.data;
    
    // Afficher les commandes
    const container = document.getElementById('commandes-list');
    container.innerHTML = '';
    
    if (commandes.length === 0) {
      container.innerHTML = '<p>Vous n\'avez pas encore de commandes.</p>';
      return;
    }
    
    commandes.forEach(commande => {
      const card = creerCarteCommande(commande);
      container.appendChild(card);
    });
    
    // Afficher la pagination
    afficherPagination(pagination);
    
  } catch (error) {
    console.error('Erreur:', error);
    alert('Impossible de charger vos commandes');
  }
};

// Créer une carte pour chaque commande
const creerCarteCommande = (commande) => {
  const card = document.createElement('div');
  card.className = 'commande-card';
  
  const statutInfo = getStatutInfo(commande.statut);
  
  card.innerHTML = `
    <div class="commande-header">
      <div>
        <h3>Commande #${commande.id}</h3>
        <p class="date">${new Date(commande.date_creation).toLocaleDateString('fr-FR')}</p>
      </div>
      <span class="badge badge-${statutInfo.color}">
        ${statutInfo.icon} ${statutInfo.label}
      </span>
    </div>
    
    <div class="commande-body">
      <div class="info-grid">
        <div>
          <strong>Total:</strong> ${commande.total} DZD
        </div>
        <div>
          <strong>Articles:</strong> ${commande.articles.length}
        </div>
        <div>
          <strong>Livraison:</strong> ${commande.ville}, ${commande.wilaya}
        </div>
        <div>
          <strong>Méthode:</strong> ${commande.methode_livraison}
        </div>
      </div>
      
      <div class="articles-list">
        <h4>Articles commandés:</h4>
        ${commande.articles.map(article => `
          <div class="article-item">
            <img src="${article.produit.image_avant}" alt="${article.nom_produit}">
            <div class="article-info">
              <p class="nom">${article.nom_produit}</p>
              <p class="details">
                Qté: ${article.quantite}
                ${article.taille ? `| Taille: ${article.taille}` : ''}
                ${article.couleur ? `| Couleur: ${article.couleur}` : ''}
              </p>
              <p class="prix">${article.sous_total} DZD</p>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${statutInfo.message ? `
        <div class="statut-message ${statutInfo.color}">
          ${statutInfo.message}
        </div>
      ` : ''}
    </div>
    
    <div class="commande-footer">
      <button onclick="voirDetailsCommande(${commande.id})" class="btn btn-primary">
        Voir détails complets
      </button>
      
      ${commande.facture ? `
        <a href="${commande.facture}" target="_blank" class="btn btn-secondary">
          📄 Télécharger facture
        </a>
      ` : ''}
      
      ${commande.statut === 'en_attente' || commande.statut === 'confirmee' ? `
        <button onclick="annulerCommande(${commande.id})" class="btn btn-danger">
          Annuler la commande
        </button>
      ` : ''}
    </div>
  `;
  
  return card;
};

// Informations par statut
const getStatutInfo = (statut) => {
  const infos = {
    'en_attente': {
      label: 'En attente de confirmation',
      color: 'warning',
      icon: '⏳',
      message: 'Votre commande est en cours de vérification. Vous serez contacté sous peu.'
    },
    'confirmee': {
      label: 'Confirmée',
      color: 'success',
      icon: '✅',
      message: 'Votre commande a été confirmée et est en cours de préparation.'
    },
    'expediee': {
      label: 'Expédiée',
      color: 'info',
      icon: '🚚',
      message: 'Votre colis est en route ! Vous devriez le recevoir bientôt.'
    },
    'livree': {
      label: 'Livrée',
      color: 'success',
      icon: '📦',
      message: 'Votre commande a été livrée. Merci pour votre achat !'
    },
    'annulee': {
      label: 'Annulée',
      color: 'danger',
      icon: '❌',
      message: 'Cette commande a été annulée.'
    }
  };
  
  return infos[statut] || {
    label: statut,
    color: 'secondary',
    icon: '',
    message: ''
  };
};
```

### 2. Page "Détails d'une commande"

```javascript
const voirDetailsCommande = async (commandeId) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/commandes/${commandeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    const commande = data.data;
    
    // Afficher dans une modale ou une nouvelle page
    afficherDetailsComplets(commande);
    
  } catch (error) {
    alert('Erreur: ' + error.message);
  }
};

const afficherDetailsComplets = (commande) => {
  const modal = document.getElementById('modal-details');
  const content = document.getElementById('modal-content');
  
  content.innerHTML = `
    <div class="details-commande">
      <h2>Commande #${commande.id}</h2>
      
      <div class="section">
        <h3>Informations de livraison</h3>
        <p><strong>Nom:</strong> ${commande.nom_complet}</p>
        <p><strong>Email:</strong> ${commande.email}</p>
        <p><strong>Téléphone:</strong> ${commande.telephone}</p>
        <p><strong>Adresse:</strong> ${commande.adresse_livraison}</p>
        <p><strong>Ville:</strong> ${commande.ville}</p>
        <p><strong>Wilaya:</strong> ${commande.wilaya}</p>
        ${commande.code_postal ? `<p><strong>Code postal:</strong> ${commande.code_postal}</p>` : ''}
      </div>
      
      <div class="section">
        <h3>Articles</h3>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Qté</th>
              <th>Prix unitaire</th>
              <th>Sous-total</th>
            </tr>
          </thead>
          <tbody>
            ${commande.articles.map(a => `
              <tr>
                <td>
                  ${a.nom_produit}
                  ${a.taille ? `<br><small>Taille: ${a.taille}</small>` : ''}
                  ${a.couleur ? `<br><small>Couleur: ${a.couleur}</small>` : ''}
                </td>
                <td>${a.quantite}</td>
                <td>${a.prix_unitaire} DZD</td>
                <td>${a.sous_total} DZD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section totaux">
        <p><strong>Sous-total:</strong> ${commande.sous_total} DZD</p>
        <p><strong>Frais de livraison:</strong> ${commande.frais_livraison} DZD</p>
        <p class="total"><strong>TOTAL:</strong> ${commande.total} DZD</p>
      </div>
      
      <div class="section">
        <h3>Suivi</h3>
        <div class="timeline">
          ${creerTimeline(commande)}
        </div>
      </div>
      
      ${commande.notes ? `
        <div class="section">
          <h3>Notes</h3>
          <p>${commande.notes}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  modal.style.display = 'block';
};

// Timeline du statut
const creerTimeline = (commande) => {
  const etapes = [
    { statut: 'en_attente', label: 'Commande créée', date: commande.date_creation },
    { statut: 'confirmee', label: 'Confirmée', date: commande.date_mise_a_jour },
    { statut: 'expediee', label: 'Expédiée', date: null },
    { statut: 'livree', label: 'Livrée', date: commande.date_livraison }
  ];
  
  const statutActuelIndex = etapes.findIndex(e => e.statut === commande.statut);
  
  return etapes.map((etape, index) => {
    const estComplete = index <= statutActuelIndex;
    const estActuel = index === statutActuelIndex;
    
    return `
      <div class="timeline-item ${estComplete ? 'complete' : ''} ${estActuel ? 'actuel' : ''}">
        <div class="timeline-marker">${estComplete ? '✓' : index + 1}</div>
        <div class="timeline-content">
          <h4>${etape.label}</h4>
          ${etape.date ? `<p>${new Date(etape.date).toLocaleString('fr-FR')}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');
};
```

### 3. Fonction d'annulation

```javascript
const annulerCommande = async (commandeId) => {
  // Confirmation
  const confirmation = confirm(
    'Êtes-vous sûr de vouloir annuler cette commande ?\n' +
    'Le stock sera restauré automatiquement.'
  );
  
  if (!confirmation) return;
  
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/commandes/${commandeId}/statut`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: 'annulee' })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    alert('Commande annulée avec succès !');
    
    // Recharger la liste
    afficherMesCommandes();
    
  } catch (error) {
    alert('Erreur lors de l\'annulation: ' + error.message);
  }
};
```

### 4. CSS suggéré

```css
.commande-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
}

.commande-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.badge {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.badge-warning { background: #fff3cd; color: #856404; }
.badge-success { background: #d4edda; color: #155724; }
.badge-info { background: #d1ecf1; color: #0c5460; }
.badge-danger { background: #f8d7da; color: #721c24; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.articles-list {
  margin: 20px 0;
}

.article-item {
  display: flex;
  gap: 15px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  margin-bottom: 10px;
}

.article-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

.commande-footer {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.statut-message {
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
}

.statut-message.warning { background: #fff3cd; border-left: 4px solid #ffc107; }
.statut-message.success { background: #d4edda; border-left: 4px solid #28a745; }
.statut-message.info { background: #d1ecf1; border-left: 4px solid #17a2b8; }

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  position: relative;
  opacity: 0.5;
}

.timeline-item.complete {
  opacity: 1;
}

.timeline-item.actuel {
  opacity: 1;
  font-weight: bold;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.timeline-item.complete .timeline-marker {
  background: #28a745;
  color: white;
}
```

## Points clés

✅ **Sécurité:** Chaque utilisateur ne voit que ses propres commandes  
✅ **Temps réel:** Statuts mis à jour automatiquement  
✅ **Historique complet:** Toutes les dates enregistrées  
✅ **Actions:** Annulation possible selon le statut  
✅ **Factures:** Téléchargement direct depuis l'interface  

---

# Endpoints Admin

## 1. GET /api/admin/commandes - Liste des commandes

**Autorisation:** Admin

**Query params:** `?page=1&limit=20&statut=en_attente&search=dupont`

**Réponse (200):**

```json
{
  "success": true,
  "data": {
    "commandes": [
      {
        "id": 1,
        "user_id": null,
        "nom_complet": "Jean Dupont",
        "email": "jean.dupont@example.com",
        "telephone": "0555123456",
        "total": 5100.00,
        "statut": "en_attente",
        "date_creation": "2025-01-15T10:30:00.000Z",
        "user": null,
        "articles": [
          {
            "id": 1,
            "nom_produit": "T-Shirt Premium",
            "quantite": 2,
            "sous_total": 3000.00,
            "produit": {
              "id": 1,
              "nom": "T-Shirt Premium",
              "image_avant": "https://..."
            }
          }
        ]
      },
      {
        "id": 2,
        "user_id": 5,
        "nom_complet": "Marie Martin",
        "email": "marie@example.com",
        "total": 3200.00,
        "statut": "confirmee",
        "date_creation": "2025-01-15T09:15:00.000Z",
        "user": {
          "id": 5,
          "nom": "Martin",
          "prenom": "Marie",
          "email": "marie@example.com"
        },
        "articles": [...]
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  }
}
```

---

## 2. POST /api/admin/commandes/:id/confirmer - Confirmer une commande

**Autorisation:** Admin

**Conditions:** Statut doit être `en_attente`

**Réponse (200):**

```json
{
  "success": true,
  "message": "Commande confirmée avec succès. Email envoyé au client.",
  "data": {
    "id": 1,
    "statut": "confirmee",
    "nom_complet": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "total": 5100.00,
    ...
  }
}
```

**Action:** Statut → `confirmee`, email envoyé au client avec facture (si uploadée)

**Workflow:**
1. Admin reçoit email
2. Appelle le client
3. (Optionnel) Upload facture
4. Confirme la commande

---

## 3. POST /api/admin/commandes/:id/facture - Uploader une facture

**Autorisation:** Admin

**Body:** FormData avec `facture` (PDF, max 10MB)

**Réponse (200):**

```json
{
  "success": true,
  "message": "Facture uploadée avec succès",
  "data": {
    "id": 1,
    "facture": "https://res.cloudinary.com/dtbfppoys/raw/upload/v1234567890/factures/facture_001.pdf",
    ...
  }
}
```

---

## 4. PATCH /api/admin/commandes/:id/statut - Mettre à jour le statut

**Autorisation:** Admin

**Body:**

```json
{
  "statut": "expediee",
  "numero_suivi": "YAL123456789"
}
```

**Statuts:** `en_attente`, `confirmee`, `expediee`, `livree`, `annulee`

**Actions selon statut:**
- `expediee` → Email au client (pas de lien tracking)
- `livree` → Email au client, date enregistrée
- `annulee` → Stock restauré, pas d'email

**Réponse (200):**

```json
{
  "success": true,
  "message": "Statut de la commande mis à jour",
  "data": {
    "id": 1,
    "statut": "expediee",
    "numero_suivi": "YAL123456789",
    "date_mise_a_jour": "2025-01-16T14:20:00.000Z",
    ...
  }
}
```

---

## 4. DELETE /api/admin/commandes/:id - Supprimer une commande

**Autorisation:** Admin

**Conditions:** Commande doit être `annulee`

**Réponse (200):**

```json
{
  "success": true,
  "message": "Commande supprimée avec succès"
}
```

**Action:** Suppression facture (Cloudinary), articles, puis commande

---

# Récapitulatif

## Endpoints Client

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/commandes` | Public | Créer commande + upload facture PDF |
| GET | `/api/commandes/:id?email=...` | Public/Privé | Consulter UNE commande spécifique |
| GET | `/api/commandes` | **Privé** | **Mes commandes** - Liste toutes MES commandes (suivi) |
| PATCH | `/api/commandes/:id/statut` | Privé | Annuler MA commande (stock restauré) |

### 📝 Différence importante

**GET /api/commandes/:id** → Une commande spécifique (besoin email si non connecté)  
**GET /api/commandes** → TOUTES mes commandes si connecté (pagination incluse)

## Endpoints Admin

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/commandes` | Liste (filtres: statut, search, page, limit) |
| POST | `/api/admin/commandes/:id/confirmer` | Confirmer (email → client avec facture) |
| PATCH | `/api/admin/commandes/:id/statut` | Changer statut + emails auto |
| DELETE | `/api/admin/commandes/:id` | Supprimer (si annulée uniquement) |

## Emails automatiques

| Événement | → | Contenu |
|-----------|---|---------|
| Création | Admin | Nouvelle commande + détails + lien facture |
| Confirmation | Client | Récap + lien facture PDF |
| Expédition | Client | Notif (pas de tracking link) |
| Livraison | Client | Confirmation |

## Points clés

- **Facture** uploadée par le client lors de la création (PDF obligatoire, max 10MB)
- **Stock** décrémenté à création, restauré si annulée
- **Emails** non-bloquants (erreur email ≠ échec opération)
- **Transitions** recommandées: `en_attente` → `confirmee` → `expediee` → `livree`

---

**Dernière mise à jour:** Janvier 2025  
**Version:** 2.0 - Système de confirmation
