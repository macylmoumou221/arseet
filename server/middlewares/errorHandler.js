/**
 * Middleware de gestion centralisée des erreurs
 */

/**
 * Gestionnaire d'erreurs 404 - Route non trouvée
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Gestionnaire global d'erreurs
 */
const errorHandler = (err, req, res, next) => {
  // Déterminer le code de statut
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Logger l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erreur:', err);
  }

  // Réponse d'erreur
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Une erreur est survenue',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
};

/**
 * Gestionnaire d'erreurs asynchrones
 * Wrapper pour éviter les try/catch dans chaque controller
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Gestionnaire d'erreurs Sequelize
 */
const sequelizeErrorHandler = (err, req, res, next) => {
  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors
    });
  }

  // Erreur de contrainte unique
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'champ';
    return res.status(409).json({
      success: false,
      message: `Ce ${field} est déjà utilisé`
    });
  }

  // Erreur de clé étrangère
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide vers une ressource'
    });
  }

  // Erreur de connexion à la base de données
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Erreur de connexion à la base de données'
    });
  }

  // Passer au gestionnaire d'erreurs suivant
  next(err);
};

/**
 * Gestionnaire d'erreurs Multer (upload de fichiers)
 */
const multerErrorHandler = (err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Taille maximale: 10MB'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers téléchargés'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Champ de fichier inattendu'
      });
    }
  }

  // Erreur personnalisée de validation de fichier
  if (err.message && err.message.includes('Format d\'image')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  sequelizeErrorHandler,
  multerErrorHandler
};
