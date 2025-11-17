const express = require('express');
const router = express.Router();
const {
  inscription,
  connexion,
  getProfil,
  updateProfil,
  verifierEmail,
  renvoyerVerification,
  demanderReinitialisationMotDePasse,
  reinitialiserMotDePasse,
  changerMotDePasse
} = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  validateInscription,
  validateConnexion,
  validateProfilUpdate,
  validateForgotPassword,
  validateResetPassword
} = require('../middlewares/validationMiddleware');

/**
 * @route   POST /api/auth/inscription
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/inscription', validateInscription, inscription);

/**
 * @route   POST /api/auth/connexion
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/connexion', validateConnexion, connexion);

/**
 * @route   GET /api/auth/profil
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/profil', authMiddleware, getProfil);

/**
 * @route   PUT /api/auth/profil
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put('/profil', authMiddleware, validateProfilUpdate, updateProfil);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Vérifier l'email avec le code à 8 chiffres
 * @access  Public
 */
router.post('/verify-email', verifierEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Renvoyer l'email de vérification
 * @access  Public
 */
router.post('/resend-verification', renvoyerVerification);

/**
 * @route   POST /api/auth/password/forgot
 * @desc    Demander un email de réinitialisation de mot de passe
 * @access  Public
 */
router.post('/password/forgot', validateForgotPassword, demanderReinitialisationMotDePasse);

/**
 * @route   POST /api/auth/password/reset
 * @desc    Réinitialiser le mot de passe via token reçu par email
 * @access  Public
 */
router.post('/password/reset', validateResetPassword, reinitialiserMotDePasse);

/**
 * @route   PUT /api/auth/password/change
 * @desc    Changer le mot de passe avec l'ancien mot de passe
 * @access  Private
 */
router.put('/password/change', authMiddleware, changerMotDePasse);

module.exports = router;
