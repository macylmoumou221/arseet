const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || 'http://localhost:5000/';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ GMAIL_CLIENT_ID ou GMAIL_CLIENT_SECRET manquant dans le .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = ['https://mail.google.com/'];

async function getRefreshToken() {
  return new Promise((resolve, reject) => {
    // Créer un serveur HTTP temporaire pour recevoir le callback
    const server = http.createServer(async (req, res) => {
      try {
        const redirectPath = new URL(REDIRECT_URI).pathname;
        const requestUrl = new url.URL(req.url, REDIRECT_URI);

        if (requestUrl.pathname === redirectPath) {
          const code = requestUrl.searchParams.get('code');
          
          console.log('\n✅ Code reçu ! Échange en cours...\n');
          
          res.end('✅ Authentification réussie ! Vous pouvez fermer cette fenêtre et retourner au terminal.');
          
          server.close();
          
          // Échanger le code contre le refresh token
          const { tokens } = await oauth2Client.getToken(code);
          
          console.log('='.repeat(80));
          console.log('✅ SUCCESS! Voici votre Refresh Token:\n');
          console.log(tokens.refresh_token);
          console.log('\n' + '='.repeat(80));
          console.log('\n📋 Copiez ce token et mettez-le dans votre .env:');
          console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
          
          resolve(tokens.refresh_token);
        }
      } catch (e) {
        reject(e);
      }
    }).listen(5000, () => {
      // Générer l'URL d'autorisation (serveur temporaire sur 5000)
      const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('🔐 OBTENIR LE REFRESH TOKEN GMAIL');
      console.log('='.repeat(80) + '\n');
      console.log('📋 Étape 1 : Un navigateur va s\'ouvrir automatiquement');
      console.log('📋 Étape 2 : Connectez-vous avec arseetwear@gmail.com');
      console.log('📋 Étape 3 : Acceptez les permissions');
      console.log('📋 Étape 4 : Vous serez redirigé automatiquement\n');
      console.log('🌐 Si le navigateur ne s\'ouvre pas, copiez ce lien:\n');
      console.log(authorizeUrl);
      console.log('\n' + '='.repeat(80) + '\n');
      console.log('⏳ En attente de votre autorisation...\n');
      
      // Ouvrir le navigateur automatiquement
  exec(`start ${authorizeUrl}`, (error) => {
        if (error) {
          console.log('⚠️  Impossible d\'ouvrir le navigateur automatiquement.');
          console.log('📋 Veuillez copier le lien ci-dessus manuellement.\n');
        }
      });
    });
  });
}

// Lancer le processus
getRefreshToken()
  .then(() => {
    console.log('✅ Configuration terminée!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  });
