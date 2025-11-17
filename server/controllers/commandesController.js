const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Commande = require('../models/commande');
const ArticlesCommande = require('../models/articles_commande');
const Produit = require('../models/produit');
const User = require('../models/user');
const { asyncHandler } = require('../middlewares/errorHandler');
const { 
  sendOrderConfirmation, 
  sendOrderStatusUpdate,
  sendNewOrderAdminEmail,
  sendOrderShippedEmail 
} = require('../config/gmail');
const { uploadPDFToFirebase, deletePDFFromFirebase } = require('../config/firebase');

/**
 * @desc    Générer un lien de téléchargement pour la facture
 * @route   GET /api/commandes/:id/facture/download
 * @access  Public (avec email) ou Private
 */
const getFactureDownloadLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Récupérer la commande
  const commande = await Commande.findByPk(id);

  if (!commande) {
    return res.status(404).json({ message: 'Commande introuvable' });
  }

  // Vérifier que la facture existe
  if (!commande.facture) {
    return res.status(404).json({ message: 'Aucune facture disponible pour cette commande' });
  }

  res.status(200).json({
    message: 'Lien de téléchargement généré',
    data: {
      commande_id: commande.id,
      facture_url: commande.facture,
      filename: `Facture_Commande_${commande.id}.pdf`
    }
  });
});

/**
 * Calcul des frais de livraison selon la méthode
 * @param {string} methode - Méthode de livraison
 * @param {string} wilaya - Wilaya de livraison
 * @returns {number} Frais de livraison
 */
const calculerFraisLivraison = (methode, wilaya) => {
  const tarifsBase = {
    domicile: 600,
    yalidine: 950,
    guepex: 950
  };

  if (!tarifsBase[methode]) {
    throw new Error('Méthode de livraison invalide');
  }

  // Frais supplémentaires pour certaines wilayas éloignées
  const wilayasEloignees = ['Tamanrasset', 'Adrar', 'Illizi', 'Tindouf'];
  const supplement = wilayasEloignees.includes(wilaya) ? 250 : 0;

  return tarifsBase[methode] + supplement;
};

const restockerArticlesCommande = async (commandeId, transaction = null) => {
  const articles = await ArticlesCommande.findAll({ where: { commande_id: commandeId }, transaction });

  await Promise.all(articles.map(async (article) => {
    await Produit.increment('stock', {
      by: article.quantite,
      where: { id: article.produit_id },
      transaction
    });
  }));
};

/**
 * @route   POST /api/commandes
 * @desc    Créer une nouvelle commande avec facture (PDF)
 * @access  Public (avec ou sans compte)
 */
