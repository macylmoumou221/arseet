/**
 * Script pour obtenir le Refresh Token Gmail OAuth2
 * 
 * Exécution:
 * 1. Configurer GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI dans .env
 * 2. Exécuter: node scripts/get-gmail-token.js
 * 3. Suivre les instructions dans le terminal
 * 4. Copier le refresh_token dans .env
 */

require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

// Configuration OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Scopes Gmail nécessaires
const SCOPES = ['https://mail.google.com/'];

console.log('\n========================================');
console.log('📧 Configuration Gmail API - Obtenir Refresh Token');
console.log('========================================\n');

// Vérifier que les credentials sont configurés
if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
  console.error('❌ ERREUR: GMAIL_CLIENT_ID et GMAIL_CLIENT_SECRET doivent être configurés dans .env\n');
  console.log('📝 Étapes:');
  console.log('1. Aller sur https://console.cloud.google.com/');
  console.log('2. Créer un projet ou sélectionner un existant');
  console.log('3. Activer Gmail API');
  console.log('4. Créer des credentials OAuth2 (Desktop app)');
  console.log('5. Copier Client ID et Client Secret dans .env\n');
  process.exit(1);
}

// Générer l'URL d'autorisation
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force l'affichage du consentement pour obtenir refresh_token
});

console.log('📍 Étape 1: Autoriser l\'application');
console.log('──────────────────────────────────────');
console.log('Ouvrez cette URL dans votre navigateur:\n');
console.log('\x1b[36m%s\x1b[0m\n', authUrl);
console.log('──────────────────────────────────────\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('📍 Étape 2: Entrez le code d\'autorisation reçu: ', async (code) => {
  rl.close();

  try {
    console.log('\n⏳ Échange du code contre les tokens...\n');
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('✅ Tokens obtenus avec succès!\n');
    console.log('========================================');
    console.log('📝 COPIER CES VALEURS DANS .env');
    console.log('========================================\n');
    
    if (tokens.refresh_token) {
      console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('\n✅ Refresh Token obtenu! Copiez-le dans votre fichier .env\n');
      console.log('⚠️  IMPORTANT: Ce token ne doit JAMAIS être partagé ou commité dans Git!\n');
    } else {
      console.log('⚠️  Aucun refresh_token reçu.');
      console.log('   Cela peut arriver si vous avez déjà autorisé l\'application.');
      console.log('   Solutions:');
      console.log('   1. Révoquer l\'accès sur https://myaccount.google.com/permissions');
      console.log('   2. Réexécuter ce script\n');
    }

    if (tokens.access_token) {
      console.log('Access Token (expire dans 1h): ' + tokens.access_token.substring(0, 50) + '...\n');
    }

    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'obtention des tokens:', error.message);
    console.log('\n💡 Vérifiez que:');
    console.log('   - Le code est correct');
    console.log('   - GMAIL_REDIRECT_URI dans .env correspond à celui dans Google Cloud Console');
    console.log('   - Gmail API est bien activée dans votre projet Google Cloud\n');
  }
});
