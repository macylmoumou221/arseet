# Arseet — Full Project Documentation

## Overview
Arseet is a full‑stack e‑commerce website focused on streetwear. This document consolidates the project architecture, tech stack, hosting and storage choices, API flows, environment variables, developer setup and operational notes gathered from the `client/` and `server/` folders and the internal documentation found in `server/docs` and `client/DOCUMENTATION.md`.

This repo contains two main parts:
- `client/` — Next.js (React) frontend (TypeScript), TailwindCSS, many UI components and pages.
- `server/` — Node.js + Express backend, MySQL (Sequelize ORM), rich API and admin features.

Key platform decisions found in the repo:
- Product images/videos are stored on Cloudinary.
- PDFs and document files (invoices/factures) are hosted on Firebase Storage (server uses Firebase Admin SDK for PDF uploads and deletion).
- Email sending uses SendGrid (via `@sendgrid/mail`) as the active provider; the repository also contains Gmail API migration/notes but SendGrid is the production provider.

---

## Quick Facts / Contract
- Frontend: Next.js 16, React 19, TypeScript, TailwindCSS
- Backend: Node.js (Express), MySQL (mysql2 + Sequelize), JWT auth
- File storage: Cloudinary for images/videos; Firebase Storage for PDFs / document files
- Emails: SendGrid (`@sendgrid/mail`) is used for sending verification, order and newsletter emails (the repo contains Gmail API notes/scripts as historical/migration material).
- Auth: JWT tokens, bcrypt password hashing
- Product uploads: Admin uses multipart/form-data; images to Cloudinary. Customers upload order PDFs (factures) using multipart/form-data; server uploads those PDFs to Firebase.

Success criteria for the documentation produced here:
- Provides clear developer setup steps
- Describes file hosting and data flow (Cloudinary vs Firebase)
- Explains frontend↔backend coordination for auth, products, orders, file uploads
- Lists key environment variables and where to configure them

---

## Tech stack (extracted from package.json and docs)

Client
- Next.js 16 (React 19)
- TypeScript
- TailwindCSS + postcss
- Radix UI components, lucide-react, gsap, embla-carousel, sonner, react-hook-form
- Zustand for client state, jspdf included

Server
- Node.js + Express
- MySQL (mysql2) with Sequelize ORM
- JWT (jsonwebtoken), bcryptjs
- cloudinary and multer-storage-cloudinary (images)
- firebase-admin (Firebase Storage for PDFs)
 - `@sendgrid/mail` (SendGrid) — used for email sending in the current setup
 - `googleapis` + `nodemailer` and related Gmail helpers are present in docs/scripts as historical/migration material but are not the active provider
- express-validator, express-rate-limit, helmet, cors

Other tools
- nodemon for dev
- scripts to upload branding logo to Cloudinary; the repo contains Gmail-related helper scripts/docs (migration/experiments), but SendGrid is the primary email provider.

---

## Storage & Hosting choices (explicit)
- Cloudinary
  - All product images, brand images and images used in email templates are uploaded to Cloudinary.
  - `cloudinary` package is used server-side for image management. There are scripts (e.g., `scripts/upload-logo-to-cloudinary.js`) and config in `config/cloudinary.js`.
  - Cloudinary resource type `image`/`raw` used appropriately; images in `arseet_products/`, raw PDFs in `arseet_factures/` (historically), though PDFs were migrated to Firebase for storage in later docs.

- Firebase Storage
  - PDFs / invoices (factures) are hosted on Firebase Storage and served via public storage URLs (docs explain using `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_STORAGE_BUCKET`).
  - Server uses `firebase-admin` to upload PDF buffers (uploads from multipart `multer` memory storage) and to delete files when needed.
  - Server includes a `server/config/firebase.js` initializer and `server/docs/FIREBASE_SETUP_GUIDE.md` with instructions to add the service account JSON to env.

Notes: repository includes both Cloudinary and Firebase usage. Reading the docs shows a clear pattern: images remain on Cloudinary; document/PDF storage uses Firebase (cheaper / better for non-image files). Some earlier docs mention Cloudinary for PDFs (migration notes are present) — the canonical flow currently (per docs) is PDFs → Firebase.

---

## High-level architecture & flows

1) Frontend (Next.js) → Backend (Express API)
- The frontend uses an API client (`lib/api.ts`) to talk to the backend base URL (default `http://localhost:5000`). The frontend expects endpoints for auth, products, orders, user profile and admin operations.
- The client includes pages for products, product detail, cart, checkout/commande, profile, admin dashboard components and utilities for authentication.

