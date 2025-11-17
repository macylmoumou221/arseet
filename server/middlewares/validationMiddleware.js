const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validations pour l'inscription utilisateur
 */
const validateInscription = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit contenir entre 2 et 100 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  
  body('mot_de_passe')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  
  body('telephone')
    .optional()
    .isString().withMessage('Le numéro de téléphone doit être une chaîne de caractères'),
  
  handleValidationErrors
];

/**
 * Validations pour la connexion
 */
const validateConnexion = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  
  body('mot_de_passe')
    .notEmpty().withMessage('Le mot de passe est requis'),
  
  handleValidationErrors
];

/**
 * Validation pour la demande de réinitialisation de mot de passe
 */
const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),

  handleValidationErrors
];

/**
 * Validation pour la réinitialisation de mot de passe
 */
const validateResetPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),

  body('code')
    .trim()
    .notEmpty().withMessage('Le code de réinitialisation est requis')
    .matches(/^\d{8}$/).withMessage('Le code de réinitialisation doit contenir exactement 8 chiffres'),

  body('mot_de_passe')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),

  handleValidationErrors
];

/**
 * Validations pour la mise à jour du profil
 */
const validateProfilUpdate = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('prenom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit contenir entre 2 et 100 caractères'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  
  body('telephone')
    .optional()
    .isString().withMessage('Le numéro de téléphone doit être une chaîne de caractères')
    .isLength({ min: 4, max: 20 }).withMessage('Le numéro de téléphone doit contenir entre 4 et 20 caractères'),
  
  body('mot_de_passe')
    .optional()
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  
  handleValidationErrors
];

/**
 * Validations pour la création/modification de produit
 */
const validateProduit = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom du produit est requis')
    .isLength({ min: 2, max: 255 }).withMessage('Le nom doit contenir entre 2 et 255 caractères'),
  
  body('prix')
    .notEmpty().withMessage('Le prix est requis')
    .isFloat({ min: 0.01 }).withMessage('Le prix doit être supérieur à 0'),
  
  body('prix_promo')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Le prix promotionnel doit être supérieur à 0'),
  
  body('categorie')
    .notEmpty().withMessage('La catégorie est requise')
    .isIn(['homme', 'femme', 'enfant', 'accessoires', 'autre']).withMessage('Catégorie invalide'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif'),
  
  handleValidationErrors
];

/**
 * Validations pour la création de commande
 */
const validateCommande = [
  body('nom_complet')
    .trim()
    .notEmpty().withMessage('Le nom complet est requis')
    .isLength({ min: 2, max: 200 }).withMessage('Le nom complet doit contenir entre 2 et 200 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  
  body('telephone')
    .trim()
    .notEmpty().withMessage('Le téléphone est requis')
    .isString().withMessage('Le numéro de téléphone doit être une chaîne de caractères')
    .isLength({ min: 4, max: 20 }).withMessage('Le numéro de téléphone doit contenir entre 4 et 20 caractères'),
  
  body('adresse_livraison')
    .trim()
    .notEmpty().withMessage('L\'adresse de livraison est requise'),
  
  body('ville')
    .trim()
    .notEmpty().withMessage('La ville est requise'),
  
  body('wilaya')
    .trim()
    .notEmpty().withMessage('La wilaya est requise'),
  
  body('frais_livraison')
    .notEmpty().withMessage('Les frais de livraison sont requis')
    .isInt({ min: 0 }).withMessage('Les frais de livraison doivent être un nombre entier positif'),

  body('prix_soumis')
    .notEmpty().withMessage('Le prix soumis est requis')
    .isFloat({ min: 0.01 }).withMessage('Le prix soumis doit être un nombre décimal positif'),
  
  // Articles can come as a JSON string (multipart/form-data) or as an array.
  // We parse and validate here and normalize req.body.articles to an array.
  body('articles').custom((value, { req }) => {
    // TEMP DEBUG: log incoming shapes to diagnose missing articles issues
    try {
      console.debug('DEBUG validateCommande - articles raw type:', typeof value);
      console.debug('DEBUG validateCommande - content-type:', req.headers && req.headers['content-type']);
      console.debug('DEBUG validateCommande - req.body keys:', Object.keys(req.body || {}));
      console.debug('DEBUG validateCommande - req.file present:', !!req.file);
    } catch (e) {
      // ignore debug logging errors
    }

    let arr = value;
    // If multipart/form-data, multer provides strings — parse if necessary
    if (typeof arr === 'string') {
      try {
        arr = JSON.parse(arr);
      } catch (err) {
        throw new Error('Format invalide pour les articles. Doit être un tableau JSON.');
      }
      req.body.articles = arr;
    }

    // Accept array or array-like objects (some multipart parsers produce objects with numeric keys)
    if (!Array.isArray(arr)) {
      if (arr && typeof arr === 'object' && Number.isFinite(Number(arr.length))) {
        // convert array-like object to real array
        const len = Number(arr.length);
        const converted = [];
        for (let i = 0; i < len; i++) {
          if (Object.prototype.hasOwnProperty.call(arr, i)) converted.push(arr[i]);
        }
        arr = converted;
        req.body.articles = arr;
      }
    }

    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('La commande doit contenir au moins un article');
    }

    try {
      console.debug('DEBUG validateCommande - articles normalized type:', typeof arr, 'length:', arr.length);
    } catch (e) {}

    // Validate each article item
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (a.produit_id === undefined || a.produit_id === null || a.produit_id === '') {
        throw new Error(`articles.${i}.produit_id manquant`);
      }
      if (!Number.isFinite(Number(a.produit_id))) {
        throw new Error(`articles.${i}.produit_id doit être un nombre`);
      }

      if (a.quantite === undefined || a.quantite === null || a.quantite === '') {
        throw new Error(`articles.${i}.quantite manquante`);
      }
      const q = Number(a.quantite);
      if (!Number.isInteger(q) || q < 1) {
        throw new Error(`articles.${i}.quantite doit être au moins 1`);
      }
    }

    return true;
  }),
  
  handleValidationErrors
];

/**
 * Validations pour la newsletter
 */
const validateNewsletter = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  
  handleValidationErrors
];

/**
 * Validations pour les paramètres d'ID
 */
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID invalide'),
  
  handleValidationErrors
];

/**
 * Validations pour la pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Le numéro de page doit être un entier positif'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateInscription,
  validateConnexion,
  validateForgotPassword,
  validateResetPassword,
  validateProfilUpdate,
  validateProduit,
  validateCommande,
  validateNewsletter,
  validateId,
  validatePagination
};
