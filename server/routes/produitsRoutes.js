const express = require('express');
const router = express.Router();
const {
  getProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
  toggleRupture,
  addCouleur,
  addTaille,
  setPromotion
} = require('../controllers/produitsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { validateProduit, validateId, validatePagination } = require('../middlewares/validationMiddleware');
const { upload } = require('../config/cloudinary');

/**
 * @route   GET /api/produits
 * @desc    Récupérer tous les produits avec pagination et filtres
 * @access  Public
 */
router.get('/', validatePagination, getProduits);

/**
 * @route   GET /api/produits/:id
 * @desc    Récupérer un produit par ID
 * @access  Public
 */
router.get('/:id', validateId, getProduitById);

/**
 * @route   POST /api/produits
 * @desc    Créer un nouveau produit (Admin)
 * @access  Private/Admin
 */
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'image_avant', maxCount: 1 },
    { name: 'image_arriere', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  validateProduit,
  createProduit
);

/**
 * @route   PUT /api/produits/:id
 * @desc    Mettre à jour un produit (Admin)
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  validateId,
  upload.fields([
    { name: 'image_avant', maxCount: 1 },
    { name: 'image_arriere', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  updateProduit
);

/**
 * @route   DELETE /api/produits/:id
 * @desc    Supprimer un produit (Admin)
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, validateId, deleteProduit);

/**
 * @route   PATCH /api/produits/:id/rupture
 * @desc    Marquer un produit en rupture ou disponible (Admin)
 * @access  Private/Admin
 */
router.patch('/:id/rupture', authMiddleware, adminMiddleware, validateId, toggleRupture);

/**
 * @route   POST /api/produits/:id/couleurs
 * @desc    Ajouter une couleur à un produit (Admin)
 * @access  Private/Admin
 */
router.post('/:id/couleurs', authMiddleware, adminMiddleware, validateId, addCouleur);

/**
 * @route   POST /api/produits/:id/tailles
 * @desc    Ajouter une taille à un produit (Admin)
 * @access  Private/Admin
 */
router.post('/:id/tailles', authMiddleware, adminMiddleware, validateId, addTaille);

/**
 * @route   PATCH /api/produits/:id/promotion
 * @desc    Définir la promotion d'un produit (Admin)
 * @access  Private/Admin
 */
router.patch('/:id/promotion', authMiddleware, adminMiddleware, validateId, setPromotion);

module.exports = router;