const createCommande = asyncHandler(async (req, res) => {
  // Debug: Vérifier si req.user est défini
  console.log('DEBUG - req.user:', req.user);
  console.log('DEBUG - req.user?.id:', req.user?.id);
  console.log('DEBUG - req.file:', req.file);
  
  let {
    nom_complet,
    email,
    telephone,
    adresse_livraison,
    ville,
    code_postal,
    wilaya,
    frais_livraison,
    methode_livraison,
    prix_soumis,
    mode_livraison,
    articles,
    notes
  } = req.body;

  // Parser les articles si c'est une string JSON (multipart/form-data)
  if (typeof articles === 'string') {
    try {
      articles = JSON.parse(articles);
    } catch (error) {
      res.status(400);
      throw new Error('Format invalide pour les articles. Doit être un tableau JSON.');
    }
  }

  // Vérifier qu'une facture a été uploadée
  if (!req.file) {
    res.status(400);
    throw new Error('La facture (PDF) est requise pour créer une commande');
  }

  // Vérifier et parser les frais de livraison.
  // The frais_livraison must be provided by the client. We do NOT compute it server-side.
  const fraisLivraison = parseInt(frais_livraison, 10);
  if (frais_livraison === undefined || frais_livraison === null || isNaN(fraisLivraison) || fraisLivraison < 0) {
    res.status(400);
    throw new Error('Les frais de livraison sont requis et doivent être un nombre positif');
  }

  // Parser le prix soumis (sous-total envoyé par le frontend)
  const prixSoumis = parseFloat(prix_soumis);
  if (isNaN(prixSoumis) || prixSoumis < 0.01) {
    res.status(400);
    throw new Error('Le prix soumis est requis et doit être un nombre décimal positif');
  }

  // Vérifier qu'il y a des articles
  if (!articles || articles.length === 0) {
    res.status(400);
    throw new Error('La commande doit contenir au moins un article');
  }

  // Transaction pour garantir la cohérence
  const transaction = await sequelize.transaction();

  try {
    // 1. Vérifier la disponibilité et calculer le sous-total
      // 1. Préparer les détails des articles à partir des données envoyées par le frontend
      // Le backend fait confiance aux prix envoyés (prix_unitaire) mais vérifie la disponibilité et réserve le stock.
      let sous_total = 0; // sera remplacé par prixSoumis ensuite
      const articlesAvecDetails = [];

      // Construire les lignes d'articles depuis le frontend
      for (const a of articles) {
        const prixUnitaire = parseFloat(a.prix_unitaire);
        const quantite = parseInt(a.quantite, 10) || 0;

        articlesAvecDetails.push({
          produit_id: a.produit_id,
          nom_produit: a.nom_produit || null, // on essaiera de combler avec le nom DB si absent
          prix_unitaire: prixUnitaire,
          quantite: quantite,
          taille: a.taille || null,
          couleur: a.couleur || null,
          sous_total: parseFloat((prixUnitaire * quantite).toFixed(2))
        });
      }

      // Vérifier l'existence et la disponibilité des produits, puis réserver (décrémenter) le stock
      for (const art of articlesAvecDetails) {
        const produit = await Produit.findByPk(art.produit_id, { transaction });
        if (!produit) {
          await transaction.rollback();
          res.status(404);
          throw new Error(`Produit avec ID ${art.produit_id} non trouvé`);
        }

        // Si le frontend n'a pas fourni le nom, récupérer depuis la base
        if (!art.nom_produit) art.nom_produit = produit.nom;

        if (produit.en_rupture) {
          await transaction.rollback();
          res.status(400);
          throw new Error(`Le produit ${produit.nom} est en rupture de stock`);
        }

        if (produit.stock < art.quantite) {
          await transaction.rollback();
          res.status(400);
          throw new Error(`Stock insuffisant pour ${produit.nom}. Stock disponible: ${produit.stock}`);
        }

        // Réserver le stock (décrémenter)
        await Produit.decrement('stock', {
          by: art.quantite,
          where: { id: art.produit_id },
          transaction
        });
      }
    

  // 2. Utiliser le sous-total fourni par le frontend (prixSoumis)
  // Correction: sous_total = prixSoumis (reçu du front), total = prixSoumis + fraisLivraison
  sous_total = prixSoumis;
  const total = prixSoumis + fraisLivraison;

    // 3. Upload facture PDF to Firebase Storage
    console.log('📤 Uploading PDF to Firebase Storage...');
    console.log(`📄 File: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);
    
    const factureUrl = await uploadPDFToFirebase(req.file.buffer, req.file.originalname);
    
    console.log('✅ PDF uploaded successfully to Firebase!');
    console.log(`🔗 Firebase URL: ${factureUrl}`);

    // 4. Créer la commande avec la facture
    const commande = await Commande.create({
      user_id: req.user?.id || null,
      nom_complet,
      email,
      telephone,
      adresse_livraison,
      ville,
      code_postal,
      wilaya,
      methode_livraison: methode_livraison || null,
      mode_livraison: mode_livraison || null,
      frais_livraison: fraisLivraison,
      sous_total: sous_total,
      total: total,
      prix_soumis: prixSoumis,
      notes,
      facture: factureUrl, // URL Firebase de la facture uploadée
      statut: 'en_attente' // Nouveau statut: en attente de confirmation admin
    }, { transaction });

    // 5. Créer les articles de commande
    const articlesCommande = articlesAvecDetails.map(article => ({
      ...article,
      commande_id: commande.id
    }));

    await ArticlesCommande.bulkCreate(articlesCommande, { transaction });

    // NOTE: Le backend ne modifie plus le stock ici — le frontend / un autre processus doit gérer la gestion des stocks si nécessaire.

    // Commit de la transaction
    await transaction.commit();

    // 6. Récupérer la commande complète
    const commandeComplete = await Commande.findByPk(commande.id, {
      include: [
        {
          model: ArticlesCommande,
          as: 'articles',
          include: [
            {
              model: Produit,
              as: 'produit',
              attributes: ['id', 'nom', 'image_avant']
            }
          ]
        }
      ]
    });

    // 7. Formater les données pour les emails
    const commandeData = {
      ...commandeComplete.toJSON(),
      articles: commandeComplete.articles.map(a => ({
        nom_produit: a.nom_produit || a.produit?.nom,
        quantite: a.quantite,
        prix_unitaire: a.prix_unitaire,
        prix_total: a.sous_total,
        taille: a.taille,
        couleur: a.couleur
      }))
    };

    // 8. Envoyer l'email à l'admin (non bloquant)
    sendNewOrderAdminEmail(commandeData).catch(err => {
      console.error('⚠️ Erreur envoi email admin:', err.message);
    });

    // 9. Envoyer l'email de confirmation au client avec la facture (non bloquant)
    // Pass the raw uploaded PDF buffer so SendGrid attaches it directly rather than fetching the file.
    sendOrderConfirmation(commandeComplete.email, commandeData, factureUrl, req.file.buffer, req.file.originalname).catch(err => {
      console.error('⚠️ Erreur envoi email confirmation client:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès. En attente de confirmation.',
      data: commandeComplete
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * @route   GET /api/commandes/:id
 * @desc    Récupérer une commande par ID
 * @access  Public (avec email) ou Private (utilisateur propriétaire)
 */
const getCommandeById = asyncHandler(async (req, res) => {
  const commande = await Commande.findByPk(req.params.id, {
    include: [
      {
        model: ArticlesCommande,
        as: 'articles',
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['id', 'nom', 'image_avant', 'categorie']
          }
        ]
      }
    ]
  });

  if (!commande) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier les droits d'accès
  const email = req.query.email || req.user?.email;
  const isOwner = req.user?.id === commande.user_id;
  const isAdmin = req.user?.est_admin;
  const emailMatch = email && email === commande.email;

  if (!isOwner && !isAdmin && !emailMatch) {
    res.status(403);
    throw new Error('Accès non autorisé à cette commande');
  }

  res.json({
    success: true,
    data: commande
  });
});

/**
 * @route   GET /api/commandes
 * @desc    Récupérer les commandes de l'utilisateur connecté
 * @access  Private
 */
const getMesCommandes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows: commandes } = await Commande.findAndCountAll({
    where: { user_id: req.user.id },
    include: [
      {
        model: ArticlesCommande,
        as: 'articles',
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['id', 'nom', 'image_avant']
          }
        ]
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['date_creation', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      commandes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * @route   GET /api/admin/commandes
 * @desc    Récupérer toutes les commandes (Admin)
 * @access  Private/Admin
 */
const getAllCommandes = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    statut,
    search,
    date_debut,
    date_fin
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  if (statut) {
    where.statut = statut;
  }

  if (search) {
    where[Op.or] = [
      { nom_complet: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { telephone: { [Op.like]: `%${search}%` } },
      { id: { [Op.like]: `%${search}%` } }
    ];
  }

  if (date_debut || date_fin) {
    where.date_creation = {};
    if (date_debut) where.date_creation[Op.gte] = new Date(date_debut);
    if (date_fin) where.date_creation[Op.lte] = new Date(date_fin);
  }

  const { count, rows: commandes } = await Commande.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email'],
        required: false // ✅ Allow orders with NULL user_id
      },
      {
        model: ArticlesCommande,
        as: 'articles',
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['id', 'nom', 'image_avant']
          }
        ]
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['date_creation', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      commandes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * @route   PATCH /api/admin/commandes/:id/statut
 * @desc    Mettre à jour le statut d'une commande (Admin)
 * @access  Private/Admin
 */
const updateStatutCommande = asyncHandler(async (req, res) => {
  const { statut, numero_suivi } = req.body;

  if (!statut) {
    res.status(400);
    throw new Error('Le nouveau statut est requis');
  }

  const commande = await Commande.findByPk(req.params.id);

  if (!commande) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Nouveaux statuts valides
  const statutsValides = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'];
  if (!statutsValides.includes(statut)) {
    res.status(400);
    throw new Error('Statut invalide. Statuts acceptés: ' + statutsValides.join(', '));
  }

  const statutPrecedent = commande.statut;
  const updateData = {
    statut,
    date_mise_a_jour: new Date()
  };

  if (numero_suivi !== undefined) {
    updateData.numero_suivi = numero_suivi;
  }

  if (statut === 'livree') {
    updateData.date_livraison = new Date();
  }

  await commande.update(updateData);

  // Restockage si annulation
  if (statut === 'annulee' && statutPrecedent !== 'annulee') {
    await restockerArticlesCommande(commande.id);
  }

  // Récupérer la commande complète
  const commandeActualisee = await Commande.findByPk(commande.id, {
    include: [
      {
        model: ArticlesCommande,
        as: 'articles',
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['id', 'nom', 'image_avant']
          }
        ]
      }
    ]
  });

  // Formater les données pour les emails
  const commandeData = {
    ...commandeActualisee.toJSON(),
    articles: commandeActualisee.articles.map(a => ({
      nom_produit: a.nom_produit || a.produit?.nom,
      quantite: a.quantite,
      prix_unitaire: a.prix_unitaire,
      prix_total: a.sous_total,
      taille: a.taille,
      couleur: a.couleur
    }))
  };

  // Envoyer les emails appropriés selon le changement de statut (non bloquant)
  if (statut === 'expediee' && statutPrecedent !== 'expediee') {
    // Email d'expédition au client
    sendOrderShippedEmail(commandeData).catch(err => {
      console.error('⚠️ Erreur envoi email expédition:', err.message);
    });
  } else if (statut !== statutPrecedent) {
    // Email de mise à jour de statut générique pour autres changements
    sendOrderStatusUpdate(commandeActualisee.email, commandeData).catch(err => {
      console.error('⚠️ Erreur envoi email mise à jour commande:', err.message);
    });
  }

  res.json({
    success: true,
    message: 'Statut de la commande mis à jour',
    data: commandeActualisee || commande
  });
});

const updateStatutCommandeUtilisateur = asyncHandler(async (req, res) => {
  const { statut } = req.body;

  if (!statut) {
    res.status(400);
    throw new Error('Le nouveau statut est requis');
  }

  const statutNormalise = statut.toLowerCase();
  if (statutNormalise !== 'annulee') {
    res.status(400);
    throw new Error('Un utilisateur ne peut définir le statut que sur "annulee".');
  }

  const commande = await Commande.findByPk(req.params.id, {
    include: [
      {
        model: ArticlesCommande,
        as: 'articles',
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['id', 'nom', 'image_avant']
          }
        ]
      }
    ]
  });

  if (!commande) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  if (commande.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Vous ne pouvez mettre à jour que vos propres commandes');
  }

  if (['expediee', 'livree'].includes(commande.statut)) {
    res.status(400);
    throw new Error('Cette commande ne peut plus être annulée.');
  }

  if (commande.statut === 'annulee') {
    return res.json({
      success: true,
      message: 'La commande est déjà annulée',
      data: commande
    });
  }

  await commande.update({
    statut: 'annulee',
    date_mise_a_jour: new Date()
  });

  await restockerArticlesCommande(commande.id);

  const commandeActualisee = await Commande.findByPk(commande.id, {
    include: [
      {
        model: ArticlesCommande,
        as: 'articles',
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['id', 'nom', 'image_avant']
          }
        ]
      }
    ]
  });

  if (commandeActualisee) {
    sendOrderStatusUpdate(commandeActualisee.email, commandeActualisee).catch((err) => {
      console.error('Erreur envoi email annulation commande (utilisateur):', err);
    });
  }

  res.json({
    success: true,
    message: 'Commande annulée avec succès',
    data: commandeActualisee || commande
  });
});

const supprimerCommande = asyncHandler(async (req, res) => {
  const commande = await Commande.findByPk(req.params.id);

  if (!commande) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  if (commande.statut !== 'annulee') {
    res.status(400);
    throw new Error('Seules les commandes annulées peuvent être supprimées');
  }

  if (commande.facture) {
    await deletePDFFromFirebase(commande.facture).catch((err) => {
      console.warn('Suppression facture échouée:', err);
    });
  }

  await ArticlesCommande.destroy({ where: { commande_id: commande.id } });
  await commande.destroy();

  res.json({
    success: true,
    message: 'Commande supprimée avec succès'
  });
});

module.exports = {
  createCommande,
  getCommandeById,
  getMesCommandes,
  getAllCommandes,
  updateStatutCommande,
  updateStatutCommandeUtilisateur,
  supprimerCommande,
  getFactureDownloadLink
};
