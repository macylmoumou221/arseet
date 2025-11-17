# 🚀 Guide de Démarrage Rapide - Système de Confirmation de Commandes

## ⚡ Configuration en 3 étapes

### Étape 1: Mettre à jour la base de données

Connectez-vous à MySQL et exécutez:

```sql
USE arseet;  -- ou le nom de votre base

ALTER TABLE commandes 
MODIFY COLUMN statut ENUM('en_attente', 'confirmee', 'expediee', 'livree', 'annulee') 
NOT NULL 
DEFAULT 'en_attente';
```

### Étape 2: Configurer l'email admin

Ajoutez dans votre fichier `.env`:

```bash
ADMIN_EMAIL=votre-email-admin@arseet.com
```

### Étape 3: Redémarrer le serveur

```bash
npm run dev
```

---

## ✅ C'est tout! Le système est prêt.

## 📝 Utilisation

### Pour tester:

1. **Créer une commande** (via Postman/Insomnia):
```http
POST http://localhost:5000/api/commandes
Content-Type: application/json

{
  "nom_complet": "Test Client",
  "email": "client@test.com",
  "telephone": "0555123456",
  "adresse_livraison": "123 Rue Test",
  "ville": "Alger",
  "wilaya": "Alger",
  "methode_livraison": "domicile",
  "articles": [
    {
      "produit_id": 1,
      "quantite": 2
    }
  ]
}
```

**Résultat:** 
- ✅ Statut: `en_attente`
- ✅ Email envoyé à `ADMIN_EMAIL`

---

2. **Confirmer la commande** (Admin uniquement):
```http
POST http://localhost:5000/api/admin/commandes/1/confirmer
Authorization: Bearer <admin_token>
```

**Résultat:**
- ✅ Statut: `confirmee`
- ✅ Email envoyé au client

---

3. **Marquer comme expédiée**:
```http
PATCH http://localhost:5000/api/admin/commandes/1/statut
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "statut": "expediee"
}
```

**Résultat:**
- ✅ Statut: `expediee`
- ✅ Email d'expédition envoyé au client

---

## 📊 Workflow visuel

```
Client commande
       ↓
  [en_attente] → 📧 Admin reçoit un email
       ↓
   (Admin appelle le client)
       ↓
  POST /confirmer
       ↓
   [confirmee] → 📧 Client reçoit confirmation + facture
       ↓
   (Admin expédie)
       ↓
  PATCH statut
       ↓
   [expediee] → 📧 Client reçoit notification
       ↓
   [livree]
```

---

## 🔍 Vérifier les commandes en attente

```http
GET http://localhost:5000/api/admin/commandes?statut=en_attente
Authorization: Bearer <admin_token>
```

---

## 📚 Documentation complète

- `SYSTEME_CONFIRMATION_COMMANDES.md` - Vue d'ensemble complète
- `MIGRATION_COMMANDES.md` - Guide de migration détaillé
- `API_DOCUMENTATION.md` - Documentation API

---

## ❓ Besoin d'aide?

Consultez la FAQ dans `MIGRATION_COMMANDES.md`
