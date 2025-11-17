const express = require('express');
const router = express.Router();
const {
  inscriptionNewsletter,
  desinscriptionNewsletter,
  getAbonnes
} = require('../controllers/newsletterController');
const { validateNewsletter } = require('../middlewares/validationMiddleware');

/**
 * @route   POST /api/newsletter
 * @desc    Inscription à la newsletter
 * @access  Public
 */
router.post('/', validateNewsletter, inscriptionNewsletter);

/**
 * @route   DELETE /api/newsletter/:email
 * @desc    Désinscription de la newsletter
 * @access  Public
 */
router.delete('/:email', desinscriptionNewsletter);

module.exports = router;
