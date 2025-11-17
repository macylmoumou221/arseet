const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/user');
const Newsletter = require('../models/newsletter');
const { asyncHandler } = require('../middlewares/errorHandler');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../config/gmail');

const DEFAULT_RESET_CODE_MINUTES = 60;

const getResetCodeExpirationMinutes = () => {
  const envValue = parseInt(process.env.RESET_PASSWORD_CODE_EXPIRATION_MINUTES, 10);
  if (Number.isFinite(envValue) && envValue > 0) {
    return envValue;
  }
  return DEFAULT_RESET_CODE_MINUTES;
};

/**
 * Génère un code de vérification à 8 chiffres
 * @returns {string} Code de vérification
 */
const generateVerificationCode = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

/**
 * Génère un token JWT
 * @param {number} userId - ID de l'utilisateur
 * @returns {string} Token JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * @route   POST /api/auth/inscription
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
const inscription = asyncHandler(async (req, res) => {
  const { nom, prenom, email, mot_de_passe, telephone, adresse, ville, code_postal } = req.body;

  // Vérifier si l'email existe déjà
  const userExiste = await User.findOne({ where: { email } });

  if (userExiste) {
    res.status(409);
    throw new Error('Cet email est déjà utilisé');
  }

  // Générer un code de vérification à 8 chiffres
  const codeVerification = generateVerificationCode();
  const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Créer l'utilisateur (non vérifié)
  const user = await User.create({
    nom,
    prenom,
    email,
    mot_de_passe,
    telephone,
    adresse,
    ville,
    code_postal,
    email_verifie: false,
    code_verification: codeVerification,
    code_verification_expiration: codeExpiration
  });

  if (user) {
    // Envoyer l'email de confirmation avec le code via Gmail API
    try {
      await sendVerificationEmail(email, nom, prenom, codeVerification);
      console.log(`✅ Email de confirmation envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      // Ne pas bloquer l'inscription même si l'email échoue
      console.log(`🔢 Code de vérification (pour test): ${codeVerification}`);
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Un code de vérification à 8 chiffres a été envoyé à votre adresse email.',
      data: {
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          adresse: user.adresse,
          ville: user.ville,
          code_postal: user.code_postal,
          est_admin: user.est_admin,
          email_verifie: user.email_verifie
        },
        // Ne pas donner de token avant vérification email
        requiresEmailVerification: true
      }
    });
  } else {
    res.status(400);
    throw new Error('Données utilisateur invalides');
  }
});

/**
 * @route   POST /api/auth/connexion
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
const connexion = asyncHandler(async (req, res) => {
  const { email, mot_de_passe } = req.body;

  // Récupérer l'utilisateur avec le mot de passe
  const user = await User.findOne({ 
    where: { email },
    attributes: { include: ['mot_de_passe'] }
  });

  if (!user) {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect');
  }

  // Vérifier si le compte est actif
  if (!user.est_actif) {
    res.status(403);
    throw new Error('Compte désactivé. Contactez l\'administrateur');
  }

  // Vérifier si l'email est confirmé
  if (!user.email_verifie) {
    res.status(403);
    throw new Error('Veuillez confirmer votre email avec le code de vérification reçu avant de vous connecter.');
  }

  // Vérifier le mot de passe
  const motDePasseValide = await user.comparePassword(mot_de_passe);

  if (!motDePasseValide) {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect');
  }

  // Mettre à jour la dernière connexion
  await user.update({ derniere_connexion: new Date() });

  // Générer le token
  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        ville: user.ville,
        code_postal: user.code_postal,
        est_admin: user.est_admin,
        derniere_connexion: user.derniere_connexion
      },
      token
    }
  });
});

/**
 * @route   GET /api/auth/profil
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
const getProfil = asyncHandler(async (req, res) => {
  // req.user est ajouté par authMiddleware
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Check if user is subscribed to newsletter
  const newsletterSubscription = await Newsletter.findOne({
    where: { 
      email: user.email,
      est_actif: true
    }
  });

  res.json({
    success: true,
    data: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
      ville: user.ville,
      code_postal: user.code_postal,
      est_admin: user.est_admin,
      date_creation: user.date_creation,
      derniere_connexion: user.derniere_connexion,
      est_abonne_newsletter: !!newsletterSubscription
    }
  });
});

/**
 * @route   PUT /api/auth/profil
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
const updateProfil = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  const { nom, prenom, email, telephone, adresse, ville, code_postal, mot_de_passe } = req.body;

  // Vérifier si l'email est déjà utilisé par un autre utilisateur
  if (email && email !== user.email) {
    const emailExiste = await User.findOne({ where: { email } });
    if (emailExiste) {
      res.status(409);
      throw new Error('Cet email est déjà utilisé');
    }
  }

  // Mise à jour des champs
  const updateData = {
    nom: nom || user.nom,
    prenom: prenom || user.prenom,
    email: email || user.email,
    telephone: telephone !== undefined ? telephone : user.telephone,
    adresse: adresse !== undefined ? adresse : user.adresse,
    ville: ville !== undefined ? ville : user.ville,
    code_postal: code_postal !== undefined ? code_postal : user.code_postal
  };

  // Si un nouveau mot de passe est fourni
  if (mot_de_passe) {
    updateData.mot_de_passe = mot_de_passe;
  }

  await user.update(updateData);

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
      ville: user.ville,
      code_postal: user.code_postal,
      est_admin: user.est_admin
    }
  });
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Vérifier l'email avec le code à 8 chiffres
 * @access  Public
 */
const verifierEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error('L\'email et le code de vérification sont requis');
  }

  // Vérifier que le code contient exactement 8 chiffres
  if (!/^\d{8}$/.test(code)) {
    res.status(400);
    throw new Error('Le code de vérification doit contenir exactement 8 chiffres');
  }

  // Trouver l'utilisateur avec cet email et ce code
  const user = await User.findOne({
    where: {
      email,
      code_verification: code,
      email_verifie: false
    }
  });

  if (!user) {
    res.status(400);
    throw new Error('Code de vérification invalide ou email déjà vérifié');
  }

  // Vérifier si le code n'est pas expiré
  if (new Date() > user.code_verification_expiration) {
    res.status(400);
    throw new Error('Le code de vérification a expiré. Veuillez demander un nouveau code.');
  }

  // Marquer l'email comme vérifié
  await user.update({
    email_verifie: true,
    code_verification: null,
    code_verification_expiration: null
  });

  // Envoyer email de bienvenue via Gmail API
  try {
    await sendWelcomeEmail(user.email, user.nom, user.prenom);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
  }

  // Générer un token JWT pour connecter l'utilisateur automatiquement
  const jwtToken = generateToken(user.id);

  res.json({
    success: true,
    message: 'Email vérifié avec succès ! Vous êtes maintenant connecté.',
    data: {
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        email_verifie: user.email_verifie
      },
      token: jwtToken
    }
  });
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Renvoyer le code de vérification
 * @access  Public
 */
const renvoyerVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('L\'email est requis');
  }

  // Trouver l'utilisateur
  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.status(404);
    throw new Error('Aucun utilisateur trouvé avec cet email');
  }

  if (user.email_verifie) {
    res.status(400);
    throw new Error('Cet email est déjà vérifié');
  }

  // Générer un nouveau code de vérification
  const codeVerification = generateVerificationCode();
  const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await user.update({
    code_verification: codeVerification,
    code_verification_expiration: codeExpiration
  });

  // Envoyer l'email via Gmail API
  try {
    await sendVerificationEmail(email, user.nom, user.prenom, codeVerification);
    console.log(`✅ Code de vérification renvoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    console.log(`🔢 Code de vérification (pour test): ${codeVerification}`);
    res.status(500);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }

  res.json({
    success: true,
    message: 'Un nouveau code de vérification à 8 chiffres a été envoyé par email'
  });
});

/**
 * @route   POST /api/auth/password/forgot
 * @desc    Demande de réinitialisation de mot de passe
 * @access  Public
 */
const demanderReinitialisationMotDePasse = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const genericMessage = 'Si un compte existe pour cet email, un code de réinitialisation a été envoyé.';

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.json({
      success: true,
      message: genericMessage
    });
  }

  const resetCode = generateVerificationCode();
  const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  const expirationMinutes = getResetCodeExpirationMinutes();
  const expiration = new Date(Date.now() + expirationMinutes * 60 * 1000);

  await user.update({
    reset_password_code: hashedCode,
    reset_password_expiration: expiration
  });

  try {
    await sendPasswordResetEmail(user.email, user.nom, user.prenom, resetCode, {
      expirationMinutes
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
  }

  res.json({
    success: true,
    message: genericMessage
  });
});

/**
 * @route   POST /api/auth/password/reset
 * @desc    Réinitialiser le mot de passe via token
 * @access  Public
 */
const reinitialiserMotDePasse = asyncHandler(async (req, res) => {
  const { email, code, mot_de_passe } = req.body;

  if (!code || !email || !mot_de_passe) {
    res.status(400);
    throw new Error('Informations de réinitialisation manquantes');
  }

  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  const user = await User.findOne({
    where: {
      email,
      reset_password_code: hashedCode,
      reset_password_expiration: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    res.status(400);
    throw new Error('Code de réinitialisation invalide ou expiré');
  }

  await user.update({
    mot_de_passe,
    reset_password_code: null,
    reset_password_expiration: null
  });

  res.json({
    success: true,
    message: 'Mot de passe mis à jour avec succès'
  });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Changer le mot de passe avec l'ancien mot de passe
 * @access  Private
 */
const changerMotDePasse = asyncHandler(async (req, res) => {
  const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

  // Validation
  if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
    res.status(400);
    throw new Error('L\'ancien et le nouveau mot de passe sont requis');
  }

  if (nouveau_mot_de_passe.length < 6) {
    res.status(400);
    throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères');
  }

  // Récupérer l'utilisateur avec le mot de passe
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifier l'ancien mot de passe
  const isMatch = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe);

  if (!isMatch) {
    res.status(401);
    throw new Error('L\'ancien mot de passe est incorrect');
  }

  // Vérifier que le nouveau mot de passe est différent
  const isSamePassword = await bcrypt.compare(nouveau_mot_de_passe, user.mot_de_passe);

  if (isSamePassword) {
    res.status(400);
    throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
  }

  // Mettre à jour le mot de passe (le hook beforeUpdate s'occupera du hashing)
  await user.update({
    mot_de_passe: nouveau_mot_de_passe
  });

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès'
  });
});

module.exports = {
  inscription,
  connexion,
  getProfil,
  updateProfil,
  verifierEmail,
  renvoyerVerification,
  demanderReinitialisationMotDePasse,
  reinitialiserMotDePasse,
  changerMotDePasse
};
