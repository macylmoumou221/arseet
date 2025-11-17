const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  toggleAdmin,
  toggleActif,
  deleteUser,
  confirmerCommande
} = require('../controllers/adminController');
const {
  getAllCommandes,
  updateStatutCommande,
  supprimerCommande
} = require('../controllers/commandesController');
const { getAbonnes, deleteAbonne, toggleAbonne, sendCustomEmail } = require('../controllers/newsletterController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { validateId } = require('../middlewares/validationMiddleware');
const { upload } = require('../config/cloudinary');

// Toutes les routes admin nécessitent authentification + droits admin
router.use(authMiddleware, adminMiddleware);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Récupérer les statistiques du dashboard
 * @access  Private/Admin
 */
router.get('/dashboard', getDashboard);

/**
 * @route   GET /api/admin/users
 * @desc    Récupérer tous les utilisateurs
 * @access  Private/Admin
 */
router.get('/users', getAllUsers);

/**
 * @route   PATCH /api/admin/users/:id/toggle-admin
 * @desc    Promouvoir/rétrograder un utilisateur en admin
 * @access  Private/Admin
 */
router.patch('/users/:id/toggle-admin', validateId, toggleAdmin);

/**
 * @route   PATCH /api/admin/users/:id/toggle-actif
 * @desc    Activer/désactiver un compte utilisateur
 * @access  Private/Admin
 */
router.patch('/users/:id/toggle-actif', validateId, toggleActif);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private/Admin
 */
router.delete('/users/:id', validateId, deleteUser);

/**
 * @route   GET /api/admin/commandes
 * @desc    Récupérer toutes les commandes
 * @access  Private/Admin
 */
router.get('/commandes', getAllCommandes);

/**
 * @route   POST /api/admin/commandes/:id/confirmer
 * @desc    Confirmer une commande (passe de en_attente à confirmee)
 * @access  Private/Admin
 */
router.post('/commandes/:id/confirmer', validateId, confirmerCommande);

/**
 * @route   PATCH /api/admin/commandes/:id/statut
 * @desc    Mettre à jour le statut d'une commande
 * @access  Private/Admin
 */
router.patch('/commandes/:id/statut', validateId, updateStatutCommande);

/**
 * @route   DELETE /api/admin/commandes/:id
 * @desc    Supprimer une commande annulée
 * @access  Private/Admin
 */
router.delete('/commandes/:id', validateId, supprimerCommande);

/**
 * @route   GET /api/admin/newsletter
 * @desc    Récupérer tous les abonnés à la newsletter
 * @access  Private/Admin
 */
router.get('/newsletter', getAbonnes);

/**
 * @route   POST /api/admin/newsletter/send-custom
 * @desc    Envoyer un email personnalisé à tous les abonnés
 * @access  Private/Admin
 */
router.post('/newsletter/send-custom', upload.single('image'), sendCustomEmail);

/**
 * @route   PATCH /api/admin/newsletter/:id/toggle
 * @desc    Activer/désactiver un abonné
 * @access  Private/Admin
 */
router.patch('/newsletter/:id/toggle', validateId, toggleAbonne);

/**
 * @route   DELETE /api/admin/newsletter/:id
 * @desc    Supprimer définitivement un abonné
 * @access  Private/Admin
 */
router.delete('/newsletter/:id', validateId, deleteAbonne);

module.exports = router;
