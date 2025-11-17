const express = require('express');
const router = express.Router();
const { WILAYAS_COMPLETE, getWilayaByCode, getWilayaByNom } = require('../constants/wilayas');

/**
 * @route   GET /api/utils/wilayas
 * @desc    Récupérer la liste complète des 58 wilayas d'Algérie
 * @access  Public
 */
router.get('/wilayas', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des wilayas récupérée avec succès',
    data: {
      total: WILAYAS_COMPLETE.length,
      wilayas: WILAYAS_COMPLETE
    }
  });
});

/**
 * @route   GET /api/utils/wilayas/:code
 * @desc    Récupérer une wilaya par son code (01-58)
 * @access  Public
 */
router.get('/wilayas/:code', (req, res) => {
  const { code } = req.params;
  const wilaya = getWilayaByCode(code);

  if (!wilaya) {
    return res.status(404).json({
      success: false,
      message: 'Wilaya non trouvée avec ce code'
    });
  }

  res.json({
    success: true,
    data: wilaya
  });
});

/**
 * @route   GET /api/utils/wilayas/search/:nom
 * @desc    Rechercher une wilaya par son nom
 * @access  Public
 */
router.get('/wilayas/search/:nom', (req, res) => {
  const { nom } = req.params;
  const wilaya = getWilayaByNom(nom);

  if (!wilaya) {
    return res.status(404).json({
      success: false,
      message: 'Wilaya non trouvée avec ce nom'
    });
  }

  res.json({
    success: true,
    data: wilaya
  });
});

const { sendContactMessage } = require('../controllers/contactController');

/**
 * @route   POST /api/contact
 * @desc    Envoyer un message personnalisé à l'admin
 * @access  Public
 */
router.post('/contact', sendContactMessage);

module.exports = router;
