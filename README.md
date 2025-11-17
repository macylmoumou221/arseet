# Arseet — Full project (Client + Server)

English / Français

---

English
-------

Arseet is a full‑stack e‑commerce project (Next.js frontend + Node/Express backend). This repository contains the `client/` (Next.js, TypeScript, Tailwind) and `server/` (Node.js, Express, MySQL/Sequelize) folders.

Quick start (development):

1. Server
   - Open a terminal and go to `server/`
   - Install dependencies: `npm install`
   - Copy `.env.example` to `.env` and fill the required environment variables (DB, JWT_SECRET, Cloudinary, Firebase, SendGrid keys)
   - Start dev server: `npm run dev` (or `nodemon server.js` if configured)

2. Client
   - Open a terminal and go to `client/`
   - Install dependencies: `npm install`
   - Create `.env.local` and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000` (adjust as needed)
   - Start Next dev server: `npm run dev`

Important notes:
- Product images and media are stored on Cloudinary.
- PDFs / invoices (factures) are uploaded to Firebase Storage by the server.
- SendGrid (`@sendgrid/mail`) is used for sending emails (verification, orders, newsletters).

Author / Auteur: Macyl MOUMOU

---

Français
-------

Arseet est un projet e‑commerce full‑stack (frontend Next.js + backend Node/Express). Le dépôt contient les dossiers `client/` (Next.js, TypeScript, Tailwind) et `server/` (Node.js, Express, MySQL/Sequelize).

Démarrage rapide (développement) :

1. Serveur
   - Ouvrir un terminal et aller dans `server/`
   - Installer les dépendances : `npm install`
   - Copier `.env.example` vers `.env` et remplir les variables d'environnement nécessaires (BDD, JWT_SECRET, clés Cloudinary, Firebase, SendGrid)
   - Lancer en dev : `npm run dev` (ou `nodemon server.js` si configuré)

2. Client
   - Ouvrir un terminal et aller dans `client/`
   - Installer les dépendances : `npm install`
   - Créer `.env.local` et définir `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000` (adapter si nécessaire)
   - Lancer Next en dev : `npm run dev`

Points importants :
- Les images et médias produits sont stockés sur Cloudinary.
- Les fichiers PDF / factures sont uploadés sur Firebase Storage par le backend.
- SendGrid (`@sendgrid/mail`) est utilisé pour l'envoi des emails (vérification, commandes, newsletters).

Auteur : Macyl MOUMOU
