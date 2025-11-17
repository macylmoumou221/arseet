const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

/**
 * Configuration de Cloudinary pour l'upload d'images
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Configuration du stockage Cloudinary pour Multer
 * Dossier: arseet_products
 * Formats acceptés: jpg, jpeg, png
 * Taille max: 10MB
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'arseet_products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }
    ]
  }
});

/**
 * Configuration du stockage Cloudinary pour les factures PDF
 * Dossier: arseet_factures
 * Format accepté: pdf
 * Taille max: 10MB
 */
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'arseet_factures',
    allowed_formats: ['pdf'],
    resource_type: 'raw', // Pour les fichiers non-images
    format: 'pdf' // Force le format PDF
  }
});

/**
 * Middleware Multer pour l'upload d'images
 * Limite: 2 fichiers (image_avant, image_arriere)
 * Taille max: 10MB par fichier
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accepte tout type image/*
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Format d\'image non supporté. Utilisez un fichier image.'), false);
    }
  }
});

/**
 * Middleware Multer pour l'upload de factures PDF
 * Limite: 1 fichier
 * Taille max: 10MB
 */
const uploadPDF = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type MIME
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez uniquement des fichiers PDF.'), false);
    }
  }
});

/**
 * Supprime une image de Cloudinary
 * @param {string} imageUrl - URL de l'image à supprimer
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extraire le public_id de l'URL Cloudinary
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = `arseet_products/${fileWithExtension.split('.')[0]}`;
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Image supprimée de Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    throw error;
  }
};

/**
 * Supprime un fichier PDF de Cloudinary
 * @param {string} pdfUrl - URL du PDF à supprimer
 */
const deletePDF = async (pdfUrl) => {
  try {
    if (!pdfUrl) return;
    
    // Extraire le public_id de l'URL Cloudinary
    const urlParts = pdfUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = `arseet_factures/${fileWithExtension.split('.')[0]}`;
    
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log('PDF supprimé de Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression du PDF:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadPDF,
  deleteImage,
  deletePDF
};
