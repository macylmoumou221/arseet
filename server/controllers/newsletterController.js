const Newsletter = require('../models/newsletter');
const { asyncHandler } = require('../middlewares/errorHandler');
const { sendNewsletterConfirmation, sendCustomNewsletterEmail } = require('../config/gmail');

/**
 * @route   POST /api/newsletter
 * @desc    Inscription à la newsletter
 * @access  Public
 */
const inscriptionNewsletter = asyncHandler(async (req, res) => {
  const { email, source } = req.body;

  // Vérifier si l'email existe déjà
  const existant = await Newsletter.findOne({ where: { email } });

  if (existant) {
    // Si déjà inscrit et actif
    if (existant.est_actif) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà inscrit à la newsletter'
      });
    }

    // Si désinscrit, réactiver
    await existant.update({
      est_actif: true,
      date_desinscription: null,
      source: source || existant.source
    });

    // Envoyer email de confirmation (non bloquant)
    sendNewsletterConfirmation(email).catch(err => {
      console.error('Erreur envoi email newsletter:', err);
    });

    return res.json({
      success: true,
      message: 'Inscription à la newsletter réactivée avec succès'
    });
  }

  // Créer une nouvelle inscription
  await Newsletter.create({
    email,
    source: source || 'website',
    est_actif: true
  });

  // Envoyer email de confirmation (non bloquant)
  sendNewsletterConfirmation(email).catch(err => {
    console.error('Erreur envoi email newsletter:', err);
  });

  res.status(201).json({
    success: true,
    message: 'Inscription à la newsletter réussie'
  });
});

/**
 * @route   DELETE /api/newsletter/:email
 * @desc    Désinscription de la newsletter
 * @access  Public
 */
const desinscriptionNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const abonne = await Newsletter.findOne({ where: { email } });

  if (!abonne) {
    res.status(404);
    throw new Error('Email non trouvé dans la newsletter');
  }

  if (!abonne.est_actif) {
    return res.json({
      success: true,
      message: 'Cet email est déjà désinscrit'
    });
  }

  // Désactiver l'abonnement
  await abonne.update({
    est_actif: false,
    date_desinscription: new Date()
  });

  res.json({
    success: true,
    message: 'Désinscription réussie'
  });
});

/**
 * @route   GET /api/admin/newsletter
 * @desc    Récupérer tous les abonnés à la newsletter (Admin)
 * @access  Private/Admin
 */
const getAbonnes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, actif } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (actif !== undefined) {
    where.est_actif = actif === 'true';
  }

  const { count, rows: abonnes } = await Newsletter.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['date_inscription', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      abonnes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      },
      stats: {
        total_actifs: await Newsletter.count({ where: { est_actif: true } }),
        total_inactifs: await Newsletter.count({ where: { est_actif: false } })
      }
    }
  });
});

/**
 * @route   DELETE /api/admin/newsletter/:id
 * @desc    Supprimer définitivement un abonné (Admin)
 * @access  Private/Admin
 */
const deleteAbonne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const abonne = await Newsletter.findByPk(id);

  if (!abonne) {
    res.status(404);
    throw new Error('Abonné non trouvé');
  }

  await abonne.destroy();

  res.json({
    success: true,
    message: 'Abonné supprimé définitivement de la newsletter'
  });
});

/**
 * @route   PATCH /api/admin/newsletter/:id/toggle
 * @desc    Activer/désactiver un abonné (Admin)
 * @access  Private/Admin
 */
const toggleAbonne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const abonne = await Newsletter.findByPk(id);

  if (!abonne) {
    res.status(404);
    throw new Error('Abonné non trouvé');
  }

  const nouvelEtat = !abonne.est_actif;

  await abonne.update({
    est_actif: nouvelEtat,
    date_desinscription: nouvelEtat ? null : new Date()
  });

  res.json({
    success: true,
    message: `Abonné ${nouvelEtat ? 'activé' : 'désactivé'} avec succès`,
    data: abonne
  });
});

/**
 * @route   POST /api/admin/newsletter/send-custom
 * @desc    Envoyer un email personnalisé à tous les abonnés
 * @access  Private/Admin
 */
const sendCustomEmail = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;

  // Validation
  if (!subject || !message) {
    res.status(400);
    throw new Error('Le sujet et le message sont requis');
  }

  if (subject.length > 200) {
    res.status(400);
    throw new Error('Le sujet ne doit pas dépasser 200 caractères');
  }

  if (message.length > 5000) {
    res.status(400);
    throw new Error('Le message ne doit pas dépasser 5000 caractères');
  }

  // Récupérer l'URL de l'image uploadée (si disponible)
  const imageUrl = req.file ? req.file.path : null;

  // Envoyer l'email personnalisé
  const result = await sendCustomNewsletterEmail(subject, message, imageUrl);

  res.json({
    success: true,
    message: `Email envoyé à ${result.sent} abonné(s)`,
    data: {
      sent: result.sent,
      failed: result.failed,
      errors: result.errors
    }
  });
});

module.exports = {
  inscriptionNewsletter,
  desinscriptionNewsletter,
  getAbonnes,
  deleteAbonne,
  toggleAbonne,
  sendCustomEmail
};