2) Authentication
 - Signup flow: POST `/api/auth/inscription` → server creates user, generates 8-digit code, sends verification email (via SendGrid in production; the repo also contains Gmail API experiment/docs). User must verify (POST `/api/auth/verify-email` with email+code). JWT token returned on verification.
- Login flow: POST `/api/auth/connexion` → server validates and returns JWT.
- Protected endpoints require `Authorization: Bearer <token>`.

3) Product management (images)
- Admin creates/updates products via multipart/form-data to `/api/produits` with image fields: `image_avant`, `image_arriere`, `images[]`.
- Server receives files via multer + Cloudinary (multer-storage-cloudinary or manual cloudinary.uploader uploads) and stores resulting Cloudinary URLs in DB. Old Cloudinary URLs may be removed on update.
- Product payload includes `couleurs` and `tailles` fields sent as JSON string in form-data (important UX detail: send as Text fields containing stringified JSON when using multipart/form-data).

4) Orders & invoice PDF handling
- Clients create an order by POSTing to `/api/commandes` as multipart/form-data (the docs describe that the invoice PDF `facture` is required). The body contains `articles` as a JSON string and `facture` as a file input (PDF).
- Server receives the PDF (multer memory), uploads the PDF to Firebase Storage (using firebase-admin). The server stores the public Firebase Storage URL (or a signed URL) in the `commandes.facture` DB field.
- Workflow: new order is created with status `en_attente` and admin receives an email with details and a link to the invoice. Admin confirms, changes status to `confirmee` (POST `/api/admin/commandes/:id/confirmer`), then `expediee` and `livree` updates follow.
- Important detail: invoices are validated as PDF only, size limit ~10MB, server handles deletion of previous invoice when replaced.

5) Email sending
- Primary provider: SendGrid (via `@sendgrid/mail`) is used to send verification codes, welcome emails, order notifications and newsletters in the current setup.
- The repository contains migration/history notes and helper scripts for Gmail API (OAuth2) — these are documented (see `server/docs/GUIDE_GMAIL_API.md`) but do not reflect the active production provider.
- In dev mode, if the configured email provider (SendGrid) is not set up, verification codes are printed in server logs for manual testing.

6) Admin
- Admin routes allow product creation/update, order confirmation, uploading invoice (if necessary), managing users and newsletter subscribers.
- Admin-only endpoints use admin middleware which checks user role.

---

## API & Frontend coordination (practical notes)

- Base API URL: default `http://localhost:5000` (changeable via frontend `.env.local`)

Key endpoints used by the frontend:
- Auth
  - POST `/api/auth/inscription` – register (returns requiresEmailVerification)
  - POST `/api/auth/verify-email` – verify code + receive JWT
  - POST `/api/auth/connexion` – login and get JWT
  - GET/PUT `/api/auth/profil` – profile management

- Products
  - GET `/api/produits` (with pagination / filters)
  - GET `/api/produits/:id`
  - POST `/api/produits` (admin multipart/form-data)
  - PUT `/api/produits/:id` (admin multipart/form-data)

- Orders
  - POST `/api/commandes` (multipart/form-data with `articles` JSON string and `facture` PDF file)
  - GET `/api/commandes/:id?email=...` – public or owner permission
  - GET `/api/commandes` – user orders (auth required)
  - PATCH `/api/commandes/:id/statut` – update order status (admin or owner depending on action)

- Admin
  - `/api/admin/*` routes for admin dashboard, user management, newsletter management

Important frontend details
- When sending multipart requests with `couleurs` and `tailles`, the frontend must send stringified JSON in a Text field (not as JSON body) — Insomnia/Fetch/FormData examples exist in `server/docs`.
- Cart/hydration: client docs include fixes to avoid hydration mismatch for client-only UI (e.g., cart badge rendered only in browser lifecycle using useEffect flag).

---

## Environment variables (collected from README/docs/configs)

Server (representative list)
- PORT (default 5000)
- NODE_ENV
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- FIREBASE_SERVICE_ACCOUNT (stringified JSON service account for firebase-admin)
- FIREBASE_STORAGE_BUCKET
- SENDGRID_API_KEY  # SendGrid API key used in production
- SENDGRID_FROM_EMAIL  # sender address configured for SendGrid
- ADMIN_EMAIL
- RATE_LIMIT_MAX_REQUESTS (e.g., 100)
- RESET_PASSWORD_CODE_EXPIRATION_MINUTES

Note: the repository also contains Gmail-related variables and docs (GMAIL_USER, GMAIL_CLIENT_ID, etc.) as migration/experiment material, but they are optional and not required for the SendGrid setup.

