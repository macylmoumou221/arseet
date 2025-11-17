# 🚀 Arseet E-commerce Backend

Backend Node.js + Express pour site e-commerce avec gestion complète des produits, commandes, utilisateurs et newsletter.

## 📋 Fonctionnalités

- ✅ Authentification JWT (inscription, connexion, profil)
- ✅ Gestion produits avec upload d'images sur **Cloudinary**
- ✅ Système de commandes avec validation de stock
- ✅ Newsletter avec **SendGrid**
- ✅ Panneau d'administration complet
- ✅ Rate limiting et sécurité renforcée
- ✅ Validation complète des données
- ✅ Base de données MySQL avec Sequelize ORM

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de données relationnelle
- **Sequelize** - ORM
- **JWT** - Authentification
- **Bcrypt** - Hash des mots de passe
- **Cloudinary** - Stockage d'images
- **SendGrid** - Envoi d'emails
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Express-validator** - Validation des données
- **Express-rate-limit** - Protection DDoS

## 📦 Installation

### Prérequis

- Node.js >= 14.x
- MySQL >= 5.7
- Compte Cloudinary (gratuit)
- Compte SendGrid (gratuit)

### Étapes

1. **Cloner ou naviguer dans le projet**
```bash
cd server
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env` et remplir les valeurs:

```bash
cp .env.example .env
```

Éditer `.env`:
```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=arseet_ecommerce
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# SendGrid
SENDGRID_API_KEY=votre_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@arseet.com
```

4. **Créer la base de données**

Exécuter le script SQL:
```bash
mysql -u root -p < scripts/database.sql
```

Ou manuellement:
```sql
CREATE DATABASE arseet_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Démarrer le serveur**

Développement (avec nodemon):
```bash
npm run dev
```

Production:
```bash
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 📁 Structure du projet

```
server/
├── config/
│   ├── db.js              # Configuration MySQL/Sequelize
│   ├── cloudinary.js      # Configuration Cloudinary
│   └── sendgrid.js        # Configuration SendGrid
├── models/
│   ├── user.js            # Modèle User
│   ├── produit.js         # Modèle Produit
│   ├── couleurs_produits.js
│   ├── tailles_produits.js
│   ├── commande.js        # Modèle Commande
│   ├── articles_commande.js
│   ├── newsletter.js
│   └── index.js
├── controllers/
│   ├── authController.js
│   ├── produitsController.js
│   ├── commandesController.js
│   ├── newsletterController.js
│   └── adminController.js
├── routes/
│   ├── authRoutes.js
│   ├── produitsRoutes.js
│   ├── commandesRoutes.js
│   ├── newsletterRoutes.js
│   └── adminRoutes.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── validationMiddleware.js
│   └── errorHandler.js
├── scripts/
│   └── database.sql       # Script SQL
├── server.js              # Point d'entrée
├── package.json
├── .env.example
├── .gitignore
└── API_DOCUMENTATION.md   # Documentation complète
```

## 🔑 Compte Admin par défaut

Après l'exécution du script SQL, un compte admin est créé:

- **Email**: `admin@arseet.com`
- **Mot de passe**: `Admin123`

⚠️ **Changez ces identifiants en production!**

## 📚 Documentation API

Consultez [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour la documentation complète des endpoints.

### Endpoints principaux

- **Auth**: `/api/auth/*`
- **Produits**: `/api/produits/*`
- **Commandes**: `/api/commandes/*`
- **Newsletter**: `/api/newsletter/*`
- **Admin**: `/api/admin/*`

## 🧪 Tests

### Test de santé
```bash
curl http://localhost:5000/api/health
```

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

## 🔒 Sécurité

- ✅ Hash des mots de passe avec bcrypt
- ✅ JWT pour authentification
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet pour sécurité HTTP
- ✅ Validation complète des entrées
- ✅ Protection CORS
- ✅ Gestion centralisée des erreurs

## 🌍 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Hôte MySQL | localhost |
| `DB_NAME` | Nom de la BDD | arseet_ecommerce |
| `JWT_SECRET` | Clé secrète JWT | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `SENDGRID_API_KEY` | Clé API SendGrid | - |
| `FRONTEND_URL` | URL du frontend | http://localhost:3000 |
| `RATE_LIMIT_MAX_REQUESTS` | Limite de requêtes | 100 |

## 🚧 À faire / Extensions possibles

- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
- [ ] Cache Redis
- [ ] Logs avec Winston
- [ ] Notifications en temps réel (Socket.io)
- [ ] Export de données (CSV, PDF)
- [ ] Statistiques avancées

## 📞 Support

Pour toute question ou problème:
- Email: admin@arseet.com
- Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 📄 Licence

ISC

---

**Développé avec ❤️ pour Arseet E-commerce**
