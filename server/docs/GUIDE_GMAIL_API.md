# 📧 Guide Gmail API - Configuration Complète

## 📋 Vue d'ensemble

Le backend Arseet utilise maintenant **Gmail API avec OAuth2** pour envoyer tous les emails (vérification, bienvenue, commandes, newsletter).

### ✨ Avantages de Gmail API vs SendGrid

- ✅ **Gratuit** : Pas de limite avec votre compte Gmail
- ✅ **Fiable** : Meilleure délivrabilité (pas de spam)
- ✅ **Professionnel** : Emails envoyés depuis votre propre adresse Gmail
- ✅ **Sécurisé** : OAuth2 au lieu de clés API
- ✅ **Simple** : Pas besoin de vérifier un domaine

---

## 🚀 Configuration Rapide (10 minutes)

### Étape 1: Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquer sur **"Select a project"** → **"New Project"**
3. Nom du projet: `Arseet Backend` (ou autre)
4. Cliquer sur **"Create"**

### Étape 2: Activer Gmail API

1. Dans le menu ☰ → **"APIs & Services"** → **"Enable APIs and Services"**
2. Rechercher **"Gmail API"**
3. Cliquer sur **"Enable"**

### Étape 3: Créer des Credentials OAuth2

1. Menu ☰ → **"APIs & Services"** → **"Credentials"**
2. Cliquer sur **"Create Credentials"** → **"OAuth client ID"**
3. Si demandé, configurer l'écran de consentement:
   - User Type: **External**
   - App name: `Arseet E-commerce`
   - User support email: votre email
   - Developer contact: votre email
   - Scopes: Laisser vide pour l'instant
   - Test users: Ajouter votre email Gmail
4. Revenir à Credentials → **"Create Credentials"** → **"OAuth client ID"**
5. Application type: **"Desktop app"**
6. Name: `Arseet Backend Client`
7. Cliquer sur **"Create"**

### Étape 4: Télécharger les Credentials

1. Une popup apparaît avec **Client ID** et **Client Secret**
2. Cliquer sur **"Download JSON"** (optionnel)
3. **COPIER** les valeurs Client ID et Client Secret

### Étape 5: Configurer .env

Créer/modifier le fichier `.env` :

```bash
# Gmail API Configuration
GMAIL_USER=votre-email@gmail.com
GMAIL_CLIENT_ID=123456789.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-abc123def456
GMAIL_REDIRECT_URI=http://localhost:3000
GMAIL_REFRESH_TOKEN=  # On va l'obtenir à l'étape suivante

# App Name
APP_NAME=Arseet E-commerce
```

### Étape 6: Obtenir le Refresh Token

```bash
# Exécuter le script helper
node scripts/get-gmail-token.js
```

Le script va:
1. Afficher une URL à ouvrir dans votre navigateur
2. Vous demander d'autoriser l'application
3. Vous donner un code à copier
4. Générer le **Refresh Token** à copier dans `.env`

**Exemple:**
```
1. Ouvrir: https://accounts.google.com/o/oauth2/v2/auth?...
2. Se connecter à votre compte Gmail
3. Cliquer sur "Autoriser"
4. Copier le code: 4/0AY0e...
5. Coller dans le terminal
6. Copier le REFRESH_TOKEN dans .env
```

### Étape 7: Tester

```bash
# Redémarrer le serveur
npm run dev

# Tester l'inscription
POST http://localhost:5000/api/auth/inscription
{
  "nom": "Test",
  "prenom": "User",
  "email": "test@example.com",
  "mot_de_passe": "Test1234"
}
```

Vous devriez recevoir un email avec le code de vérification ! ✅

---

## 🔧 Configuration Détaillée

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `GMAIL_USER` | Email Gmail utilisé pour envoyer | `arseet.shop@gmail.com` |
| `GMAIL_CLIENT_ID` | Client ID OAuth2 | `123...xyz.apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | Client Secret OAuth2 | `GOCSPX-abc123...` |
| `GMAIL_REDIRECT_URI` | URI de redirection | `http://localhost:3000` |
| `GMAIL_REFRESH_TOKEN` | Refresh Token (ne expire jamais) | `1//04abc123...` |
| `APP_NAME` | Nom de l'app dans les emails | `Arseet E-commerce` |

### Scopes Gmail requis

```javascript
https://mail.google.com/
```

Ce scope permet d'envoyer des emails via Gmail API.

---

## 📧 Emails Envoyés

### 1. Email de Vérification (Inscription)

**Quand:** Lors de l'inscription d'un nouvel utilisateur

**Contenu:**
- Code de vérification à 8 chiffres
- Expire après 15 minutes
- Design professionnel avec logo

**Fonction:** `sendVerificationEmail(to, nom, prenom, code)`

### 2. Email de Bienvenue

**Quand:** Après vérification du code

**Contenu:**
- Message de bienvenue personnalisé
- Avantages du compte
- Call-to-action

**Fonction:** `sendWelcomeEmail(to, nom, prenom)`

### 3. Confirmation de Commande

**Quand:** Création d'une nouvelle commande

**Contenu:**
- Numéro de commande
- Détails de la commande
- Adresse de livraison
- Total

**Fonction:** `sendOrderConfirmation(to, orderData)`

### 4. Mise à Jour de Commande

**Quand:** Changement de statut de commande

**Contenu:**
- Nouveau statut
- Numéro de suivi (si disponible)
- Message personnalisé

**Fonction:** `sendOrderStatusUpdate(to, orderData)`

---

## 💻 Utilisation dans le Code

### Importer les fonctions

```javascript
const { 
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate 
} = require('../config/gmail');
```

