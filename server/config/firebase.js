const admin = require('firebase-admin');
const multer = require('multer');
require('dotenv').config();

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
const initializeFirebase = () => {
  try {
    // Parse the service account JSON from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET // e.g., "your-project.appspot.com"
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
};

// Initialize Firebase
initializeFirebase();

// Get Firebase Storage bucket
const bucket = admin.storage().bucket();

/**
 * Upload a PDF file to Firebase Storage
 * @param {Buffer} fileBuffer - The PDF file buffer from multer
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} - Public download URL
 */
const uploadPDFToFirebase = async (fileBuffer, originalName) => {
  try {
    // Verify buffer
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error('Invalid file buffer');
    }

    console.log(`📤 Firebase: Uploading ${originalName}...`);
    console.log(`📦 Buffer size: ${fileBuffer.length} bytes`);
    console.log(`📦 Buffer type: ${Buffer.isBuffer(fileBuffer) ? 'Valid Buffer' : 'Invalid'}`);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `factures/${timestamp}_${randomString}_${originalName}`;
    const downloadToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    console.log(`📁 Firebase path: ${filename}`);

    // Create file reference
    const file = bucket.file(filename);

    // Upload file with metadata and download token
    await file.save(fileBuffer, {
      metadata: {
        contentType: 'application/pdf',
        cacheControl: 'public, max-age=31536000',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      },
      resumable: false, // Disable resumable upload for small files
      validation: 'crc32c' // Verify file integrity
    });

    console.log('✅ File saved to Firebase!');

    // Make file public
    await file.makePublic();
    
    console.log('✅ File made public!');
    
    // Firebase public URL with download token
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${downloadToken}`;

    console.log('✅ Firebase: PDF uploaded successfully!');
    console.log(`🔗 Public URL: ${publicUrl}`);
    console.log(`🎫 Download token: ${downloadToken}`);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Firebase upload error:', error);
    throw new Error('Erreur lors de l\'upload du fichier PDF sur Firebase');
  }
};

/**
 * Delete a PDF file from Firebase Storage
 * @param {string} fileUrl - The Firebase Storage URL
 * @returns {Promise<void>}
 */
const deletePDFFromFirebase = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    console.log(`🗑️  Firebase: Deleting PDF...`);

    // Extract filename from URL
    // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/factures%2Ffilename.pdf?alt=media
    const urlParts = fileUrl.split('/o/')[1];
    if (!urlParts) {
      console.warn('⚠️  Firebase: Invalid URL format:', fileUrl);
      return;
    }

    const filename = decodeURIComponent(urlParts.split('?')[0]);
    
    console.log(`📁 Firebase path: ${filename}`);
    
    // Delete file
    await bucket.file(filename).delete();
    
    console.log('✅ Firebase: PDF deleted successfully!');
  } catch (error) {
    // Don't throw error if file doesn't exist (404)
    if (error.code === 404) {
      console.warn('⚠️  Firebase: File not found (already deleted)');
    } else {
      console.error('❌ Firebase delete error:', error);
      throw new Error('Erreur lors de la suppression du fichier PDF sur Firebase');
    }
  }
};

/**
 * Multer configuration for memory storage (required for Firebase)
 * Files are temporarily stored in memory as Buffer before upload to Firebase
 */
const memoryStorage = multer.memoryStorage();

const uploadPDFMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Verify MIME type
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez uniquement des fichiers PDF.'), false);
    }
  }
});

module.exports = {
  admin,
  bucket,
  uploadPDFToFirebase,
  deletePDFFromFirebase,
  uploadPDFMemory
};
