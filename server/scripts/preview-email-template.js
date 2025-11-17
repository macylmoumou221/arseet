/**
 * Script pour prévisualiser les templates d'emails avec le nouveau logo
 */

const fs = require('fs');
const path = require('path');
const { emailConfirmation, emailBienvenue, emailNewProduct } = require('../utils/emailTemplates');

// Créer le dossier de prévisualisation
const previewDir = path.join(__dirname, '..', 'email-previews');
if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir);
}

console.log('🎨 Génération des prévisualisations d\'emails avec le nouveau logo...\n');

// 1. Email de confirmation
const confirmation = emailConfirmation('Dupont', 'Jean', '12345678');
fs.writeFileSync(
  path.join(previewDir, '01-email-confirmation.html'),
  confirmation.html
);
console.log('✅ Email de confirmation: email-previews/01-email-confirmation.html');

// 2. Email de bienvenue
const bienvenue = emailBienvenue('Dupont', 'Jean');
fs.writeFileSync(
  path.join(previewDir, '02-email-bienvenue.html'),
  bienvenue.html
);
console.log('✅ Email de bienvenue: email-previews/02-email-bienvenue.html');

// 3. Email nouveau produit
const produit = {
  id: 1,
  nom: 'T-Shirt Premium',
  description: 'Un t-shirt de qualité supérieure en coton biologique',
  prix: 2500.00,
  promotion: 20,
  image_avant: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  categorie: 'homme'
};
const nouveauProduit = emailNewProduct('', '', produit, 'subscriber@example.com');
fs.writeFileSync(
  path.join(previewDir, '03-email-nouveau-produit.html'),
  nouveauProduit.html
);
console.log('✅ Email nouveau produit: email-previews/03-email-nouveau-produit.html');

console.log('\n📂 Les prévisualisations sont dans le dossier: email-previews/');
console.log('💡 Ouvrez ces fichiers .html dans votre navigateur pour voir le rendu!\n');