Client (representative)
- NEXT_PUBLIC_API_BASE_URL (or use lib/get-base-url pattern)
- NEXT_PUBLIC_CLOUDINARY_BASE (if used client-side for direct image URLs)

Important: `FIREBASE_SERVICE_ACCOUNT` is suggested in docs to be kept as a single-line JSON string in env or securely in secret manager. The README in `server/docs` explains how to generate the service account JSON and use it.

---

## Notable docs & developer notes (where to look)
- `client/DOCUMENTATION.md` — frontend dev notes, fixes, examples for notifications and hydration fixes
- `server/README.md` — backend overview, installation, env list and API notes
- `server/docs/API_DOCUMENTATION.md` — extensive endpoint reference and examples
- `server/docs/FIREBASE_SETUP_GUIDE.md` — how to create Firebase project, enable Storage and set env
- `server/docs/GUIDE_GMAIL_API.md` — Gmail API migration & setup
- `server/docs/*` — many migration and change logs covering: invoice workflow, removal of unused fields, verification migration (token -> 8-digit code), wilayas enum, migrations for password reset, etc.

These docs are intentionally detailed and reflect the project’s development history and decisions.

---

## Developer setup (short)
1. Clone repo and open both `client/` and `server/` folders.
2. Server:
   - cd server
   - npm install
  - copy `.env.example` to `.env` and fill values (DB, JWT secret, Cloudinary keys, Firebase credentials, SendGrid credentials)
   - create DB and run migrations/scripts (see `scripts/`) or run `npm run migrate` if provided
   - npm run dev (nodemon) — server should start on 5000
3. Client:
   - cd client
   - npm install
   - create `.env.local` with NEXT_PUBLIC_API_BASE_URL pointing at the server
   - npm run dev — Next dev server on 3000

Testing notes:
- If the configured email provider (e.g. SendGrid) is not set up, verification codes print in server logs for dev testing.
- Use Insomnia/Postman examples present under `server/docs` for product creation, order creation and admin flows.

---

## Edge cases & important implementation details
- File uploads must validate file type and size: images JPG/PNG up to configured size; invoices PDF only, max 10MB.
- `couleurs` / `tailles` must be stringified JSON when sent via multipart/form-data (client must send them as Text form fields).
- Customer invoices are uploaded to Firebase (so the server needs firebase-admin credentials with correct bucket and public read or signed URL policy).
- Deleting/replacing invoices: server deletes old file from storage when a replacement is uploaded.
- Orders are created with `en_attente` status and admin must confirm; stock is decremented on order creation and restored if order cancelled.
- Email sending is non-blocking: if email fails, core actions (create order, create product) should still succeed (docs indicate non-blocking emails).

---

## Suggested small improvements / next steps (proactive)
- Add a single consolidated `FULL_PROJECT_DOCUMENTATION.md` (this file) to `client/` or repo root — done.
- Add a short README within `client/` pointing to server docs and environment variables.
- Add a short `DEPLOY.md` describing production env variables, recommended hosting (e.g., Vercel for client, Render/Railway/Heroku or container with Docker for server) and secrets storage.
- Add a `swagger` or OpenAPI spec (docs mention it as TODO) to make frontend-backend integration easier.

---

## Where invoices / images are served from (short summary required by you)
- PDFs and document files (invoices/factures) are stored in Firebase Storage (see `server/docs/FIREBASE_SETUP_GUIDE.md`) and the server stores the resulting Firebase URL in the DB.
- Product images and other images (branding, email logos) are stored on Cloudinary (account referenced in `.env` via CLOUDINARY_*) and Cloudinary URLs are used on the frontend and in emails.

---

## Status / Traceability
I scanned and used the following authoritative sources in the repository:
- `client/DOCUMENTATION.md`
- `client/package.json`
- `server/README.md`
- `server/package.json`
- many files under `server/docs/*.md` (API docs, Firebase setup, Gmail API guide, command workflow, migrations, etc.)
- grep matches in server code that show Cloudinary usage, Firebase initialization (`server/server.js` requires `./config/firebase`) and routes that rely on `uploadPDFMemory` and Cloudinary upload helpers.

All these files are the basis for the content above.

---

## Final notes & next actions I can take for you
- I can commit this file as `FULL_PROJECT_DOCUMENTATION.md` (done).
- I can also:
  - create a short `DEPLOY.md` with recommended production hosting and exact env variable templates;
  - add a README in `client/` linking to this doc and giving local dev quickstart steps;
  - generate a small OpenAPI spec from the API docs (would require manual mapping or heuristics).

Tell me which follow-up you'd like and I'll proceed.

-- end of consolidated documentation
