const express = require('express');
const router = express.Router();
const {
  createCommande,
  getCommandeById,
  getMesCommandes,
  updateStatutCommandeUtilisateur,
  getFactureDownloadLink
} = require('../controllers/commandesController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');
const { validateCommande, validateId } = require('../middlewares/validationMiddleware');
const { uploadPDFMemory } = require('../config/firebase');

/**
 * @route   POST /api/commandes
 * @desc    Créer une nouvelle commande avec facture (PDF)
 * @access  Public (avec optionalAuth pour utilisateurs connectés)
 */
router.post('/', optionalAuth, uploadPDFMemory.single('facture'), validateCommande, createCommande);

/**
 * @route   GET /api/commandes/:id
 * @desc    Récupérer une commande par ID
 * @access  Public (avec email) ou Private
 */
router.get('/:id', optionalAuth, validateId, getCommandeById);

/**
 * @route   GET /api/commandes/:id/facture/download
 * @desc    Obtenir le lien de téléchargement de la facture
 * @access  Public (no restrictions)
 */
router.get('/:id/facture/download', validateId, getFactureDownloadLink);

/**
 * @route   GET /api/commandes
 * @desc    Récupérer les commandes de l'utilisateur connecté
 * @access  Private
 */
router.get('/', authMiddleware, getMesCommandes);

/**
 * @route   PATCH /api/commandes/:id/statut
 * @desc    Annuler sa propre commande (utilisateur connecté)
 * @access  Private
 */
router.patch('/:id/statut', authMiddleware, validateId, updateStatutCommandeUtilisateur);

module.exports = router;
