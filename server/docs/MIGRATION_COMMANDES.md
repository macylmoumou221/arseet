# 📋 Migration - Système de confirmation de commandes

## 🎯 Objectif

Mettre en place un workflow de confirmation de commandes avec les étapes suivantes:
1. **en_attente** - Nouvelle commande reçue (email envoyé à l'admin)
2. **confirmee** - Admin a validé la commande (email envoyé au client)
3. **expediee** - Commande expédiée (email envoyé au client)
4. **livree** - Commande livrée

## 🔧 Modifications nécessaires

### 1. Modification de la base de données

Exécutez cette commande SQL pour mettre à jour le modèle de commande:

```sql
-- Modifier l'ENUM du statut
ALTER TABLE commandes 
MODIFY COLUMN statut ENUM('en_attente', 'confirmee', 'expediee', 'livree', 'annulee') 
NOT NULL 
DEFAULT 'en_attente'
COMMENT 'en_attente: nouvelle commande | confirmee: admin a confirmé | expediee: en cours de livraison | livree: reçue | annulee: annulée';
```

**⚠️ IMPORTANT:** Si vous avez déjà des commandes avec le statut `en_cours`, exécutez d'abord:

```sql
-- Option 1: Garder les commandes existantes en "en_attente" (elles nécessiteront confirmation)
UPDATE commandes SET statut = 'en_attente' WHERE statut = 'en_cours';

-- OU Option 2: Les marquer directement comme "confirmee" (pas besoin de confirmation)
UPDATE commandes SET statut = 'confirmee' WHERE statut = 'en_cours';
```

### 2. Configuration environnement

Ajoutez cette ligne dans votre fichier `.env`:

```bash
# Email de l'admin pour recevoir les notifications de nouvelles commandes
ADMIN_EMAIL=admin@arseet.com
```

Si vous n'ajoutez pas `ADMIN_EMAIL`, les emails admin seront envoyés à `GMAIL_USER` par défaut.

### 3. Vérification

Après la migration, vérifiez les commandes:

```sql
SELECT 
  statut, 
  COUNT(*) as nombre_commandes 
FROM commandes 
GROUP BY statut;
```

## 📧 Workflow des emails

### Nouvelle commande (Client → API)
```
POST /api/commandes
→ Statut: en_attente
→ Email à: ADMIN (ADMIN_EMAIL ou GMAIL_USER)
→ Contenu: Détails complets de la commande
```

### Confirmation (Admin → Dashboard)
```
POST /api/admin/commandes/:id/confirmer
→ Statut: en_attente → confirmee
→ Email à: Client (email de la commande)
→ Contenu: Confirmation + facture (si uploadée)
```

### Expédition (Admin → Dashboard)
```
PATCH /api/admin/commandes/:id/statut
Body: { "statut": "expediee" }
→ Email à: Client
→ Contenu: Notification d'expédition (PAS de lien de suivi)
```

### Livraison (Admin → Dashboard)
```
PATCH /api/admin/commandes/:id/statut
Body: { "statut": "livree" }
→ Email à: Client
→ Contenu: Mise à jour de statut
```

## 🚀 Nouveaux endpoints

### Confirmer une commande (Admin)
```http
POST /api/admin/commandes/:id/confirmer
Authorization: Bearer <admin_token>

Réponse:
{
  "success": true,
  "message": "Commande confirmée avec succès. Email envoyé au client.",
  "data": { ... }
}
```

### Statuts disponibles (Admin)
```http
PATCH /api/admin/commandes/:id/statut
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "statut": "confirmee|expediee|livree|annulee"
}
```

## ✅ Tests recommandés

1. **Créer une commande**:
   - Vérifier que le statut est `en_attente`
   - Vérifier que l'admin reçoit un email

2. **Confirmer la commande**:
   - Appeler `POST /api/admin/commandes/:id/confirmer`
   - Vérifier que le statut passe à `confirmee`
   - Vérifier que le client reçoit un email

3. **Expédier la commande**:
   - Appeler `PATCH /api/admin/commandes/:id/statut` avec `{"statut": "expediee"}`
   - Vérifier que le client reçoit l'email d'expédition

4. **Livraison**:
   - Mettre à jour le statut à `livree`
   - Vérifier le changement

## 📌 Notes importantes

- ✅ Les emails sont **non-bloquants** - si l'envoi échoue, la commande est quand même créée/mise à jour
- ✅ Les anciennes commandes `en_cours` doivent être migrées manuellement
- ✅ Le stock est décrémenté dès la création de la commande (`en_attente`)
- ✅ En cas d'annulation, le stock est automatiquement restauré
- ❌ Pas de lien de suivi dans les emails (comme demandé)

## 🔄 Workflow complet

```
┌─────────────────┐
│ Client commande │
└────────┬────────┘
         │ POST /api/commandes
         ▼
    [en_attente] ──────────────► 📧 Email à l'admin
         │
         │ Admin appelle le client
         │ et vérifie les détails
         ▼
         │ POST /api/admin/commandes/:id/confirmer
         ▼
     [confirmee] ───────────────► 📧 Email au client (+ facture)
         │
         │ Admin prépare et expédie
         ▼
         │ PATCH statut → "expediee"
         ▼
     [expediee] ────────────────► 📧 Email au client
         │
         │ Livraison effectuée
         ▼
         │ PATCH statut → "livree"
         ▼
      [livree] ─────────────────► 📧 Email au client
```

## ❓ FAQ

**Q: Que se passe-t-il si je ne confirme pas une commande?**  
R: Elle reste à `en_attente` indéfiniment. Le client n'est pas notifié.

**Q: Puis-je passer directement de `en_attente` à `expediee`?**  
R: Techniquement oui, mais le workflow recommandé est de passer par `confirmee` pour que le client reçoive l'email de confirmation.

**Q: Puis-je uploader la facture après la confirmation?**  
R: Oui, vous pouvez uploader la facture à n'importe quel moment via `POST /api/admin/commandes/:id/facture`.

**Q: Comment annuler une commande?**  
R: Utilisez `PATCH /api/admin/commandes/:id/statut` avec `{"statut": "annulee"}`. Le stock sera automatiquement restauré.