### Envoyer un email de vérification

```javascript
await sendVerificationEmail(
  'user@example.com',
  'Jean',
  'Dupont',
  '12345678'
);
```

### Envoyer une confirmation de commande

```javascript
const orderData = {
  id: 42,
  nom_complet: 'Jean Dupont',
  total: '5000.00',
  adresse_livraison: 'Rue de la République',
  ville: 'Alger',
  wilaya: 'Alger',
  methode_livraison: 'domicile'
};

await sendOrderConfirmation('user@example.com', orderData);
```

### Email personnalisé

```javascript
const { sendEmail } = require('../config/gmail');

await sendEmail({
  to: 'user@example.com',
  subject: 'Votre facture',
  html: '<h1>Facture</h1><p>...</p>',
  text: 'Facture\n\n...'
});
```

---

## 🐛 Troubleshooting

### Erreur: "Gmail API non configuré"

**Cause:** Variables d'environnement manquantes

**Solution:**
```bash
# Vérifier que toutes les variables sont dans .env
GMAIL_USER=...
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REDIRECT_URI=...
GMAIL_REFRESH_TOKEN=...
```

### Erreur: "Invalid grant"

**Cause:** Refresh token expiré ou invalide

**Solution:**
1. Révoquer l'accès sur [Google Account Permissions](https://myaccount.google.com/permissions)
2. Réexécuter `node scripts/get-gmail-token.js`
3. Obtenir un nouveau refresh token

### Erreur: "Access denied"

**Cause:** Gmail API non activée

**Solution:**
1. Google Cloud Console → APIs & Services
2. Vérifier que Gmail API est activée
3. Vérifier que l'email est dans les test users (si app en mode Test)

### Emails ne sont pas envoyés

**Cause:** Mode test sans configuration

**Solution:**
- Si Gmail n'est pas configuré, les codes s'affichent dans la console
- C'est normal en développement
- Vérifier les logs du serveur : `🔢 Code de vérification (pour test): 12345678`

---

## 🔒 Sécurité

### ⚠️ Importantes Recommandations

1. **NE JAMAIS committer `.env`**
   ```bash
   # Ajouter dans .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Protéger le Refresh Token**
   - Le refresh token ne expire jamais (sauf révocation)
   - Le traiter comme un mot de passe
   - Ne jamais le partager

3. **Limiter les scopes**
   - Utiliser uniquement `https://mail.google.com/`
   - Ne pas demander d'accès Gmail complet

4. **Mode Test vs Production**
   - En développement: App en mode "Testing" dans Google Cloud
   - En production: Publier l'app (vérification Google requise)

5. **Variables d'environnement en production**
   ```bash
   # Utiliser les variables d'environnement du serveur
   # Heroku, Railway, Render, etc.
   ```

---

## 📊 Limites et Quotas

### Gmail API Quotas (compte gratuit)

- **Par jour:** Illimité pour un compte Gmail normal
- **Par seconde:** ~250 requêtes/seconde
- **Par email:** Jusqu'à 2000 destinataires/jour pour comptes gratuits

### Recommandations

- Pour un petit e-commerce: Gmail API est parfait
- Pour grosse volumétrie (>1000 emails/jour): Considérer SendGrid, AWS SES
- Utiliser un compte Gmail professionnel (Google Workspace) pour plus de fiabilité

---

## 🧪 Tests

### Test manuel

```bash
# 1. Inscription
POST http://localhost:5000/api/auth/inscription
{
  "nom": "Test",
  "prenom": "User",
  "email": "your-email@gmail.com",
  "mot_de_passe": "Test1234"
}

# 2. Vérifier l'email reçu
# Copier le code à 8 chiffres

# 3. Vérification
POST http://localhost:5000/api/auth/verify-email
{
  "email": "your-email@gmail.com",
  "code": "12345678"
}

# 4. Vérifier l'email de bienvenue reçu
```

### Test avec script

```javascript
// test-gmail.js
const { sendVerificationEmail } = require('./config/gmail');

async function test() {
  try {
    await sendVerificationEmail(
      'your-email@gmail.com',
      'Test',
      'User',
      '88888888'
    );
    console.log('✅ Email envoyé!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

test();
```

---

## 📚 Ressources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth2 Playground](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Nodemailer Documentation](https://nodemailer.com/)

---

## 🎯 Checklist de Configuration

- [ ] Créer projet Google Cloud
- [ ] Activer Gmail API
- [ ] Configurer écran de consentement OAuth
- [ ] Créer credentials OAuth2 (Desktop app)
- [ ] Copier Client ID et Client Secret dans `.env`
- [ ] Exécuter `node scripts/get-gmail-token.js`
- [ ] Autoriser l'application dans le navigateur
- [ ] Copier Refresh Token dans `.env`
- [ ] Redémarrer le serveur
- [ ] Tester l'envoi d'email
- [ ] Vérifier réception de l'email
- [ ] Ajouter `.env` dans `.gitignore`

---

## 📝 Fichiers Modifiés

✅ `config/gmail.js` - Service Gmail API avec OAuth2
✅ `controllers/authController.js` - Utilise Gmail au lieu de SendGrid
✅ `controllers/commandesController.js` - Import Gmail
✅ `scripts/get-gmail-token.js` - Helper pour obtenir refresh token
✅ `.env.gmail.example` - Exemple de configuration
✅ `package.json` - googleapis et nodemailer installés

❌ `@sendgrid/mail` - Désinstallé
❌ Toutes références à SendGrid - Supprimées

---

**Status:** ✅ Gmail API opérationnel  
**Date:** 2025-11-07  
**Prêt pour:** Développement et Production (après configuration)
