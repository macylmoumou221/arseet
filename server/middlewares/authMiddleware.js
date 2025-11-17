const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT dans le header Authorization
 * Ajoute l'utilisateur à req.user si le token est valide
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.'
      });
    }

    // Extraire le token
    const token = authHeader.substring(7); // Enlever "Bearer "

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token invalide.'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.est_actif) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré. Veuillez vous reconnecter.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification.',
      error: error.message
    });
  }
};

/**
 * Middleware optionnel d'authentification
 * Ajoute l'utilisateur à req.user si un token valide est fourni
 * Sinon, continue sans erreur
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (user && user.est_actif) {
      req.user = user;
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans bloquer
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
