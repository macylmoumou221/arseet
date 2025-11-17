const { sendContactEmail } = require('../config/gmail');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @route   POST /api/contact
 * @desc    Envoyer un message personnalisé à l'admin
 * @access  Public
 */
const sendContactMessage = asyncHandler(async (req, res) => {
  const { nom, email, sujet, message } = req.body;
  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
  }

  // Utilise le template d'email admin existant
  await sendContactEmail({ nom, email, sujet, message });

  res.json({ success: true, message: 'Message envoyé à l\'admin avec succès.' });
});

module.exports = { sendContactMessage };
