/**
 * Script pour uploader le logo Arseet sur Cloudinary
 * Ce logo sera utilisé dans les emails
 */

const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadLogo = async () => {
  try {
    console.log('🚀 Upload du logo Arseet vers Cloudinary...');

    const logoPath = path.join(__dirname, '..', 'public', 'arseet_white.png');
    
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'arseet_branding',
      public_id: 'logo_email_white',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('\n✅ Logo uploadé avec succès !');
    console.log('\n📋 Détails:');
    console.log('- URL:', result.secure_url);
    console.log('- Public ID:', result.public_id);
    console.log('- Format:', result.format);
    console.log('- Dimensions:', `${result.width}x${result.height}px`);
    
    console.log('\n📝 Ajoutez cette ligne à votre fichier .env:');
    console.log(`LOGO_URL=${result.secure_url}`);
    
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload du logo:', error.message);
    throw error;
  }
};

// Exécuter le script
uploadLogo()
  .then(() => {
    console.log('\n✨ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur:', error);
    process.exit(1);
  });
