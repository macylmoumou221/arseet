# 📧 EMAIL VERIFICATION - Guide d'implémentation

## ✅ Fonctionnalités ajoutées

### 1. Vérification d'email obligatoire lors de l'inscription
- Lors de l'inscription, un token de vérification unique est généré
- Un email avec un lien de confirmation est envoyé à l'utilisateur
- L'utilisateur ne peut pas se connecter tant que son email n'est pas vérifié
- Le lien de vérification expire après 24 heures

### 2. Nouveaux champs dans le modèle User
- `email_verifie` (BOOLEAN, défaut: false)
- `token_verification` (STRING, nullable)
- `token_verification_expiration` (DATE, nullable)

### 3. Nouveaux endpoints

#### GET /api/auth/verify-email/:token
Vérifie l'email avec le token reçu par email.

#### POST /api/auth/resend-verification
Renvoie un nouvel email de vérification si le précédent a expiré.

### 4. Templates d'email professionnels
- Email de confirmation avec bouton CTA
- Email de bienvenue après vérification
- Design responsive et moderne

---

## 🔧 Configuration SendGrid

### 1. Créer un compte SendGrid
1. Allez sur https://signup.sendgrid.com/
2. Créez un compte gratuit (100 emails/jour)
3. Vérifiez votre email

### 2. Obtenir une API Key
1. Allez dans Settings → API Keys
2. Cliquez sur "Create API Key"
3. Nom: "Arseet Backend"
4. Permissions: "Full Access"
5. Copiez la clé (commence par "SG.")

### 3. Vérifier votre domaine d'envoi (Sender Verification)
1. Allez dans Settings → Sender Authentication
2. Cliquez sur "Verify a Single Sender"
3. Remplissez le formulaire avec votre email
4. Vérifiez votre email
5. Utilisez cet email comme `SENDGRID_FROM_EMAIL`

### 4. Mettre à jour le fichier .env
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=votre-email-verifie@gmail.com
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 Comment tester

### Scénario 1 : Inscription avec SendGrid configuré

**1. Inscription**
```bash
curl -X POST http://localhost:5000/api/auth/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "email": "test@example.com",
    "mot_de_passe": "Password123"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Inscription réussie. Un email de confirmation a été envoyé à votre adresse.",
  "data": {
    "user": {
      "email_verifie": false
    },
    "requiresEmailVerification": true
  }
}
```

**2. Vérifier votre boîte email**
- Vous devriez recevoir un email avec un bouton "Confirmer mon email"
- Cliquez sur le bouton ou copiez le lien

**3. Le lien redirige vers :**
```
http://localhost:3000/verify-email/abc123...
```

**4. Votre frontend doit appeler :**
```bash
curl http://localhost:5000/api/auth/verify-email/abc123...
```

**Réponse :**
```json
{
  "success": true,
  "message": "Email vérifié avec succès !",
  "data": {
    "user": {
      "email_verifie": true
    },
    "token": "eyJhbGci..."
  }
}
```

**5. Tentative de connexion AVANT vérification**
```bash
curl -X POST http://localhost:5000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "mot_de_passe": "Password123"
  }'
```

**Réponse (403 Forbidden) :**
```json
{
  "success": false,
  "message": "Veuillez confirmer votre email avant de vous connecter."
}
```

**6. Connexion APRÈS vérification**
Même commande → ✅ Succès avec token JWT

---

### Scénario 2 : Sans SendGrid (mode développement)

Si SendGrid n'est pas configuré :
1. L'inscription réussit quand même
2. Le lien de vérification est affiché dans la console du serveur :
```
⚠️ SendGrid non configuré - Email de vérification non envoyé
🔗 URL de vérification (pour test): http://localhost:3000/verify-email/abc123...
```
3. Copiez ce lien et testez-le manuellement

---

### Scénario 3 : Renvoyer l'email de vérification

Si l'utilisateur n'a pas reçu l'email ou s'il a expiré :

```bash
curl -X POST http://localhost:5000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Un nouvel email de vérification a été envoyé"
}
```

---

## 📱 Intégration Frontend

### Page de vérification d'email

```jsx
// /verify-email/[token].jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:5000/api/auth/verify-email/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStatus('success');
            // Sauvegarder le token JWT
            localStorage.setItem('token', data.data.token);
            // Rediriger après 3 secondes
            setTimeout(() => router.push('/'), 3000);
          } else {
            setStatus('error');
          }
        })
        .catch(() => setStatus('error'));
    }
  }, [token]);

  return (
    <div>
      {status === 'loading' && <p>Vérification en cours...</p>}
      {status === 'success' && <p>✅ Email vérifié ! Redirection...</p>}
      {status === 'error' && <p>❌ Lien invalide ou expiré</p>}
    </div>
  );
}
```

### Bouton "Renvoyer l'email"

```jsx
const resendVerification = async (email) => {
  const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  alert(data.message);
};
```

---

## 🔒 Sécurité

- ✅ Token de vérification aléatoire et unique (32 bytes)
- ✅ Expiration automatique après 24 heures
- ✅ Token supprimé après vérification
- ✅ Impossible de se connecter sans email vérifié
- ✅ Pas de fuite d'information (même message d'erreur si email inexistant)

---

## 📊 Base de données

Les nouveaux champs seront automatiquement créés par Sequelize lors du premier démarrage du serveur.

Si vous avez déjà des utilisateurs en base :
```sql
ALTER TABLE users 
ADD COLUMN email_verifie BOOLEAN DEFAULT FALSE,
ADD COLUMN token_verification VARCHAR(255),
ADD COLUMN token_verification_expiration DATETIME;

-- Marquer les anciens comptes comme vérifiés
UPDATE users SET email_verifie = TRUE WHERE date_creation < NOW();
```

---

## ✅ Checklist de mise en production

- [ ] SendGrid configuré avec vraie API Key
- [ ] Domaine d'envoi vérifié dans SendGrid
- [ ] Variable `FRONTEND_URL` correcte en production
- [ ] Templates d'email personnalisés avec logo/branding
- [ ] Page frontend de vérification d'email créée
- [ ] Gestion des erreurs (lien expiré, etc.)
- [ ] Tests complets du flow d'inscription

---

## 🎯 Prochaines améliorations possibles

- [ ] Reset de mot de passe par email
- [ ] Notifications par email pour les commandes
- [ ] Email de relance pour paniers abandonnés
- [ ] Notifications de promotions/newsletter

---

**Tout est prêt ! Le système de vérification d'email fonctionne avec SendGrid.** 🚀
