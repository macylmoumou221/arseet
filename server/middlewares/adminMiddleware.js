/**
 * Middleware Admin
 * Vérifie que l'utilisateur authentifié est un administrateur
 * Doit être utilisé après authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.'
      });
    }

    // Vérifier si l'utilisateur est admin
    if (!req.user.est_admin) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    // L'utilisateur est admin, continuer
    next();
  } catch (error) {
    console.error('Erreur middleware admin:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification des droits.',
      error: error.message
    });
  }
};

module.exports = adminMiddleware;
